import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
import { InventoryItem, ItemStyle, ItemCondition, AddLotFormData } from '@/types/inventory';
import { calculatePrices } from '@/lib/priceCalculator';
import { formatDriveImageUrl } from '@/lib/imageUrl';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const body: AddLotFormData = await request.json();
    const { lotName, lotDate, lotTotalCost, isIndividualPrice, items } = body;

    if (!lotName || !lotDate || lotTotalCost === undefined || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Por favor proporciona el nombre del lote, fecha, costo total y al menos una prenda.' },
        { status: 400 }
      );
    }

    const totalPieces = items.length;
    const dividedCost = parseFloat((Number(lotTotalCost) / totalPieces).toFixed(2));
    const cleanLotName = String(lotName).trim();
    const cleanLotDate = String(lotDate).trim() || new Date().toISOString().split('T')[0];

    // Fetch existing types for consecutive SKU generation
    const existingTypeCounts: Record<string, number> = {};

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
      rows.forEach((row: string[]) => {
        const existingType = (row[2] || '').trim();
        if (existingType) {
          const prefix = existingType.substring(0, 3).toUpperCase().padEnd(3, 'X');
          existingTypeCounts[prefix] = (existingTypeCounts[prefix] || 0) + 1;
        }
      });
    }

    const newInventoryItems: InventoryItem[] = [];
    const sheetRowsToAppend: (string | number)[][] = [];

    for (const itemInput of items) {
      const typeClean = (itemInput.type || 'Prenda').trim();
      const typePrefix = typeClean.substring(0, 3).toUpperCase().padEnd(3, 'X');

      const currentCount = (existingTypeCounts[typePrefix] || 0) + 1;
      existingTypeCounts[typePrefix] = currentCount;

      const numberString = String(currentCount).padStart(3, '0');
      const computedSku = `SUN-${typePrefix}-${numberString}`;

      // Calculate cost per item based on toggle
      const itemCost = isIndividualPrice && itemInput.cost && Number(itemInput.cost) > 0
        ? Number(itemInput.cost)
        : dividedCost;

      const autoPrices = calculatePrices(itemCost);
      const pricePublished = itemInput.pricePublished && Number(itemInput.pricePublished) > 0
        ? Number(itemInput.pricePublished)
        : autoPrices.priceWeb;

      const newItem: InventoryItem = {
        sku: computedSku,
        photoUrl: formatDriveImageUrl(itemInput.photoUrl) || '',
        type: typeClean,
        size: itemInput.size || 'M',
        color: itemInput.color || '',
        brand: itemInput.brand || '',
        style: (itemInput.style || 'Vintage') as ItemStyle,
        condition: (itemInput.condition || 'Nuevo c/etiqueta') as ItemCondition,
        cost: itemCost,
        priceSunday: autoPrices.priceSunday,
        priceWeb: autoPrices.priceWeb,
        priceFB: autoPrices.priceFB,
        pricePaca: autoPrices.pricePaca,
        pricePublished: pricePublished,
        visibleInWeb: false,
        status: 'Disponible',
        lotName: cleanLotName,
        lotDate: cleanLotDate,
        lotTotalCost: Number(lotTotalCost),
      };

      newInventoryItems.push(newItem);
    }

    if (spreadsheetId && clientEmail && newInventoryItems.length > 0) {
      const sheets = getGoogleSheetsClient();
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "'Inventario Central'!A1:Z1",
      });
      const headers = headerRes.data.values?.[0] || [];
      const hasSundayHeader = headers.some((h: string) => (h || '').toLowerCase().includes('sunday'));

      const rowsToAppend = newInventoryItems.map((item) => {
        return hasSundayHeader
          ? [
              item.sku,                  // Col A (0): SKU
              item.photoUrl,             // Col B (1): Foto (URL)
              item.type,                 // Col C (2): Tipo de Prenda
              item.size,                 // Col D (3): Talla
              item.color,                // Col E (4): Color
              item.brand,                // Col F (5): Marca
              item.style,                // Col G (6): Estilo
              item.condition,            // Col H (7): Condición
              item.status,               // Col I (8): Estado
              item.cost,                 // Col J (9): Precio de Compra
              '',                        // Col K (10): (Sin precio sugerido)
              '',                        // Col L (11): (Sin precio sugerido)
              '',                        // Col M (12): (Sin precio sugerido)
              '',                        // Col N (13): (Sin precio sugerido)
              item.pricePublished,       // Col O (14): Precio Asignado
              cleanLotDate,              // Col P (15): Fecha Compra
              '',                        // Col Q (16): Fecha Venta
              '',                        // Col R (17): Precio Final Venta
              '',                        // Col S (18): Canal Venta
              '',                        // Col T (19): Nombre Drop
              '',                        // Col U (20): Fecha Drop
              'FALSO',                   // Col V (21): Visible en Web
              cleanLotName,              // Col W (22): Nombre del Lote
              cleanLotDate,              // Col X (23): Fecha del Lote
              Number(lotTotalCost),      // Col Y (24): Costo Total del Lote
            ]
          : [
              item.sku,                  // Col A (0): SKU
              item.photoUrl,             // Col B (1): Foto (URL)
              item.type,                 // Col C (2): Tipo de Prenda
              item.size,                 // Col D (3): Talla
              item.color,                // Col E (4): Color
              item.brand,                // Col F (5): Marca
              item.style,                // Col G (6): Estilo
              item.condition,            // Col H (7): Condición
              item.status,               // Col I (8): Estado
              item.cost,                 // Col J (9): Precio de Compra
              item.pricePublished,       // Col K (10): Precio de Venta (solo el precio asignado, sin sugeridos en sheets!)
              cleanLotDate,              // Col L (11): Fecha Compra
              '',                        // Col M (12): Fecha Venta
              '',                        // Col N (13): Precio Final de Venta
              '',                        // Col O (14): Canal Venta
              '',                        // Col P (15): Nombre Drop
              '',                        // Col Q (16): Fecha Drop
              'FALSO',                   // Col R (17): Visible en Web
              cleanLotName,              // Col S (18): Nombre del Lote
              cleanLotDate,              // Col T (19): Fecha del Lote
              Number(lotTotalCost),      // Col U (20): Costo Total del Lote
            ];
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Inventario Central'!A:U",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rowsToAppend,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: newInventoryItems.length,
      items: newInventoryItems,
      message: `¡Lote "${cleanLotName}" agregado con éxito con ${newInventoryItems.length} prendas!`,
    });
  } catch (error: any) {
    console.error('[API Lot POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al guardar el lote de prendas' },
      { status: 500 }
    );
  }
}
