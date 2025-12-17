import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateBuyCompletionEmailHTML, generateAdminBuyNotificationHTML } from "../email-templates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "Saldopedia.co@gmail.com";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    const orderResult = await sql`
      SELECT * FROM orders 
      WHERE order_id = ${orderId}
      LIMIT 1
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    if (!order.nowpayments_payout_id) {
      return NextResponse.json(
        { success: false, error: "Order has no payout ID" },
        { status: 400 }
      );
    }

    if (order.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: "Order already completed",
        order: {
          orderId: order.order_id,
          status: order.status,
          payoutStatus: order.payout_status,
          payoutHash: order.payout_hash,
        }
      });
    }

    console.log(`Checking payout status for order ${orderId}, payout ID: ${order.nowpayments_payout_id}`);

    const payoutStatus = await nowpaymentsClient.getPayoutStatus(order.nowpayments_payout_id);
    
    console.log(`Payout status response:`, JSON.stringify(payoutStatus, null, 2));

    const withdrawal = payoutStatus.withdrawals?.[0];
    const status = withdrawal?.status || payoutStatus.status;
    const hash = withdrawal?.hash;
    const error = withdrawal?.error;

    await sql`
      UPDATE orders
      SET 
        payout_status = ${status},
        payout_hash = ${hash || null},
        payout_error = ${error || null},
        updated_at = NOW()
      WHERE order_id = ${orderId}
    `;

    if (status === "FINISHED" || status === "finished") {
      if (order.status !== "completed") {
        await sql`
          UPDATE orders 
          SET status = 'completed', updated_at = NOW()
          WHERE order_id = ${orderId}
        `;

        console.log(`Order ${orderId} marked as completed via manual check`);

        try {
          await sendBuyCompletionEmail(order, hash);
          await sendAdminBuyNotification(order, hash, withdrawal?.amount?.toString(), withdrawal?.currency, withdrawal?.address);
        } catch (emailError) {
          console.error("Failed to send completion emails:", emailError);
        }

        return NextResponse.json({
          success: true,
          message: "Order completed successfully",
          order: {
            orderId: order.order_id,
            status: 'completed',
            payoutStatus: status,
            payoutHash: hash,
          }
        });
      }
    } else if (status === "FAILED" || status === "failed" || status === "REJECTED" || status === "rejected") {
      if (order.status !== "failed") {
        await sql`
          UPDATE orders 
          SET status = 'failed', updated_at = NOW()
          WHERE order_id = ${orderId}
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

        return NextResponse.json({
          success: true,
          message: "Order failed, saldo refunded",
          order: {
            orderId: order.order_id,
            status: 'failed',
            payoutStatus: status,
            payoutError: error,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payout status updated",
      order: {
        orderId: order.order_id,
        status: order.status,
        payoutStatus: status,
        payoutHash: hash,
      }
    });
  } catch (error) {
    console.error("Check payout error:", error);
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
    const adminEmail = ADMIN_EMAIL;
    
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
      email: adminEmail, 
      name: "Admin Saldopedia" 
    }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Admin notification sent to ${adminEmail}`);
  } catch (emailError) {
    console.error("Failed to send admin notification:", emailError);
  }
}
