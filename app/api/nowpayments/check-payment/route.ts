import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateSellCompletionEmailHTML, generateAdminSellNotificationHTML } from "../email-templates";

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

    if (!order.nowpayments_payment_id) {
      return NextResponse.json(
        { success: false, error: "Order has no payment ID" },
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
          paymentStatus: order.payment_status,
          actuallyPaid: order.actually_paid,
        }
      });
    }

    console.log(`Checking payment status for order ${orderId}, payment ID: ${order.nowpayments_payment_id}`);

    const paymentStatus = await nowpaymentsClient.getPaymentStatus(order.nowpayments_payment_id);
    
    console.log(`Payment status response:`, JSON.stringify(paymentStatus, null, 2));

    const status = paymentStatus.payment_status;
    const actuallyPaid = paymentStatus.actually_paid;

    await sql`
      UPDATE orders
      SET 
        payment_status = ${status},
        actually_paid = ${actuallyPaid?.toString() || null},
        updated_at = NOW()
      WHERE order_id = ${orderId}
    `;

    if (status === "finished" || status === "confirmed") {
      if (order.status !== "completed" && order.transaction_type === "sell" && order.user_id) {
        try {
          const expectedAmount = parseFloat(order.amount_input?.toString() || "0");
          const actuallyPaidAmount = parseFloat(actuallyPaid?.toString() || "0");
          const expectedAmountIdr = parseFloat(order.amount_idr?.toString() || "0");
          const rate = parseFloat(order.rate?.toString() || "0");
          
          let finalAmountIdr = expectedAmountIdr;
          let paymentNote = "exact";
          
          if (actuallyPaidAmount > 0 && expectedAmount > 0 && rate > 0) {
            const tolerance = 0.001;
            const difference = actuallyPaidAmount - expectedAmount;
            const percentDiff = Math.abs(difference) / expectedAmount;
            
            if (percentDiff > tolerance) {
              finalAmountIdr = actuallyPaidAmount * rate;
              paymentNote = difference > 0 ? "overpaid" : "underpaid";
            }
          }
          
          if (finalAmountIdr > 0) {
            await sql`BEGIN`;
            
            try {
              const creditResult = await sql`
                UPDATE orders 
                SET status = 'completed', 
                    amount_idr = ${finalAmountIdr.toFixed(2)},
                    payment_note = ${paymentNote},
                    updated_at = NOW()
                WHERE order_id = ${orderId} AND status != 'completed'
                RETURNING id
              `;
              
              if (creditResult.length > 0) {
                const updateResult = await sql`
                  UPDATE users 
                  SET saldo = saldo + ${finalAmountIdr}, updated_at = NOW()
                  WHERE id = ${order.user_id}
                  RETURNING id, email, saldo
                `;
                
                await sql`COMMIT`;
                
                if (updateResult.length > 0) {
                  const user = updateResult[0];
                  console.log(`Check Payment: AUTO CREDIT SALDO SUCCESS for order ${orderId}`);
                  console.log(`   Amount credited: Rp ${finalAmountIdr.toLocaleString('id-ID')}`);
                  
                  await sendSellCompletionEmail(order, user, finalAmountIdr, paymentNote, expectedAmount, actuallyPaidAmount);
                  await sendAdminSellNotification(order, user, finalAmountIdr, paymentNote, expectedAmount, actuallyPaidAmount);
                  
                  return NextResponse.json({
                    success: true,
                    message: "Order completed successfully",
                    order: {
                      orderId: order.order_id,
                      status: 'completed',
                      paymentStatus: status,
                      actuallyPaid: actuallyPaidAmount,
                    }
                  });
                }
              } else {
                await sql`ROLLBACK`;
              }
            } catch (txError) {
              await sql`ROLLBACK`;
              throw txError;
            }
          }
        } catch (creditError) {
          console.error(`Check Payment: Failed to auto-credit saldo:`, creditError);
        }
      }
    } else if (status === "failed" || status === "expired") {
      if (order.status !== "failed" && order.status !== "expired") {
        await sql`
          UPDATE orders 
          SET status = ${status}, updated_at = NOW()
          WHERE order_id = ${orderId}
        `;
        
        return NextResponse.json({
          success: true,
          message: `Order ${status}`,
          order: {
            orderId: order.order_id,
            status: status,
            paymentStatus: status,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
      order: {
        orderId: order.order_id,
        status: order.status,
        paymentStatus: status,
        actuallyPaid: actuallyPaid,
      }
    });
  } catch (error) {
    console.error("Check payment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendSellCompletionEmail(order: any, user: any, amountIdr: number, paymentNote: string = "exact", expectedAmount: number = 0, actuallyPaid: number = 0) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const cryptoAmount = actuallyPaid > 0 ? actuallyPaid : parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    
    sendSmtpEmail.subject = `Order Selesai - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateSellCompletionEmailHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      cryptoSymbol,
      cryptoAmount,
      amountIdr,
      paymentNote: paymentNote as 'exact' | 'overpaid' | 'underpaid',
      expectedAmount,
      actuallyPaid
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
    console.log(`Check Payment: Completion email sent to ${order.customer_email}`);
  } catch (emailError) {
    console.error("Check Payment: Failed to send completion email:", emailError);
  }
}

async function sendAdminSellNotification(order: any, user: any, amountIdr: number, paymentNote: string = "exact", expectedAmount: number = 0, actuallyPaidParam: number = 0) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    const adminEmail = ADMIN_EMAIL;
    
    const cryptoAmount = expectedAmount > 0 ? expectedAmount : parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const actuallyPaid = actuallyPaidParam > 0 ? actuallyPaidParam : parseFloat(order.actually_paid?.toString() || "0");
    const newSaldo = parseFloat(user.saldo?.toString() || "0");
    
    const paymentNoteLabel = paymentNote === "overpaid" ? " [OVERPAID]" : paymentNote === "underpaid" ? " [UNDERPAID]" : "";
    
    sendSmtpEmail.subject = `[ADMIN] JUAL Crypto Sukses${paymentNoteLabel} - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateAdminSellNotificationHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      userId: user.id,
      cryptoSymbol,
      expectedAmount: cryptoAmount,
      actuallyPaid,
      amountIdr,
      newSaldo,
      paymentNote: paymentNote as 'exact' | 'overpaid' | 'underpaid',
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
    console.log(`Check Payment: Admin notification sent to ${adminEmail}`);
  } catch (emailError) {
    console.error("Check Payment: Failed to send admin notification:", emailError);
  }
}
