import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateBuyCompletionEmailHTML, generateAdminBuyNotificationHTML } from "../../nowpayments/email-templates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "Saldopedia.co@gmail.com";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingOrders = await sql`
      SELECT * FROM orders 
      WHERE nowpayments_payout_id IS NOT NULL 
        AND status NOT IN ('completed', 'failed', 'cancelled', 'expired')
        AND transaction_type = 'buy'
        AND paid_with_saldo = true
      ORDER BY created_at ASC
      LIMIT 20
    `;

    if (pendingOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No pending payouts to check",
        checked: 0 
      });
    }

    console.log(`Checking ${pendingOrders.length} pending payout orders...`);

    let updated = 0;
    let completed = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      try {
        console.log(`Checking payout for order ${order.order_id}, payout ID: ${order.nowpayments_payout_id}`);
        
        const payoutStatus = await nowpaymentsClient.getPayoutStatus(order.nowpayments_payout_id);
        
        const withdrawal = payoutStatus.withdrawals?.[0];
        const status = withdrawal?.status || payoutStatus.status;
        const hash = withdrawal?.hash;
        const error = withdrawal?.error;

        console.log(`Order ${order.order_id}: payout status = ${status}`);

        if (status !== order.payout_status) {
          await sql`
            UPDATE orders
            SET 
              payout_status = ${status},
              payout_hash = ${hash || null},
              payout_error = ${error || null},
              updated_at = NOW()
            WHERE order_id = ${order.order_id}
          `;
          updated++;
        }

        if ((status === "FINISHED" || status === "finished") && order.status !== "completed") {
          await sql`
            UPDATE orders 
            SET status = 'completed', updated_at = NOW()
            WHERE order_id = ${order.order_id}
          `;

          console.log(`Order ${order.order_id} marked as completed via cron check`);

          try {
            await sendBuyCompletionEmail(order, hash);
            await sendAdminBuyNotification(order, hash, withdrawal?.amount?.toString(), withdrawal?.currency, withdrawal?.address);
          } catch (emailError) {
            console.error("Failed to send completion emails:", emailError);
          }

          completed++;
        } else if (status === "FAILED" || status === "failed" || status === "REJECTED" || status === "rejected") {
          if (order.status !== "failed") {
            await sql`
              UPDATE orders 
              SET status = 'failed', updated_at = NOW()
              WHERE order_id = ${order.order_id}
            `;

            if (order.user_id && order.amount_idr) {
              const amountIdr = parseFloat(order.amount_idr.toString());
              await sql`
                UPDATE users 
                SET saldo = saldo + ${amountIdr}, updated_at = NOW()
                WHERE id = ${order.user_id}
              `;
              console.log(`Refunded ${amountIdr} to user ${order.user_id}`);
            }

            failed++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (orderError) {
        console.error(`Error checking order ${order.order_id}:`, orderError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${pendingOrders.length} orders`,
      checked: pendingOrders.length,
      updated,
      completed,
      failed
    });
  } catch (error) {
    console.error("Check pending payouts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendBuyCompletionEmail(order: any, txHash?: string) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const cryptoAmount = parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const walletAddress = order.wallet_address || "";
    
    sendSmtpEmail.subject = `Order Selesai - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateBuyCompletionEmailHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      cryptoSymbol,
      cryptoAmount,
      walletAddress,
      txHash
    });
    
    sendSmtpEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: order.customer_email, 
      name: order.customer_name 
    }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Completion email sent to ${order.customer_email}`);
  } catch (emailError) {
    console.error("Failed to send completion email:", emailError);
  }
}

async function sendAdminBuyNotification(order: any, txHash?: string, payoutAmount?: string, payoutCurrency?: string, payoutAddress?: string) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const cryptoAmount = parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const amountIdr = parseFloat(order.amount_idr?.toString() || "0");
    const walletAddress = order.wallet_address || payoutAddress || "";
    
    sendSmtpEmail.subject = `[ADMIN] BELI Crypto Sukses - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateAdminBuyNotificationHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      userId: order.user_id,
      cryptoSymbol,
      cryptoAmount,
      amountIdr,
      walletAddress,
      txHash,
      payoutAmount,
      payoutCurrency,
      completedAt: new Date()
    });
    
    sendSmtpEmail.sender = { 
      name: "Saldopedia System", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: ADMIN_EMAIL, 
      name: "Admin Saldopedia" 
    }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Admin notification sent to ${ADMIN_EMAIL}`);
  } catch (emailError) {
    console.error("Failed to send admin notification:", emailError);
  }
}
