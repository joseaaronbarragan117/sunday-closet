// src/lib/utils/whatsapp.ts
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "./format";

// Configurable phone number (defaults to MX format or custom business phone)
export const DEFAULT_WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5215500000000";

/**
 * Genera el enlace de WhatsApp para apartar una prenda específica al instante.
 */
export function createProductWhatsAppUrl(
  product: Product,
  phone: string = DEFAULT_WHATSAPP_PHONE
): string {
  const message = [
    `¡Hola Sunday Clóset! ✨`,
    `Me enamoré de esta prenda única y me gustaría apartarla:`,
    ``,
    `🛍️ *${product.nombre || product.tipo}*`,
    `🏷️ Marca: ${product.marca}`,
    `📏 Talla: ${product.talla}${product.color ? ` | Color: ${product.color}` : ''}`,
    `🔢 SKU: ${product.id}`,
    `💰 Precio: ${formatPrice(product.precio)}`,
    ``,
    `¿Sigue disponible para concretar el apartado? Muchas gracias.`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace de WhatsApp para finalizar el pedido con toda la bolsa de compras.
 */
export function createCartWhatsAppUrl(
  items: { product: Product; quantity?: number }[],
  totalAmount: number,
  phone: string = DEFAULT_WHATSAPP_PHONE
): string {
  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.nombre || item.product.tipo}* (${item.product.marca}, Talla: ${item.product.talla}, SKU: ${item.product.id}) — ${formatPrice(item.product.precio)}`
    )
    .join('\n');

  const message = [
    `¡Hola Sunday Clóset! ✨`,
    `Quiero realizar mi pedido de las siguientes piezas de mi bolsa:`,
    ``,
    itemsList,
    ``,
    `💳 *Total a pagar:* ${formatPrice(totalAmount)}`,
    ``,
    `¿Me comparten los datos para transferencia o envío? ¡Gracias!`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
