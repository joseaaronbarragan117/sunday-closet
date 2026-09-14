import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId, getInventorySheetId } from '@/lib/googleSheets';
import { InventoryItem, ItemStyle, ItemCondition } from '@/types/inventory';
import { calculatePrices } from '@/lib/priceCalculator';
import { formatDriveImageUrl } from '@/lib/imageUrl';

// Fallback Mock Inventory Data for UI verification
const MOCK_INVENTORY: InventoryItem[] = [
  {
    sku: 'SUN-VES-001',
    photoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
    type: 'Vestido Silk Vintage',
    size: 'S',
    color: 'Rosa Champán',
    brand: 'Zara Studio',
    style: 'Vintage',
    condition: 'Nuevo c/etiqueta',
    cost: 300,
    priceSunday: 1000,
    priceWeb: 1200,
    priceFB: 600,
    pricePaca: 390,
    pricePublished: 1200,
    visibleInWeb: true,
    status: 'Disponible',
  },
];

let inMemoryItems = [...MOCK_INVENTORY];

function parseMoney(val: any, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).trim();
  if (!str) return fallback;
  let cleaned = str.replace(/[^\d.,-]/g, '');
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

export async function GET() {
  const spreadsheetId = getSpreadsheetId();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

  try {
    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      
      const sheetsPromise = (async () => {
        try {
          return await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "'Inventario Central'!A2:V",
          });
        } catch (err) {
          return await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'A2:V',
          });
        }
      })();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de 6s conectando a Google Sheets')), 6000)
      );

      const response: any = await Promise.race([sheetsPromise, timeoutPromise]);
      const rows = response?.data?.values;

      if (rows && rows.length > 0) {
        const items: InventoryItem[] = rows
          .filter((row: string[]) => {
            if (!row || row.length === 0) return false;
            const sku = (row[0] || '').trim();
            if (!sku || sku.toLowerCase().startsWith('sku')) return false;
            return true;
          })
          .map((row: string[]) => {
            const cost = parseMoney(row[9], 0);
            const autoPrices = calculatePrices(cost);

            const visibleVal = (row[21] || '').toString().trim().toUpperCase();
            const isVisible = visibleVal === 'VERDADERO' || visibleVal === 'TRUE' || visibleVal === '1';

            return {
              sku: (row[0] || '').trim(),
              photoUrl: formatDriveImageUrl(row[1]) || '',
              type: (row[2] || '').trim(),
              size: (row[3] || 'M').trim(),
              color: (row[4] || '').trim(),
              brand: (row[5] || '').trim(),
              style: ((row[6] || 'Vintage').trim()) as ItemStyle,
              condition: ((row[7] || 'Nuevo c/etiqueta').trim()) as ItemCondition,
              status: ((row[8] || 'Disponible').trim()) as InventoryItem['status'],
              cost: cost,
              priceSunday: parseMoney(row[10], autoPrices.priceSunday),
              priceWeb: parseMoney(row[11], autoPrices.priceWeb),
              priceFB: parseMoney(row[12], autoPrices.priceFB),
              pricePaca: parseMoney(row[13], autoPrices.pricePaca),
              pricePublished: parseMoney(row[14], parseMoney(row[11], autoPrices.priceWeb)),
              visibleInWeb: isVisible,
              scheduledDropDate: row[20] ? row[20].trim() : undefined,
              dropName: row[19] ? row[19].trim() : undefined,
            };
          });

        if (items.length > 0) {
          inMemoryItems = items;
        }

        return NextResponse.json({ success: true, items, source: 'google_sheets' });
      }
    }
  } catch (error: any) {
    console.error('[API Inventory GET] Error fetching from Google Sheets:', error?.message || error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Error al conectar con Google Sheets',
      items: inMemoryItems,
      source: 'fallback',
    });
  }

  return NextResponse.json({ success: true, items: inMemoryItems, source: 'in_memory' });
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const body = await request.json();
    const { photoUrl, type, size, color, brand, style, condition, cost, pricePublished } = body;

    if (!type || !style || !condition || cost === undefined || pricePublished === undefined) {
      return NextResponse.json({ success: false, error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const prices = calculatePrices(Number(cost));

    // 1. Automated SKU: SUN-[FIRST 3 LETTERS OF TYPE IN UPPERCASE]-[CONSECUTIVE NUMBER]
    const typeClean = type.trim();
    const typePrefix = typeClean.substring(0, 3).toUpperCase().padEnd(3, 'X');
    
    let consecutiveNum = 1;

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A2:C",
        });
      } catch (err) {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A2:C',
        });
      }

      const rows = response.data.values || [];
      const matches = rows.filter((row: string[]) => {
        const existingType = row[2] || '';
        const existingPrefix = existingType.trim().substring(0, 3).toUpperCase().padEnd(3, 'X');
        return existingPrefix === typePrefix;
      });

      consecutiveNum = matches.length + 1;
    } else {
      const matches = inMemoryItems.filter((item) => {
        const existingPrefix = item.type.trim().substring(0, 3).toUpperCase().padEnd(3, 'X');
        return existingPrefix === typePrefix;
      });
      consecutiveNum = matches.length + 1;
    }

    const numberString = String(consecutiveNum).padStart(3, '0');
    const computedSku = `SUN-${typePrefix}-${numberString}`;

    const newItem: InventoryItem = {
      sku: computedSku,
      photoUrl: formatDriveImageUrl(photoUrl) || '',
      type: typeClean,
      size: size || 'M',
      color: color || '',
      brand: brand || '',
      style: style as ItemStyle,
      condition: condition as ItemCondition,
      cost: Number(cost),
      priceSunday: prices.priceSunday,
      priceWeb: prices.priceWeb,
      priceFB: prices.priceFB,
      pricePaca: prices.pricePaca,
      pricePublished: Number(pricePublished),
      visibleInWeb: false,
      status: 'Disponible',
    };

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Inventario Central'!A:V",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              newItem.sku,                  // Col A (0): SKU / Código
              newItem.photoUrl,             // Col B (1): Foto (URL)
              newItem.type,                 // Col C (2): Tipo de Prenda
              newItem.size,                 // Col D (3): Talla
              newItem.color,                // Col E (4): Color Principal
              newItem.brand,                // Col F (5): Marca
              newItem.style,                // Col G (6): Estilo
              newItem.condition,            // Col H (7): Condición
              newItem.status,               // Col I (8): Estado / Proceso
              newItem.cost,                 // Col J (9): Precio de Compra
              newItem.priceSunday,          // Col K (10): Precio Sunday (Insta)
              newItem.priceWeb,             // Col L (11): Precio Web
              newItem.priceFB,              // Col M (12): Precio Facebook
              newItem.pricePaca,            // Col N (13): Precio Paca / Remate
              newItem.pricePublished,       // Col O (14): precio publicado
              new Date().toISOString().split('T')[0], // Col P (15): Fecha de Compra
              '',                           // Col Q (16): Fecha de Venta
              '',                           // Col R (17): Precio Final de Venta
              '',                           // Col S (18): Canal de Venta
              '',                           // Col T (19): Nombre del Drop
              '',                           // Col U (20): Fecha Programada Drop
              'FALSO',                      // Col V (21): Visible en Web
            ],
          ],
        },
      });
    }

    inMemoryItems.unshift(newItem);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('[API Inventory POST] Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Error al agregar prenda' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const { searchParams } = new URL(request.url);
    let sku = searchParams.get('sku');

    if (!sku) {
      try {
        const body = await request.json();
        sku = body?.sku;
      } catch {
        // body not present or already consumed
      }
    }

    if (!sku) {
      return NextResponse.json({ success: false, error: 'SKU de prenda requerido para eliminar' }, { status: 400 });
    }

    const targetSku = sku.trim();

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      const sheetId = await getInventorySheetId(sheets, spreadsheetId);

      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A:A",
        });
      } catch (err) {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A:A',
        });
      }

      const rows = response.data.values || [];
      // 0-indexed row index where row[0] matches the target SKU
      const foundIndex = rows.findIndex((r: string[]) => (r[0] || '').trim() === targetSku);

      if (foundIndex === -1) {
        return NextResponse.json({
          success: false,
          error: `No se encontró la prenda con SKU "${targetSku}" en la hoja de Google Sheets`,
        }, { status: 404 });
      }

      // Execute deleteDimension on Google Sheets. This physically deletes the row and shifts following rows UP automatically!
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: foundIndex,
                  endIndex: foundIndex + 1,
                },
              },
            },
          ],
        },
      });
    }

    // Also remove from inMemoryItems fallback
    inMemoryItems = inMemoryItems.filter((it) => it.sku.trim() !== targetSku);

    return NextResponse.json({
      success: true,
      sku: targetSku,
      message: `Prenda ${targetSku} eliminada con éxito y filas compactadas hacia arriba.`,
    });
  } catch (error: any) {
    console.error('[API Inventory DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al eliminar prenda en Google Sheets' },
      { status: 500 }
    );
  }
}

