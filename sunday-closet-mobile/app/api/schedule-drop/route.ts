import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    const { dropName, scheduledAt, skus } = await request.json();

    if (!skus || !Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json({ success: false, error: 'Se requiere al menos un SKU para programar' }, { status: 400 });
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

          // 2. Update Nombre del Drop (T) and Fecha Programada Drop (U) (Columns 20-21)
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!T${sheetRowNumber}:U${sheetRowNumber}`,
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
    });
  } catch (error) {
    console.error('[API schedule-drop POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al programar el drop' },
      { status: 500 }
    );
  }
}
