// lib/categoryClassifier.ts

export type ClothingCategory =
  | 'superior'
  | 'inferior'
  | 'vestido'
  | 'abrigo'
  | 'accesorio'
  | 'otros';

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  superior: 'Tops & Blusas',
  inferior: 'Prendas Inferiores',
  vestido: 'Vestidos',
  abrigo: 'Abrigos & Blazers',
  accesorio: 'Accesorios',
  otros: 'Otros',
};

export const CATEGORY_DICTIONARIES: Record<Exclude<ClothingCategory, 'otros'>, string[]> = {
  inferior: [
    'pantalon',
    'pantalones',
    'pants',
    'jogger',
    'joggers',
    'cargo',
    'jeans',
    'mezclilla',
    'denim',
    'falda',
    'minifalda',
    'maxifalda',
    'short',
    'shorts',
    'bermuda',
    'capri',
    'leggins',
    'leggings',
    'biker',
    'skort',
    'culotte',
    'palazzo',
    'chandal',
    'sweatpants',
    'trousers',
    'bottom',
  ],
  superior: [
    'top',
    'blusa',
    'playera',
    't-shirt',
    'tee',
    'camisa',
    'camiseta',
    'body',
    'bodysuit',
    'corset',
    'corse',
    'bustier',
    'crop',
    'tank',
    'halter',
    'chaleco',
    'sueter',
    'sweater',
    'cardigan',
    'sudadera',
    'hoodie',
    'crewneck',
    'polo',
    'basica',
    'camisola',
    'strapless',
    'tube',
  ],
  vestido: [
    'maxi vestido',
    'mini vestido',
    'slip dress',
    'vestido',
    'dress',
    'jumper',
    'enterizo',
    'jumpsuit',
    'romper',
    'overol',
    'conjunto',
    'set',
  ],
  abrigo: [
    'cardigan pesado',
    'abrigo',
    'chamarra',
    'chaqueta',
    'jacket',
    'blazer',
    'gabardina',
    'trench',
    'rompevientos',
    'windbreaker',
    'bomber',
    'cazadora',
    'puffer',
    'sobrecamisa',
  ],
  accesorio: [
    'bolso',
    'bolsa',
    'bag',
    'tote',
    'crossbody',
    'mochila',
    'gorra',
    'cap',
    'hat',
    'sombrero',
    'beanie',
    'cinturon',
    'cinto',
    'lentes',
    'gafas',
    'accesorio',
    'joyeria',
    'collar',
    'aretes',
    'calcetas',
  ],
};

/**
 * Normaliza texto a minúsculas y sin acentos/diacríticos.
 */
export function normalizeForCategory(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesKeywordList(normalizedInput: string, keywords: string[]): boolean {
  if (!normalizedInput) return false;
  for (const kw of keywords) {
    const normKw = normalizeForCategory(kw);
    if (!normKw) continue;
    const escaped = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:s|es)?(?:$|[^a-z0-9])`, 'i');
    if (regex.test(normalizedInput)) {
      return true;
    }
  }
  return false;
}

/**
 * Clasifica estrictamente el Tipo de Prenda (Columna C) en su categoría correspondiente.
 * Si no coincide con ninguna palabra clave de los diccionarios, devuelve estrictamente 'otros'.
 */
export function classifyGarmentCategory(tipoPrenda: string | null | undefined): ClothingCategory {
  const normalized = normalizeForCategory(tipoPrenda);
  if (!normalized) return 'otros';

  if (matchesKeywordList(normalized, CATEGORY_DICTIONARIES.abrigo)) {
    return 'abrigo';
  }

  if (matchesKeywordList(normalized, CATEGORY_DICTIONARIES.vestido)) {
    return 'vestido';
  }

  if (matchesKeywordList(normalized, CATEGORY_DICTIONARIES.accesorio)) {
    return 'accesorio';
  }

  const inferiorNouns = CATEGORY_DICTIONARIES.inferior.filter(
    (k) => k !== 'mezclilla' && k !== 'denim'
  );
  if (matchesKeywordList(normalized, inferiorNouns)) {
    return 'inferior';
  }

  if (matchesKeywordList(normalized, CATEGORY_DICTIONARIES.superior)) {
    return 'superior';
  }

  if (matchesKeywordList(normalized, ['mezclilla', 'denim'])) {
    return 'inferior';
  }

  return 'otros';
}
