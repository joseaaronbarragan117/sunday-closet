import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
import { InventoryItem } from '@/types/inventory';
import { calculatePrices } from '@/lib/priceCalculator';
import { formatDriveImageUrl } from '@/lib/imageUrl';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category')?.toLowerCase();
    const brandFilter = searchParams.get('brand')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!spreadsheetId || !clientEmail) {
      return NextResponse.json(
        { success: false, error: 'Credenciales de Google Sheets no configuradas' },
        { status: 500, headers: corsHeaders }
      );
    }

    const sheets = getGoogleSheetsClient();
    let response;
    let headerRow: string[] = [];
    try {
      const [headerRes, dataRes] = await Promise.all([
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A1:Z1",
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A2:Z",
        }),
      ]);
      headerRow = headerRes.data.values?.[0] || [];
      response = dataRes;
    } catch {
      const [headerRes, dataRes] = await Promise.all([
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A1:Z1',
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A2:Z',
        }),
      ]);
      headerRow = headerRes.data.values?.[0] || [];
      response = dataRes;
    }

    const lineaColIndex = headerRow.findIndex((h) => {
      const normalized = (h || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return normalized === 'linea' || normalized === 'coleccion';
    });

    const rows = response.data.values || [];
    const publicProducts = rows
      .filter((row: string[]) => row.length > 0 && row[0])
      .map((row: string[]) => {
        const cost = parseFloat(row[9]) || 0;
        const autoPrices = calculatePrices(cost);

        // Detect if row is in legacy format or clean format
        const isLegacy = row.length > 21 && (row[14] !== undefined && row[14] !== '');
        let pricePublished = 0;
        let isVisible = false;
        let scheduledDropDate: string | undefined = undefined;

        if (isLegacy) {
          pricePublished = parseFloat(row[14]) || parseFloat(row[11]) || autoPrices.priceWeb;
          const visibleVal = (row[21] || '').toString().trim().toUpperCase();
          isVisible = visibleVal === 'VERDADERO' || visibleVal === 'TRUE' || visibleVal === '1';
          scheduledDropDate = row[20] || undefined;
        } else {
          pricePublished = parseFloat(row[10]) || autoPrices.priceWeb;
          const visibleVal = (row[17] || '').toString().trim().toUpperCase();
          isVisible = visibleVal === 'VERDADERO' || visibleVal === 'TRUE' || visibleVal === '1';
          scheduledDropDate = row[16] || undefined;
        }

        const status = (row[8] || 'Disponible') as InventoryItem['status'];

        const rawPhotoCell = (row[1] || '').toString().trim();
        const photoUrls = rawPhotoCell
          ? rawPhotoCell
              .split(',')
              .map((u) => formatDriveImageUrl(u.trim()))
              .filter(Boolean)
          : [];

        const rawLinea =
          lineaColIndex >= 0 && row[lineaColIndex]
            ? row[lineaColIndex].toString().trim().toUpperCase()
            : 'CLOSET';
        const linea = rawLinea === 'SELECT' ? 'SELECT' : 'CLOSET';

        return {
          sku: row[0] || '',
          photoUrl: photoUrls[0] || '',
          photoUrls,
          linea,
          type: row[2] || '',
          size: row[3] || 'Única',
          color: row[4] || '',
          brand: row[5] || '',
          style: row[6] || 'Vintage',
          condition: row[7] || 'Nuevo c/etiqueta',
          status,
          priceWeb: pricePublished || autoPrices.priceWeb,
          priceSunday: autoPrices.priceSunday,
          pricePublished: pricePublished || autoPrices.priceWeb,
          visibleInWeb: isVisible,
          scheduledDropDate,
        };
      })
      .filter((product) => {
        if (!product.visibleInWeb) return false;
        const statusLower = (product.status || '').toLowerCase();
        const isAllowedStatus =
          statusLower === 'disponible' ||
          statusLower === 'en stock' ||
          statusLower === 'apartado' ||
          statusLower === 'apartada' ||
          statusLower === 'reservado' ||
          statusLower === 'reservada';
        if (!isAllowedStatus) return false;
        if (categoryFilter && !product.type.toLowerCase().includes(categoryFilter)) return false;
        if (brandFilter && !product.brand.toLowerCase().includes(brandFilter)) return false;
        return true;
      })
      .slice(0, limit);

    return NextResponse.json(
      { success: true, count: publicProducts.length, products: publicProducts },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error al consultar productos del catálogo' },
      { status: 500, headers: corsHeaders }
    );
  }
}
