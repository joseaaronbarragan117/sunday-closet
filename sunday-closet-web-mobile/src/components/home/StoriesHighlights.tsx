// src/components/home/StoriesHighlights.tsx
"use client";

import React from "react";

interface StoryItem {
  id: string;
  label: string;
  emoji: string;
  categoryFilter?: string;
  isNew?: boolean;
}

const STORIES: StoryItem[] = [
  { id: "drop", label: "Nuevo Drop", emoji: "✨", isNew: true },
  { id: "superior", label: "Tops & Blusas", emoji: "👚", categoryFilter: "superior" },
  { id: "inferior", label: "Pantalones", emoji: "👖", categoryFilter: "inferior" },
  { id: "vestidos", label: "Vestidos", emoji: "👗", categoryFilter: "superior" },
  { id: "accesorio", label: "Bolsos & Más", emoji: "👜", categoryFilter: "accesorio" },
  { id: "vintage", label: "90s Vintage", emoji: "🏷️" },
  { id: "circular", label: "Moda Circular", emoji: "🌿" },
];

interface StoriesHighlightsProps {
  selectedFilter: string | null;
  onSelectCategory: (filter: string | null) => void;
}

export const StoriesHighlights: React.FC<StoriesHighlightsProps> = ({
  selectedFilter,
  onSelectCategory,
}) => {
  return (
    <section className="w-full py-3 bg-[#F7F6F2] border-b border-[#E5E3DD]/60">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
        {STORIES.map((story) => {
          const isSelected =
            story.categoryFilter && selectedFilter === story.categoryFilter;

          return (
            <button
              key={story.id}
              onClick={() => {
                if (story.categoryFilter) {
                  onSelectCategory(isSelected ? null : story.categoryFilter);
                }
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none pressable"
            >
              {/* Story Ring */}
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-gradient-to-tr from-[#C2A78C] via-[#A88C72] to-[#1F1F1F] ring-2 ring-[#C2A78C] ring-offset-2 ring-offset-[#F7F6F2]"
                    : story.isNew
                    ? "bg-gradient-to-tr from-[#C2A78C] via-amber-400 to-rose-400 p-[2px]"
                    : "border-2 border-[#E5E3DD] bg-white group-hover:border-[#C2A78C]"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                  <span className="group-hover:scale-110 transition-transform">
                    {story.emoji}
                  </span>
                </div>

                {story.isNew && (
                  <span className="absolute -bottom-1 bg-rose-500 text-white font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full border border-white">
                    Drop
                  </span>
                )}
              </div>

              {/* Story Label */}
              <span
                className={`text-[11px] text-center max-w-[72px] truncate transition-colors ${
                  isSelected
                    ? "font-semibold text-[#1F1F1F]"
                    : "font-normal text-[#5A5852]"
                }`}
              >
                {story.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
