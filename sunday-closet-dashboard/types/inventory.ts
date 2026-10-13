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

export interface ScheduleDropPayload {
  dropName: string;
  scheduledAt: string;
  skus: string[];
}
