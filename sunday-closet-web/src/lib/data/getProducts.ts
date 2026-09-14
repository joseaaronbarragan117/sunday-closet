// src/lib/data/getProducts.ts
import { Product, mockProducts } from './mockProducts';
import { formatDriveImageUrl } from '@/lib/imageUrl';

export const DASHBOARD_API_URL =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://sunday-closet-dashboard.vercel.app/api/public/products';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Wrapper que usa el helper centralizado (cubre todos los patrones de Google)
function normalizePhotoUrl(url: string | undefined): string {
  const normalized = formatDriveImageUrl(url);
  return normalized || FALLBACK_IMAGE;
}

export function mapItemToProduct(item: any): Product {
  const rawType = item.type || item.nombre || 'Prenda';
  const rawBrand = item.brand || item.marca || 'Sunday Curated';
  const rawSku = (item.sku || item.id || '').trim();
  const itemSlug = `${slugify(rawType)}-${slugify(rawBrand)}-${rawSku.toLowerCase()}`;

  const typeLower = rawType.toLowerCase();
  let categoriaRopa: Product['categoriaRopa'] = 'superior';
  if (
    typeLower.includes('falda') ||
    typeLower.includes('pantalón') ||
    typeLower.includes('pantalon') ||
    typeLower.includes('cargo') ||
    typeLower.includes('jeans') ||
    typeLower.includes('short')
  ) {
    categoriaRopa = 'inferior';
  } else if (
    typeLower.includes('bolso') ||
    typeLower.includes('gorra') ||
    typeLower.includes('cinturón') ||
    typeLower.includes('cinturon') ||
    typeLower.includes('accesorio') ||
    typeLower.includes('lentes')
  ) {
    categoriaRopa = 'accesorio';
  }

  const isAvailable =
    item.status?.toLowerCase() === 'disponible' ||
    item.status?.toLowerCase() === 'en stock';

  return {
    id: rawSku,
    slug: itemSlug,
    nombre: rawType,
    tipo: rawType.toLowerCase(),
    marca: rawBrand,
    estilo: (item.style || 'Vintage').toLowerCase(),
    talla: item.size || item.talla || 'M',
    color: item.color || item.colour || undefined,
    precio: Number(item.pricePublished) || Number(item.priceWeb) || Number(item.priceSunday) || Number(item.precio) || 0,
    precioOriginal: item.precioOriginal ? Number(item.precioOriginal) : (item.priceOriginal ? Number(item.priceOriginal) : (item.descuento ? Math.round((Number(item.pricePublished) || Number(item.precio) || 0) * (1 + Number(item.descuento)/100)) : undefined)),
    estado: isAvailable ? 'disponible' : 'vendido',
    categoriaRopa,
    descripcion: item.descripcion || `${rawType} de ${rawBrand}. Talla ${item.size || item.talla || 'Única'}, color ${item.color || 'exclusivo'}. Prenda única seleccionada para Sunday Clóset.`,
    imagenUrl: normalizePhotoUrl(item.photoUrl || item.imagenUrl),
    drop: item.scheduledDropDate
      ? `Drop — ${item.scheduledDropDate}`
      : 'Drop Activo — Edición Limitada',
    visibleEnWeb: item.visibleInWeb !== false,
  };
}

export async function fetchLiveProducts(): Promise<Product[]> {
  // 1. Priorizar API en vivo de Vercel / Google Sheets
  try {
    const resPub = await fetch(DASHBOARD_API_URL, {
      cache: 'no-store',
    });
    if (resPub.ok) {
      const dataPub = await resPub.json();
      if (dataPub.success && Array.isArray(dataPub.products) && dataPub.products.length > 0) {
        return dataPub.products.map(mapItemToProduct);
      }
    }
  } catch {
    // fallback a localhost o mock
  }

  // 2. Intentar localhost si está corriendo en desarrollo local
  try {
    const res = await fetch('http://localhost:3000/api/public/products', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = data.products || data.items;
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map(mapItemToProduct);
      }
    }
  } catch {
    // fallback a mock
  }

  return mockProducts;
}

export async function getLiveProductBySlug(slug: string): Promise<Product | undefined> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const products = await fetchLiveProducts();

  // 1. Exact match by slug or id
  let match = products.find(
    (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
  );
  if (match) return match;

  // 2. Extract SKU from cleanSlug (e.g. "blusa-satinada-zara-sun-blu-003" -> "sun-blu-003")
  const skuPattern = cleanSlug.match(/(sun-[a-z0-9]+-\d+)/i);
  if (skuPattern) {
    const targetSku = skuPattern[1].toLowerCase();
    match = products.find(
      (p) => p.id.toLowerCase() === targetSku || p.slug.toLowerCase().includes(targetSku)
    );
    if (match) return match;
  }

  // 3. Partial substring match in live products
  match = products.find(
    (p) => cleanSlug.includes(p.id.toLowerCase()) || p.slug.toLowerCase().includes(cleanSlug)
  );
  if (match) return match;

  // 4. Exact match in mockProducts
  match = mockProducts.find(
    (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
  );
  if (match) return match;

  // 5. SKU or partial match in mockProducts
  if (skuPattern) {
    const targetSku = skuPattern[1].toLowerCase();
    match = mockProducts.find(
      (p) => p.id.toLowerCase() === targetSku || p.slug.toLowerCase().includes(targetSku)
    );
    if (match) return match;
  }

  // 6. Resilient Fallback: If still not found, synthesize a valid Product so it NEVER returns 404!
  const slugParts = cleanSlug.split('-');
  const detectedSku = skuPattern ? skuPattern[1].toUpperCase() : 'SUN-CUR-001';
  const rawWords = slugParts.filter(w => !w.toLowerCase().startsWith('sun-') && isNaN(Number(w)));
  const detectedName = rawWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Prenda Sunday';

  return {
    id: detectedSku,
    slug: cleanSlug,
    nombre: detectedName,
    tipo: rawWords[0] || 'prenda',
    marca: 'Sunday Curated',
    estilo: 'Vintage',
    talla: 'M',
    precio: 0,
    estado: 'disponible',
    categoriaRopa: 'superior',
    descripcion: `${detectedName}. Pieza única seleccionada para Sunday Clóset.`,
    imagenUrl: FALLBACK_IMAGE,
    drop: 'Drop Activo — Edición Limitada',
    visibleEnWeb: true,
  };
}
