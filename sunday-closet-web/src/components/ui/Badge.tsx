// src/components/ui/Badge.tsx
"use client";

import { ProductStatus } from "@/lib/data/mockProducts";

const CONFIG: Record<ProductStatus, { label: string; color: string }> = {
  disponible: { label: "Disponible",  color: "bg-[#4B8C5A] text-white" },
  vendido:    { label: "Sold Out",    color: "bg-[#0A0A0A] text-white" },
  en_carrito: { label: "Reservado",   color: "bg-[#C8A882] text-[#0A0A0A]" },
};

interface BadgeProps {
  status: ProductStatus;
  size?: "sm" | "md";
}

export default function Badge({ status, size = "md" }: BadgeProps) {
  const { label, color } = CONFIG[status];
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`${color} ${textSize} font-body font-light tracking-widest uppercase px-2.5 py-0.5 rounded-xs`}
    >
      {label}
    </span>
  );
}
