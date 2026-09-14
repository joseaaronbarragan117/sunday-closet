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
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "'Inventario Central'!A2:V",
      });
    } catch {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A2:V',
      });
    }

    const rows = response.data.values || [];
    const publicProducts = rows
      .filter((row: string[]) => row.length > 0 && row[0])
      .map((row: string[]) => {
        const cost = parseFloat(row[9]) || 0;
        const autoPrices = calculatePrices(cost);
        const visibleVal = (row[21] || '').toString().trim().toUpperCase();
        const isVisible = visibleVal === 'VERDADERO' || visibleVal === 'TRUE' || visibleVal === '1';
        const status = (row[8] || 'Disponible') as InventoryItem['status'];
        const pricePublished = parseFloat(row[14]) || parseFloat(row[11]) || autoPrices.priceWeb;

        return {
          sku: row[0] || '',
          photoUrl: formatDriveImageUrl(row[1]) || '',
          type: row[2] || '',
          size: row[3] || 'Única',
          color: row[4] || '',
          brand: row[5] || '',
          style: row[6] || 'Vintage',
          condition: row[7] || 'Nuevo c/etiqueta',
          status,
          priceWeb: parseFloat(row[11]) || autoPrices.priceWeb,
          priceSunday: parseFloat(row[10]) || autoPrices.priceSunday,
          pricePublished,
          visibleInWeb: isVisible,
          scheduledDropDate: row[20] || undefined,
        };
      })
      .filter((product) => {
        if (!product.visibleInWeb) return false;
        const statusLower = (product.status || '').toLowerCase();
        if (statusLower !== 'disponible' && statusLower !== 'en stock') return false;
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
