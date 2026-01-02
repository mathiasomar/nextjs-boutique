"use client";

import { checkPaymentStatus } from "@/app/actions/payment";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";

interface PaymentStatusProps {
  paymentId: string;
}

export function PaymentStatusSection({ paymentId }: PaymentStatusProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: () => checkPaymentStatus(paymentId),
    refetchInterval: (query) => {
      // Stop polling if payment is completed
      return query?.status === "PENDING" ? 5000 : false;
    },
    enabled: !!paymentId,
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Checking status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
          data?.status
        )}`}
      >
        Status: {data?.status || "PENDING"}
      </div>

      {data?.receipt && (
        <div className="text-sm">
          <strong>Receipt:</strong> {data.receipt}
        </div>
      )}

      {data?.message && (
        <div className="text-sm text-gray-600">{data.message}</div>
      )}

      {data?.status === "PENDING" && (
        <Button onClick={() => refetch()}>Refresh Status</Button>
      )}
    </div>
  );
}
