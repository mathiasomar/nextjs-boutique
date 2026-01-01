"use client";

import { Product } from "@/generated/prisma/client";
import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import useCartStore from "@/store/cart-store";
import toast from "react-hot-toast";
import { CartItemType } from "@/app/types";
import { Input } from "./ui/input";

const ProductItem = ({ product }: { product: Product }) => {
  const [selectedSize, setSelectedSize] = useState(product.size[0]);
  const [selectedColor, setSelectedColor] = useState(product.color[0]);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();

  // Convert Decimal to number for cart
  const getPriceAsNumber = () => {
    if (typeof product.price === "number") {
      return product.price;
    }

    // If it's a Decimal, string, or other type
    try {
      return Number(product.price);
    } catch {
      return 0;
    }
  };

  const handleAddToCart = () => {
    const priceNumber = getPriceAsNumber();

    const total = priceNumber * quantity;

    addToCart({
      ...product,
      productId: product.id,
      quantity: 1,
      selectedSize,
      selectedColor,
      price: priceNumber,
      totalPrice: total,
    } as CartItemType);

    toast.success("Product Added to Cart");
  };
  return (
    <Item variant="outline">
      <ItemContent>
        <div className="flex items-center gap-2">
          <ItemMedia>
            <Image
              src={
                (product.images as Record<string, string>)?.[
                  product.color[0]
                ] || "/noimage.png"
              }
              alt=""
              width={80}
              height={80}
            />
          </ItemMedia>
          <div className="flex flex-col gap-2">
            <ItemTitle>
              {product.name} ({product.sku})
            </ItemTitle>
            <ItemDescription className="flex flex-col lg:flex-row gap-6">
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Price:</span>
                  <span>Ksh.{product.price.toFixed(2)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Stock:</span>
                  <span>{product.currentStock}</span>
                </span>
              </span>
              <span className="flex flex-col gap-4">
                <span className="flex items-center gap-2">
                  <span className="text-sm min-w-10">Size:</span>
                  <Select
                    value={selectedSize}
                    defaultValue={product.size[0]}
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.size.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm min-w-10">Color:</span>
                  <Select
                    value={selectedColor}
                    defaultValue={product.size[0]}
                    onValueChange={setSelectedColor}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.color.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </span>
                <span className="flex items-center gap-2">
                  <label>Quantity</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </span>
              </span>
            </ItemDescription>
          </div>
        </div>
      </ItemContent>
      <ItemActions>
        {product.currentStock > 0 ? (
          <Button variant="outline" size="sm" onClick={handleAddToCart}>
            Add
          </Button>
        ) : (
          <Badge variant={"destructive"}>Out Of Stock</Badge>
        )}
      </ItemActions>
    </Item>
  );
};

export default ProductItem;
