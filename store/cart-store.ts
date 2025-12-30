import { CartStoreActionsType, CartStoreStateType } from "@/app/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set) => ({
      cart: [],
      hasHydrated: false,
      addToCart: (product) =>
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (p) =>
              p.id === product.id.toString() &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor
          );

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingIndex]!.quantity += product.quantity || 1;
            const total =
              updatedCart[existingIndex]!.price *
              updatedCart[existingIndex]!.quantity;
            const discountPrice =
              (total * updatedCart[existingIndex]!.discout) / 100;
            const priceAfterDiscount = total - discountPrice;
            updatedCart[existingIndex]!.totalPrice = priceAfterDiscount;
            return { cart: updatedCart };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...product,
                productId: product.id.toString(),
                quantity: product.quantity || 1,
                selectedSize: product.selectedSize,
                selectedColor: product.selectedColor,
                discout: product.discout || 0,
                totalPrice: product.totalPrice,
              },
            ],
          };
        }),
      removeFromCart: (product) =>
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              !(
                p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor
              )
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

export default useCartStore;
