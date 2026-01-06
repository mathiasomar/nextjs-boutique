"use client";

import { CartItemType } from "@/app/types";
import Image from "next/image";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import useCartStore from "@/store/cart-store";

const CartItem = ({ product }: { product: CartItemType }) => {
  const { removeFromCart } = useCartStore();
  return (
    <TableRow>
      <TableCell className="font-medium">{product.sku}</TableCell>
      <TableCell>
        <Image
          src={
            (product.images as Record<string, string>)?.[
              product.selectedColor
            ] || "/noimage.png"
          }
          alt=""
          width={30}
          height={30}
        />
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>{product.quantity}</TableCell>
      <TableCell>{product.price}</TableCell>
      <TableCell className="text-right">{product.totalPrice}</TableCell>
      <TableCell>
        <Button
          variant={"destructive"}
          size={"icon-sm"}
          onClick={() => removeFromCart(product)}
        >
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default CartItem;
