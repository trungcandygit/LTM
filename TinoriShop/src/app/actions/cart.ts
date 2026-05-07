"use strict";
"use server";

import { prisma } from "@/lib/prisma";

export async function validateCartItems(itemIds: { productId: string; variantId?: string }[]) {
  if (itemIds.length === 0) return [];

  const productIds = Array.from(new Set(itemIds.map(i => i.productId)));
  const variantIds = Array.from(new Set(itemIds.filter(i => i.variantId).map(i => i.variantId!)));

  const activeProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      active: true,
    },
    select: { id: true },
  });

  const activeVariants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      active: true,
    },
    select: { id: true },
  });

  const activeProductIds = new Set(activeProducts.map(p => p.id));
  const activeVariantIds = new Set(activeVariants.map(v => v.id));

  // Return items that are NO LONGER valid
  return itemIds.filter(item => {
    if (!activeProductIds.has(item.productId)) return true;
    if (item.variantId && !activeVariantIds.has(item.variantId)) return true;
    return false;
  });
}
