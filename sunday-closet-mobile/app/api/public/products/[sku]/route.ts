import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const resolvedParams = await params;
    const skuTarget = resolvedParams.sku?.toUpperCase();
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

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
    const matchedRow = rows.find(
      (row: string[]) => row[0] && row[0].toString().trim().toUpperCase() === skuTarget
    );

    if (!matchedRow) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404, headers: corsHeaders });
    }

    const cost = parseFloat(matchedRow[9]) || 0;
    const autoPrices = calculatePrices(cost);
    const visibleVal = (matchedRow[21] || '').toString().trim().toUpperCase();
    const isVisible = visibleVal === 'VERDADERO' || visibleVal === 'TRUE' || visibleVal === '1';
    const status = matchedRow[8] || 'Disponible';

    if (!isVisible || status !== 'Disponible') {
      return NextResponse.json(
        { success: false, error: 'Este producto no está disponible en la web' },
        { status: 404, headers: corsHeaders }
      );
    }

    const product = {
      sku: matchedRow[0] || '',
      photoUrl: formatDriveImageUrl(matchedRow[1]) || '',
      type: matchedRow[2] || '',
      size: matchedRow[3] || 'Única',
      color: matchedRow[4] || '',
      brand: matchedRow[5] || '',
      priceWeb: parseFloat(matchedRow[11]) || autoPrices.priceWeb,
      priceSunday: parseFloat(matchedRow[10]) || autoPrices.priceSunday,
      visibleInWeb: isVisible,
      status,
      scheduledDropDate: matchedRow[20] || undefined,
    };

    return NextResponse.json({ success: true, product }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error al consultar producto' },
      { status: 500, headers: corsHeaders }
    );
  }
}
