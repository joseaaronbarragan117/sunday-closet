import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
import { classifyGarmentCategory } from '@/lib/categoryClassifier';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function PATCH(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const body = await request.json();
    const { sku, visibleInWeb, type } = body;

    if (!sku || (typeof visibleInWeb !== 'boolean' && typeof type !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'SKU y al menos un campo a actualizar (visibleInWeb o type) son requeridos' },
        { status: 400, headers: corsHeaders }
      );
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
      const rowIndex = rows.findIndex((row: string[]) => (row[0] || '').trim() === sku.trim());

      if (rowIndex !== -1) {
        const sheetRowNumber = rowIndex + 2;

        // 1. Update Tipo de Prenda (Columna C) if provided
        if (typeof type === 'string' && type.trim()) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!C${sheetRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[type.trim()]],
            },
          });
        }

        // 2. Update Visible en Web (Columna R / V) if provided
        if (typeof visibleInWeb === 'boolean') {
          const cellValue = visibleInWeb ? 'VERDADERO' : 'FALSO';
          const headerRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "'Inventario Central'!A1:Z1",
          });
          const headers = (headerRes.data.values?.[0] || []).map((h: string) => (h || '').toLowerCase().trim());
          const visibleCol = headers.some((h: string) => h.includes('sunday')) ? 'V' : 'R';

          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!${visibleCol}${sheetRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[cellValue]],
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        sku,
        visibleInWeb,
        type: typeof type === 'string' ? type.trim() : undefined,
        category: typeof type === 'string' ? classifyGarmentCategory(type.trim()) : undefined,
        message: typeof type === 'string'
          ? `Tipo de prenda de ${sku} actualizado a "${type.trim()}"`
          : `Visibilidad de ${sku} actualizada a ${visibleInWeb ? 'VERDADERO' : 'FALSO'}`,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API update-status PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registro en Google Sheet' },
      { status: 500, headers: corsHeaders }
    );
  }
}
