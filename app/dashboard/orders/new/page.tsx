"use client";

import CartItem from "@/components/cart-item";
import OrderCheckout from "@/components/order-checkout";
import ProductSelectItems from "@/components/product-select-items";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useCartStore from "@/store/cart-store";

// const steps = [
//   {
//     id: 1,
//     title: "Select Product",
//   },
//   {
//     id: 2,
//     title: "Details",
//   },
//   {
//     id: 3,
//     title: "Payment",
//   },
// ];

const NewOrder = () => {
  // const searchParams = useSearchParams();
  // const router = useRouter();

  // const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart } = useCartStore();

  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/orders">Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* <div className="my-4 flex items-center justify-center gap-10">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "w-fit px-4 py-2 rounded-full bg-gray-400 text-white text-sm",
              activeStep === step.id && "bg-primary"
            )}
          >
            {step.title}
          </div>
        ))}
      </div> */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Products Here</CardTitle>
              {/* <CardAction>
                <Button variant="link">Sign Up</Button>
              </CardAction> */}
            </CardHeader>
            <CardContent>
              <ProductSelectItems />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">SKU</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length > 0 &&
                      cart.map((item) => (
                        <CartItem key={item.productId} product={item} />
                      ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6}>Grand Total</TableCell>
                      <TableCell className="text-right" colSpan={2}>
                        Ksh.
                        {cart
                          .reduce((acc, item) => acc + item.totalPrice, 0)
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
                {cart.length === 0 && <p className="text-center">No Items</p>}
              </ScrollArea>
            </CardContent>
            <CardFooter>{cart.length > 0 && <OrderCheckout />}</CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
