"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { validateCartItems } from "@/app/actions/cart";

export default function CartSync() {
  const { items, removeItem } = useCart();

  useEffect(() => {
    const syncCart = async () => {
      if (items.length === 0) return;

      const itemsToValidate = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId
      }));

      try {
        const invalidItems = await validateCartItems(itemsToValidate);
        
        if (invalidItems.length > 0) {
          // Remove invalid items from cart
          invalidItems.forEach(invalid => {
            const itemToRemove = items.find(i => 
              i.productId === invalid.productId && 
              i.variantId === invalid.variantId
            );
            if (itemToRemove) {
              removeItem(itemToRemove.id);
            }
          });
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    };

    syncCart();
    // Only run on mount to avoid infinite loops if removeItem triggers re-render 
    // (though removeItem is stable from zustand)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
