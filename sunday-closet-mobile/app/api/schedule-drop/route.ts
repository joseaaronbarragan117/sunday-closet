import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const { dropName, scheduledAt, skus } = await request.json();

    if (!skus || !Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json({ success: false, error: 'Se requiere al menos un SKU para programar' }, { status: 400, headers: corsHeaders });
    }

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A2:A",
        });
      } catch (err) {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A2:A',
        });
      }

      const rows = response.data.values || [];

      for (const sku of skus) {
        const rowIndex = rows.findIndex((r: string[]) => r[0] === sku);
        if (rowIndex !== -1) {
          const sheetRowNumber = rowIndex + 2;

          // 1. Update Estado / Proceso in Column I (Index 8 / Column I) to 'Programado'
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!I${sheetRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['Programado']],
            },
          });

          // 2. Check headers to find Drop columns (P:Q in clean format, T:U in legacy)
          const headerRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "'Inventario Central'!A1:Z1",
          });
          const headers = (headerRes.data.values?.[0] || []).map((h: string) => (h || '').toLowerCase().trim());
          const dropRange = headers.some((h: string) => h.includes('sunday'))
            ? `'Inventario Central'!T${sheetRowNumber}:U${sheetRowNumber}`
            : `'Inventario Central'!P${sheetRowNumber}:Q${sheetRowNumber}`;

          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: dropRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[dropName, scheduledAt]],
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      dropName,
      scheduledAt,
      skusCount: skus.length,
      message: `Drop '${dropName}' programado exitosamente para ${skus.length} prendas.`,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[API schedule-drop POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al programar el drop' },
      { status: 500, headers: corsHeaders }
    );
  }
}
