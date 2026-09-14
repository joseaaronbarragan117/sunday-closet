import { CalculatedPrices } from '@/types/inventory';

/**
 * Calculates auto sale prices for Sunday Clóset based on base garment cost.
 * Rules:
 * - Sunday: Cost / 0.3
 * - Web: Sunday * 1.2
 * - FB: Cost * 2
 * - Paca: Cost * 1.3
 */
export function calculatePrices(cost: number): CalculatedPrices {
  if (cost <= 0 || isNaN(cost)) {
    return {
      priceSunday: 0,
      priceWeb: 0,
      priceFB: 0,
      pricePaca: 0,
    };
  }

  const priceSunday = Math.round(cost / 0.3);
  const priceWeb = Math.round(priceSunday * 1.2);
  const priceFB = Math.round(cost * 2);
  const pricePaca = Math.round(cost * 1.3);

  return {
    priceSunday,
    priceWeb,
    priceFB,
    pricePaca,
  };
}
