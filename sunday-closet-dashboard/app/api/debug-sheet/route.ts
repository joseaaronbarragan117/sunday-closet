import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId, getInventorySheetId } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    if (!spreadsheetId || !clientEmail) {
      return NextResponse.json({ error: 'No credentials' });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const sheets = getGoogleSheetsClient();
    const sheetId = await getInventorySheetId(sheets, spreadsheetId);

    // If action=migrate, perform the column elimination
    if (action === 'migrate') {
      // 1. Read current Row 1 headers
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "'Inventario Central'!A1:Z1",
      });
      const currentHeaders = headerRes.data.values?.[0] || [];

      // Check if columns 10-13 contain suggested prices
      const col10 = (currentHeaders[10] || '').toLowerCase();
      const col11 = (currentHeaders[11] || '').toLowerCase();
      const col14 = (currentHeaders[14] || '').toLowerCase();

      let migrated = false;
      let logMsg = '';

      if (col10.includes('sunday') || col11.includes('web') || col14.includes('publicado')) {
        // Delete columns 10 to 13 inclusive (0-indexed: startIndex 10, endIndex 14)
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId,
                    dimension: 'COLUMNS',
                    startIndex: 10,
                    endIndex: 14,
                  },
                },
              },
            ],
          },
        });

        // Update the new Column K (index 10) header to "Precio de Venta"
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "'Inventario Central'!K1",
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Precio de Venta']],
          },
        });

        migrated = true;
        logMsg = 'Columnas K-N eliminadas con éxito. Columna de Precio de Venta fijada en Columna K.';
      } else {
        logMsg = 'Las columnas sugeridas ya no estaban presentes o ya fueron migradas.';
      }

      // Fetch new state after migration
      const updatedRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "'Inventario Central'!A1:Z3",
      });

      return NextResponse.json({
        success: true,
        migrated,
        message: logMsg,
        newRows: updatedRes.data.values || [],
      });
    }

    // Default: just read rows A1:Z3
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Inventario Central'!A1:Z3",
    });

    return NextResponse.json({
      headers: res.data.values?.[0] || [],
      sampleRow: res.data.values?.[1] || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}
