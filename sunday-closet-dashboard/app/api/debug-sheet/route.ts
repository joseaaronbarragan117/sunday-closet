import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';

export async function GET() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    if (!spreadsheetId || !clientEmail) {
      return NextResponse.json({ error: 'No credentials' });
    }

    const sheets = getGoogleSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = meta.data.sheets?.map((s) => s.properties?.title);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Inventario Central'!A1:Z3",
    });

    return NextResponse.json({
      sheetTitles,
      rows: res.data.values || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}
