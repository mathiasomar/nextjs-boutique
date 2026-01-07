import CardList from "@/components/card-list";
import { OrderStatusChart } from "@/components/dashboard/order-status";
// import TodoList from "@/components/todo-list";
import prisma from "@/lib/prisma";
import React from "react";
import { getOrderStatusSummary } from "../actions/order";
import { ProductPerformanceChart } from "@/components/dashboard/product-performance";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

const HomePage = async () => {
  // Fetch dashboard data
  const [orders, products, customers, lowStockProducts] = await Promise.all([
    prisma.order.findMany({
      take: 5,
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    }),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.product.findMany({
      where: {
        lowStockAlert: true,
        isActive: true,
      },
      take: 10,
    }),
  ]);

  const orderStatus = await getOrderStatusSummary();

  // const today = new Date();
  // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // const monthlySales = await prisma.order.aggregate({
  //   where: {
  //     orderDate: { gte: startOfMonth },
  //     paymentStatus: "COMPLETED",
  //   },
  //   _sum: { total: true },
  // });
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full grid grid-cols-4 gap-4">
        <div className="bg-primary-foreground border p-4 rounded-lg col-span-4 sm:col-span-2 md:col-span-1">
          <h2 className="text-sm text-muted-foreground">Total Products</h2>
          <p className="text-2xl font-semibold">{products}</p>
        </div>
        <div className="bg-primary-foreground border p-4 rounded-lg col-span-4 sm:col-span-2 md:col-span-1">
          <h2 className="text-sm text-muted-foreground">Total Orders</h2>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </div>
        <div className="bg-primary-foreground border p-4 rounded-lg col-span-4 sm:col-span-2 md:col-span-1">
          <h2 className="text-sm text-muted-foreground">Total Customers</h2>
          <p className="text-2xl font-semibold">{customers}</p>
        </div>
        <div className="bg-red-500 border-red-200 p-4 rounded-lg col-span-4 sm:col-span-2 md:col-span-1">
          <h2 className="text-sm text-gray-300">Low Stock Products</h2>
          <p className="text-2xl font-semibold text-white">
            {lowStockProducts.length}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <ProductPerformanceChart />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          <CardList title="Latest Orders" />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          <OrderStatusChart data={orderStatus} />
        </div>
        {/* <div className="bg-primary-foreground p-4 rounded-lg">
          <TodoList />
        </div> */}
        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          <CardList title="Recent Products" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
