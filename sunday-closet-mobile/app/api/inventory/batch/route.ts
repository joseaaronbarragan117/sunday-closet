import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
import { InventoryItem, ItemStyle, ItemCondition, GemBatchPayload } from '@/types/inventory';
import { calculatePrices } from '@/lib/priceCalculator';
import { classifyGarmentCategory } from '@/lib/categoryClassifier';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

function getSkuPrefix(tipoPrenda: string): string {
  const clean = (tipoPrenda || 'Prenda')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  return clean.substring(0, 3).padEnd(3, 'X');
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const rawBody = await request.text();
    const cleanJsonText = rawBody
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let payload: GemBatchPayload;
    try {
      payload = JSON.parse(cleanJsonText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'El formato JSON enviado no es válido.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!payload || !Array.isArray(payload.prendas) || payload.prendas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El JSON debe incluir un arreglo "prendas" con al menos una prenda.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const nombreLote = payload.nombreLote ? String(payload.nombreLote).trim() : '';
    const costoTotalLote =
      payload.costoTotalLote !== undefined && payload.costoTotalLote !== null
        ? Number(payload.costoTotalLote) || 0
        : 0;
    const totalPrendas = payload.prendas.length;
    const costoDividido =
      costoTotalLote > 0 && totalPrendas > 0
        ? Number((costoTotalLote / totalPrendas).toFixed(2))
        : 0;

    const fechaActual = new Date().toISOString().split('T')[0];
    const fechaLote = nombreLote ? fechaActual : '';

    const existingPrefixCounts: Record<string, number> = {};

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A2:C",
        });
      } catch {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A2:C',
        });
      }

      const rows = response.data.values || [];
      rows.forEach((row: string[]) => {
        const skuCell = (row[0] || '').trim().toUpperCase();
        const skuMatch = skuCell.match(/^SUN-([A-Z]{3})-(\d+)$/);
        if (skuMatch) {
          const pref = skuMatch[1];
          existingPrefixCounts[pref] = (existingPrefixCounts[pref] || 0) + 1;
        } else {
          const existingType = (row[2] || '').trim();
          if (existingType) {
            const pref = getSkuPrefix(existingType);
            existingPrefixCounts[pref] = (existingPrefixCounts[pref] || 0) + 1;
          }
        }
      });
    }

    const newInventoryItems: InventoryItem[] = [];
    const rowsToAppend: (string | number)[][] = [];

    for (const p of payload.prendas) {
      const tipoPrenda = String(p.tipoPrenda || 'Prenda').trim();
      const prefix = getSkuPrefix(tipoPrenda);

      const nextCount = (existingPrefixCounts[prefix] || 0) + 1;
      existingPrefixCounts[prefix] = nextCount;

      const numberString = String(nextCount).padStart(3, '0');
      const computedSku = `SUN-${prefix}-${numberString}`;

      const hasCustomCost =
        p.precioCompra !== null &&
        p.precioCompra !== undefined &&
        String(p.precioCompra).trim() !== '' &&
        Number(p.precioCompra) > 0;
      const costoUnidad = hasCustomCost ? Number(p.precioCompra) : costoDividido;

      const hasCustomPrice =
        p.precioVenta !== null &&
        p.precioVenta !== undefined &&
        String(p.precioVenta).trim() !== '' &&
        Number(p.precioVenta) > 0;
      const precioVenta = hasCustomPrice
        ? Number(p.precioVenta)
        : Math.round((costoUnidad / 0.3) * 1.2);

      const talla = p.talla && String(p.talla).trim() ? String(p.talla).trim() : 'M';
      const color = p.color && String(p.color).trim() ? String(p.color).trim() : '';
      const marca = p.marca && String(p.marca).trim() ? String(p.marca).trim() : 'PacSun';
      const estilo = (p.estilo && String(p.estilo).trim() ? String(p.estilo).trim() : 'Vintage') as ItemStyle;
      const condicion = (
        p.condicion && String(p.condicion).trim() ? String(p.condicion).trim() : 'Nuevo c/etiqueta'
      ) as ItemCondition;

      const autoPrices = calculatePrices(costoUnidad);

      const newItem: InventoryItem = {
        sku: computedSku,
        photoUrl: '',
        type: tipoPrenda,
        size: talla,
        color: color,
        brand: marca,
        style: estilo,
        condition: condicion,
        cost: Number(costoUnidad),
        priceSunday: autoPrices.priceSunday,
        priceWeb: autoPrices.priceWeb,
        priceFB: autoPrices.priceFB,
        pricePaca: autoPrices.pricePaca,
        pricePublished: Number(precioVenta),
        visibleInWeb: false,
        status: 'Disponible',
        purchaseDate: fechaActual,
        category: classifyGarmentCategory(tipoPrenda),
        lotName: nombreLote || undefined,
        lotDate: fechaLote || undefined,
        lotTotalCost: costoTotalLote,
      };

      newInventoryItems.push(newItem);

      rowsToAppend.push([
        computedSku,                  // Col A (0): SKU generado
        '',                           // Col B (1): "" (vacío)
        tipoPrenda,                   // Col C (2): tipoPrenda
        talla,                        // Col D (3): talla (default "M")
        color,                        // Col E (4): color
        marca,                        // Col F (5): marca (default "PacSun")
        estilo,                       // Col G (6): estilo (default "Vintage")
        condicion,                    // Col H (7): condicion (default "Nuevo c/etiqueta")
        'Disponible',                 // Col I (8): "Disponible"
        Number(costoUnidad),          // Col J (9): Number(costoUnidad)
        Number(precioVenta),          // Col K (10): Number(precioVenta)
        fechaActual,                  // Col L (11): Fecha actual en YYYY-MM-DD
        '',                           // Col M (12): ""
        '',                           // Col N (13): ""
        '',                           // Col O (14): ""
        '',                           // Col P (15): ""
        '',                           // Col Q (16): ""
        'FALSO',                      // Col R (17): "FALSO"
        nombreLote,                   // Col S (18): nombreLote
        fechaLote,                    // Col T (19): Fecha del lote en YYYY-MM-DD (si hay lote)
        Number(costoTotalLote),       // Col U (20): Number(costoTotalLote)
      ]);
    }

    if (spreadsheetId && clientEmail && rowsToAppend.length > 0) {
      const sheets = getGoogleSheetsClient();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Inventario Central'!A:U",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rowsToAppend,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        count: newInventoryItems.length,
        items: newInventoryItems,
        message: `¡Lote "${nombreLote || 'Sin nombre'}" procesado con éxito (${newInventoryItems.length} prendas insertadas en 'Inventario Central')!`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API Inventory Batch POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al procesar lote masivo JSON',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
