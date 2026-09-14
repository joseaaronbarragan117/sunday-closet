// src/lib/store/cartStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/data/mockProducts";

export interface CartItem {
  product: Product;
  addedAt: number; // timestamp
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product) => {
        const exists = get().items.find((i) => i.product.id === product.id);
        if (exists) return; // already in cart

        set((s) => ({
          items: [...s.items, { product, addedAt: Date.now() }],
          isOpen: true,
        }));

        // TODO (Phase 2): Fire webhook to set product status → "en_carrito" in Sheets
      },

      removeItem: (productId) => {
        set((s) => ({
          items: s.items.filter((i) => i.product.id !== productId),
        }));
        // TODO (Phase 2): Fire webhook to restore product status → "disponible"
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.product.precio, 0),

      count: () => get().items.length,
    }),
    {
      name: "sunday-closet-cart",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
