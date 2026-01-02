"use server";

import { revalidatePath } from "next/cache";
import { mpesaService, MpesaPaymentRequest } from "@/lib/mpesa/mpesa.service";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

export async function initiateMpesaPayment(
  formData: Prisma.PaymentUncheckedCreateInput
) {
  try {
    const phoneNumber = formData.phoneNumber as string;
    const amount = parseFloat(formData.amount as string);
    const reference = "NajTrendsBoutique";
    const orderId = formData.orderId as string;
    const method = formData.method as PaymentMethod;

    if (!phoneNumber || !amount) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        phoneNumber,
        amount,
        reference,
        status: "PENDING",
        method,
        transactionDate: new Date(),
      },
    });

    // Initiate M-Pesa STK Push
    const mpesaResponse = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount,
      reference,
      description: `Payment for ${reference}`,
    });

    if (mpesaResponse.success && mpesaResponse.data) {
      // Update payment with checkout ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          checkoutId: mpesaResponse.data.checkoutId,
          merchantRequestId: mpesaResponse.data.merchantRequestId,
        },
      });

      revalidatePath("/payments");

      return {
        success: true,
        message: mpesaResponse.message,
        checkoutId: mpesaResponse.data.checkoutId,
        paymentId: payment.id,
      };
    } else {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          resultDesc: mpesaResponse.message,
        },
      });

      return {
        success: false,
        message: mpesaResponse.message,
      };
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

export async function checkPaymentStatus(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || !payment.checkoutId) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    if (payment.status === "SUCCESS") {
      return {
        success: true,
        status: "SUCCESS",
        receipt: payment.mpesaReceiptNumber,
      };
    }

    // Query M-Pesa for status
    const statusResult = await mpesaService.checkPaymentStatus(
      payment.checkoutId
    );

    if (statusResult.ResultCode === "0") {
      // Payment successful
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          resultCode: statusResult.ResultCode,
          resultDesc: statusResult.ResultDesc,
          mpesaReceiptNumber: statusResult.MpesaReceiptNumber,
          transactionDate: new Date(),
        },
      });

      revalidatePath("/payments");

      return {
        success: true,
        status: "SUCCESS",
        receipt: statusResult.MpesaReceiptNumber,
      };
    } else {
      // Update based on result code
      const newStatus =
        statusResult.ResultCode === "1032" ? "CANCELLED" : "FAILED";

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          resultCode: statusResult.ResultCode,
          resultDesc: statusResult.ResultDesc,
        },
      });

      return {
        success: true,
        status: newStatus,
        message: statusResult.ResultDesc,
      };
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return {
      success: false,
      message: "Failed to check payment status",
    };
  }
}

export async function getPayments() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return { success: true, data: payments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, message: "Failed to fetch payments" };
  }
}
