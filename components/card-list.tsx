import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import prisma from "@/lib/prisma";

// const latestTransactions = [
//   {
//     id: 1,
//     title: "Order Payment",
//     badge: "John Doe",
//     image:
//       "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800",
//     count: 1400,
//   },
//   {
//     id: 2,
//     title: "Order Payment",
//     badge: "Jane Smith",
//     image:
//       "https://images.pexels.com/photos/4969918/pexels-photo-4969918.jpeg?auto=compress&cs=tinysrgb&w=800",
//     count: 2100,
//   },
//   {
//     id: 3,
//     title: "Order Payment",
//     badge: "Michael Johnson",
//     image:
//       "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800",
//     count: 1300,
//   },
//   {
//     id: 4,
//     title: "Order Payment",
//     badge: "Lily Adams",
//     image:
//       "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800",
//     count: 2500,
//   },
//   {
//     id: 5,
//     title: "Order Payment",
//     badge: "Sam Brown",
//     image:
//       "https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=800",
//     count: 1400,
//   },
// ];

const CardList = async ({ title }: { title: string }) => {
  const [products, orders] = await Promise.all([
    // Fetch popular products from your data source

    prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.findMany({
      take: 5,
      include: {
        createdByUser: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Recent Products"
          ? products.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <Image
                    src={
                      (item.images as Record<string, string>)?.[
                        item.color[0]
                      ] || ""
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-0">
                  Ksh{item.price.toFixed(2)}
                </CardFooter>
              </Card>
            ))
          : orders.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                {/* <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <Image
                    src={
                      item.createdByUser?.image ||
                      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800"
                    }
                    alt={item.createdByUser?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div> */}
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.orderNumber}
                  </CardTitle>
                  <Badge variant={"secondary"}>
                    Created By: {item.createdByUser?.name}
                  </Badge>
                </CardContent>
                <CardFooter className="p-0">
                  Ksh{Number(item.total) / 1000}K
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
