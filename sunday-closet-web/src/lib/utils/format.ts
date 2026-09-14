// src/lib/utils/format.ts

/**
 * Formats a number as Argentine pesos (ARS).
 * e.g. 18500 → "$18.500"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
