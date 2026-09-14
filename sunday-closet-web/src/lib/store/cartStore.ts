// src/lib/store/cartStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/data/mockProducts";

export interface CartItem {
  product: Product;
  addedAt: number;
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
  isInCart: (productId: string) => boolean;

  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product) => {
        const exists = get().items.find((i) => i.product.id === product.id);
        if (exists) return;

        set((s) => ({
          items: [...s.items, { product, addedAt: Date.now() }],
          isOpen: true,
        }));
      },

      removeItem: (productId) => {
        set((s) => ({
          items: s.items.filter((i) => i.product.id !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      isInCart: (productId) => {
        return get().items.some((i) => i.product.id === productId);
      },

      total: () =>
        get().items.reduce((sum, i) => sum + i.product.precio, 0),

      count: () => get().items.length,
    }),
    {
      name: "sunday-mobile-cart",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
