import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // M-Pesa sends callback in this format
    const stkCallback = body.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({
        ResultCode: 1,
        ResultDesc: "Invalid callback",
      });
    }

    const checkoutId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find payment by checkout ID
    const payment = await prisma.payment.findFirst({
      where: { checkoutId },
    });

    if (!payment) {
      return NextResponse.json({
        ResultCode: 1,
        ResultDesc: "Payment not found",
      });
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata?.Item || [];

      const receiptItem = items.find(
        (item: any) => item.Name === "MpesaReceiptNumber"
      );
      const amountItem = items.find((item: any) => item.Name === "Amount");
      const phoneItem = items.find((item: any) => item.Name === "PhoneNumber");
      const dateItem = items.find(
        (item: any) => item.Name === "TransactionDate"
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          resultCode: resultCode.toString(),
          resultDesc,
          mpesaReceiptNumber: receiptItem?.Value,
          amount: amountItem?.Value || payment.amount,
          phoneNumber: phoneItem?.Value || payment.phoneNumber,
          transactionDate: dateItem?.Value
            ? new Date(
                parseInt(dateItem.Value.toString().substring(0, 4)),
                parseInt(dateItem.Value.toString().substring(4, 6)) - 1,
                parseInt(dateItem.Value.toString().substring(6, 8)),
                parseInt(dateItem.Value.toString().substring(8, 10)),
                parseInt(dateItem.Value.toString().substring(10, 12)),
                parseInt(dateItem.Value.toString().substring(12, 14))
              )
            : new Date(),
        },
      });
    } else {
      // Payment failed or cancelled
      const newStatus = resultCode === 1032 ? "CANCELLED" : "FAILED";

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          resultCode: resultCode.toString(),
          resultDesc,
        },
      });
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
    });
  } catch (error) {
    console.error("Error processing callback:", error);
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Error processing callback",
    });
  }
}
