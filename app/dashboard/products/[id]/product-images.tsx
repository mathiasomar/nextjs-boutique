"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({
  product,
}: {
  product: { images: Record<string, string>; colors: string[]; name?: string };
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  return (
    <div className="bg-primary-foreground p-4 rounded-lg">
      <h1 className="text-xl font-semibold">Product Images</h1>
      <div className="flex flex-col gap-2">
        <div className="w-full">
          <Card className="border-0 shadow-none bg-inherit">
            <CardContent>
              <Image
                src={
                  product.colors.length > 0
                    ? product.images?.[product.colors[currentImage]] ||
                      "/products/1g.p1"
                    : "/products/1g.p1"
                }
                alt={product.name || "Test Product"}
                width={800}
                height={400}
                className="w-full h-auto sm:w-1/2 rounded object-cover transition-all duration-500 ease-in-out"
              />
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap items-center flex-row gap-4 mt-4">
                {product.colors.map((color, index) => (
                  <div
                    key={color}
                    className="relative w-9 h-9"
                    onClick={() => setCurrentImage(index)}
                  >
                    <Image
                      src={product.images?.[color] || "/products/1g.p1"}
                      alt={product.name || "Test Product"}
                      fill
                      className="w-30 h-30 rounded object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
