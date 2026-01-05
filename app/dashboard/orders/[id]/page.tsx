"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AlertCircle } from "lucide-react";
import { format, formatISO } from "date-fns";
import { useParams } from "next/navigation";
import { UserProfileSkeleton } from "@/components/loaders/user-profile-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOrder } from "@/hooks/use-order";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditOrder from "@/components/edit-order";
import PaymentForm from "@/components/payment-form";

const OrderPage = () => {
  const { id } = useParams();
  // const result = await getuser(id);

  // if (!result) {
  //   notFound();
  // }

  // const user = result;

  const { data, isLoading, error } = useOrder(id as string);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error as string}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dasboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/orders">Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                data?.order?.orderNumber || "Test ORD-23e1816"
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {isLoading ? (
        <UserProfileSkeleton />
      ) : (
        <div className="mt-4 flex flex-col xl:flex-row gap-8">
          {/* LEFT */}
          <div className="w-full xl:w-1/3 space-y-6">
            {/* INFORMATION CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Order Information</h1>
                <EditOrder orderId={id as string} />
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Customer:</span>
                  <span>
                    {data?.order?.customer?.firstName || "Test Customer"}{" "}
                    {data?.order?.customer?.lastName || "Test Customer"}(
                    {data?.order?.customer?.email || "Test Customer"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Order Number:</span>
                  <span className="font-bold text-lg">
                    {data?.order?.orderNumber || "Test ORD-23e1816"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Order Status:</span>
                  <span
                    className={cn(
                      "p-1 rounded-md w-max text-xs",
                      data?.order?.status === "DRAFT"
                        ? "bg-green-500/40"
                        : data?.order?.status === "PENDING"
                        ? "bg-yellow-500/40"
                        : data?.order?.status === "PROCESSING" ||
                          data?.order?.status === "SHIPPED"
                        ? "bg-orange-500/70"
                        : data?.order?.status === "DELIVERED" ||
                          data?.order?.status === "CONFIRMED"
                        ? "bg-green-500/70"
                        : "bg-red-500/40"
                    )}
                  >
                    {
                      (data?.order?.status
                        .toLowerCase()
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ") || "") as string
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Payment Status:</span>
                  <span
                    className={cn(
                      "p-1 rounded-md w-max text-xs",
                      data?.order?.paymentStatus === "PENDING"
                        ? "bg-yellow-500/40"
                        : data?.order?.paymentStatus === "PARTIAL"
                        ? "bg-orange-500/70"
                        : data?.order?.paymentStatus === "COMPLETED"
                        ? "bg-green-500/70"
                        : "bg-red-500/40"
                    )}
                  >
                    {
                      (data?.order?.paymentStatus
                        .toLowerCase()
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ") || "") as string
                    }
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <span className="font-bold">Sub Total:</span>
                  <span>
                    Ksh.
                    {data?.order?.subtotal.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Tax:</span>
                  <span>
                    Ksh.
                    {data?.order?.tax.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Discount:</span>
                  <span>
                    Ksh.
                    {data?.order?.discount.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Total Payable:</span>
                  <span>
                    Ksh.
                    {data?.order?.total.toFixed(2) || 0}
                  </span>
                </div> */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-blue-700">
                    Ksh.{data?.order?.total.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Paid:</span>
                  <span className="text-green-800 font-bold">
                    Ksh.{data?.order?.paid.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Balance:</span>
                  <span className="text-orange-600 font-bold">
                    Ksh.{data?.order?.balance.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Created At:</span>
                  <span>
                    {formatISO(data?.order?.orderDate ?? new Date(), {
                      representation: "date",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Update At:</span>
                  <span>
                    {formatISO(data?.order?.updatedAt ?? new Date(), {
                      representation: "date",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Estimated Delivery Date:</span>
                  <span>
                    {data?.order?.estimatedDelivery
                      ? formatISO(
                          data?.order?.estimatedDelivery ?? new Date(),
                          {
                            representation: "date",
                          }
                        )
                      : "No Delivery Date"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Delivery Date:</span>
                  <span>
                    {data?.order?.deliveredAt
                      ? formatISO(data?.order?.deliveredAt ?? new Date(), {
                          representation: "date",
                        })
                      : "Not Delivered"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Cancelled On:</span>
                  <span>
                    {data?.order?.cancelledAt
                      ? formatISO(data?.order?.cancelledAt ?? new Date(), {
                          representation: "date",
                        })
                      : "Not Cancelled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Notes:</span>
                  <span>{data?.order?.notes || "No Notes"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="w-full xl:w-2/3 space-y-6">
            {/* THE CHART CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <h1 className="text-xl font-semibold">Order Items</h1>
              <Table>
                <TableCaption>A list of your order items</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Selected Size</TableHead>
                    <TableHead>Selected Color</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(data?.order?.items) ? (
                    data?.order?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product.sku}
                        </TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.selectedSize}</TableCell>
                        <TableCell>{item.selectedColor}</TableCell>
                        <TableCell>Ksh.{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          Ksh.{item.totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No order items.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5}>Total</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      Ksh.
                      {data?.order?.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5}>Tax</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      Ksh.
                      {data?.order?.tax.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5}>Discout</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      Ksh.
                      {data?.order?.discount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5}>Grand Total</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      Ksh.
                      {data?.order?.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="bg-primary-foreground p-4 rounded-lg mt-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Payments</h1>
                <PaymentForm orderId={id as string} />
              </div>
              <Table>
                <TableCaption>A list of Payments</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Trasaction ID</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Processed By</TableHead>
                    <TableHead>Processed At</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(data?.order?.payments) ? (
                    data?.order?.payments.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell className="font-medium">
                          {pay.transactionId}
                        </TableCell>
                        <TableCell>{pay.method}</TableCell>
                        <TableCell>{pay.status}</TableCell>
                        <TableCell>{pay.processedBy}</TableCell>
                        <TableCell>
                          {format(pay.processedAt, "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          ksh.{pay.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No payments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>Grand Total</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      Ksh.
                      {data?.order?.payments
                        ? data.order.payments
                            .reduce((acc, pay) => acc + pay.amount, 0)
                            .toFixed(2)
                        : "0.00"}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
