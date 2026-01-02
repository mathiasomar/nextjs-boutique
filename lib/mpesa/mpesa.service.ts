import axios from "axios";

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
  description?: string;
}

export interface MpesaResponse {
  success: boolean;
  message: string;
  data?: {
    checkoutId: string;
    merchantRequestId: string;
    responseDescription: string;
  };
  error?: string;
}

class MpesaService {
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private businessShortCode: string;
  private passkey: string;
  private callbackURL: string;

  constructor() {
    this.baseURL =
      process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
    this.consumerKey = process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET!;
    this.businessShortCode = process.env.NEXT_PUBLIC_MPESA_SHORTCODE!;
    this.passkey = process.env.NEXT_PUBLIC_MPESA_PASSKEY!;
    this.callbackURL = process.env.MPESA_CALLBACK_URL!;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString("base64");

      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private getPassword(timestamp: string): string {
    const data = `${this.businessShortCode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString("base64");
  }

  async initiateSTKPush(
    paymentData: MpesaPaymentRequest
  ): Promise<MpesaResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.getPassword(timestamp);

      const phoneNumber = paymentData.phoneNumber.replace(/\D/g, "");
      const formattedPhone = phoneNumber.startsWith("0")
        ? `254${phoneNumber.substring(1)}`
        : phoneNumber.startsWith("+")
        ? phoneNumber.substring(1)
        : phoneNumber;

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: paymentData.amount,
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackURL,
        AccountReference: paymentData.reference.substring(0, 12), // Max 12 chars
        TransactionDesc: paymentData.description || "Payment",
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.ResponseCode === "0") {
        return {
          success: true,
          message: "STK Push sent successfully",
          data: {
            checkoutId: result.CheckoutRequestID,
            merchantRequestId: result.MerchantRequestID,
            responseDescription: result.ResponseDescription,
          },
        };
      } else {
        return {
          success: false,
          message: result.ResponseDescription || "Failed to send STK Push",
          error: result.ResponseDescription,
        };
      }
    } catch (error: any) {
      console.error("Error initiating STK Push:", error);

      let errorMessage = "Failed to initiate payment";
      if (error.response?.data) {
        errorMessage =
          error.response.data.errorMessage ||
          JSON.stringify(error.response.data);
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message,
      };
    }
  }

  async checkPaymentStatus(checkoutId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.getPassword(timestamp);

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutId,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }
}

export const mpesaService = new MpesaService();
