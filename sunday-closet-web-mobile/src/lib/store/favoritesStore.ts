// src/lib/store/favoritesStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/data/mockProducts";

interface FavoritesState {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (product) => {
        const exists = get().favorites.some((p) => p.id === product.id);
        if (exists) {
          set((s) => ({
            favorites: s.favorites.filter((p) => p.id !== product.id),
          }));
        } else {
          set((s) => ({
            favorites: [...s.favorites, product],
          }));
        }
      },

      isFavorite: (productId) => {
        return get().favorites.some((p) => p.id === productId);
      },

      clearFavorites: () => set({ favorites: [] }),

      count: () => get().favorites.length,
    }),
    {
      name: "sunday-mobile-favorites",
    }
  )
);
