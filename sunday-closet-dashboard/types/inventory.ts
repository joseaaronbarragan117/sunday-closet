import { ClothingCategory } from '@/lib/categoryClassifier';

export type InventoryStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'Programado';

export type ItemStyle = 'Cute' | 'Vintage' | 'Casual';
export type ItemCondition = 'Nuevo c/etiqueta' | 'Nuevo s/etiqueta' | 'Con detalle';

export interface InventoryItem {
  sku: string;
  photoUrl: string;
  type: string;
  size: string;
  color: string;
  brand: string;
  style: ItemStyle;
  condition: ItemCondition;
  cost: number;
  priceSunday: number;
  priceWeb: number;
  priceFB: number;
  pricePaca: number;
  pricePublished: number;
  visibleInWeb: boolean;
  status: InventoryStatus;
  purchaseDate?: string;
  category?: ClothingCategory;
  scheduledDropDate?: string;
  dropName?: string;
  lotName?: string;
  lotDate?: string;
  lotTotalCost?: number;
}

export interface CalculatedPrices {
  priceSunday: number;
  priceWeb: number;
  priceFB: number;
  pricePaca: number;
}

export interface NewItemFormData {
  photoUrl: string;
  type: string;
  size: string;
  color: string;
  brand: string;
  style: ItemStyle;
  condition: ItemCondition;
  cost: number;
  pricePublished: number;
  lotName?: string;
  lotDate?: string;
  lotTotalCost?: number;
}

export interface LotItemInput {
  type: string;
  size: string;
  color: string;
  brand: string;
  style: ItemStyle;
  condition: ItemCondition;
  photoUrl: string;
  cost?: number;
  pricePublished?: number;
}

export interface AddLotFormData {
  lotName: string;
  lotDate: string;
  lotTotalCost: number;
  isIndividualPrice: boolean;
  items: LotItemInput[];
}

export interface GemBatchItemInput {
  tipoPrenda: string;
  talla?: string;
  color?: string;
  marca?: string;
  estilo?: ItemStyle | string;
  condicion?: ItemCondition | string;
  precioCompra?: number | null;
  precioVenta?: number | null;
}

export interface GemBatchPayload {
  nombreLote: string;
  costoTotalLote: number;
  prendas: GemBatchItemInput[];
}

export interface ScheduleDropPayload {
  dropName: string;
  scheduledAt: string;
  skus: string[];
}
