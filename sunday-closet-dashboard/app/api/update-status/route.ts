import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';

export async function PATCH(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const { sku, visibleInWeb } = await request.json();

    if (!sku || typeof visibleInWeb !== 'boolean') {
      return NextResponse.json({ success: false, error: 'SKU y estado visible son requeridos' }, { status: 400 });
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
      const rowIndex = rows.findIndex((row: string[]) => row[0] === sku);

      if (rowIndex !== -1) {
        const sheetRowNumber = rowIndex + 2;
        const cellValue = visibleInWeb ? 'VERDADERO' : 'FALSO';

        // Column V is 'Visible en Web'
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'Inventario Central'!V${sheetRowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[cellValue]],
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      sku,
      visibleInWeb,
      message: `Visibilidad de ${sku} actualizada a ${visibleInWeb ? 'VERDADERO' : 'FALSO'}`,
    });
  } catch (error) {
    console.error('[API update-status PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar visibilidad en Google Sheet' },
      { status: 500 }
    );
  }
}
