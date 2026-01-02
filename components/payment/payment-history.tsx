"use client";

import { useQuery } from "@tanstack/react-query";
import { PaymentStatus } from "./payment-status";
import { getPayments } from "@/app/actions/payment";

export function PaymentHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  if (error) {
    return <div>Error loading payments</div>;
  }

  const payments = data?.data || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {payment.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                KES {payment.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {payment.reference}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <PaymentStatus paymentId={payment.id} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {new Date(payment.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
