// src/lib/algorithms/recommendations.ts
import { Product } from "@/lib/data/mockProducts";

/**
 * "Podría gustarte"
 * Filtra productos del mismo `tipo` OR del mismo `estilo`.
 * Excluye el producto actual y los vendidos.
 */
export function getPodiaGustarte(
  current: Product,
  all: Product[]
): Product[] {
  return all.filter(
    (p) =>
      p.id !== current.id &&
      p.estado !== "vendido" &&
      p.visibleEnWeb &&
      (p.tipo === current.tipo || p.estilo === current.estilo)
  );
}

/**
 * "Combina tu prenda"
 * Cross-selling por categoría opuesta, mismo estilo Y misma talla.
 * - superior  → muestra inferiores
 * - inferior  → muestra superiores
 * - accesorio → muestra superiores e inferiores que coincidan
 */
export function getCombinaTuPrenda(
  current: Product,
  all: Product[]
): Product[] {
  const opposites: Record<Product["categoriaRopa"], Product["categoriaRopa"][]> = {
    superior: ["inferior"],
    inferior: ["superior"],
    accesorio: ["superior", "inferior"],
  };

  const targetCategories = opposites[current.categoriaRopa];

  return all.filter(
    (p) =>
      p.id !== current.id &&
      p.estado !== "vendido" &&
      p.visibleEnWeb &&
      targetCategories.includes(p.categoriaRopa) &&
      p.estilo === current.estilo &&
      p.talla === current.talla
  );
}
