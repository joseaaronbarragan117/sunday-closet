import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId, getInventorySheetId } from '@/lib/googleSheets';

function colIndexToLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

async function setupLineaColumn() {
  const spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId || !process.env.GOOGLE_CLIENT_EMAIL) {
    return NextResponse.json(
      { success: false, error: 'Credenciales de Google Sheets no configuradas' },
      { status: 500 }
    );
  }

  const sheets = getGoogleSheetsClient();
  const sheetId = await getInventorySheetId(sheets, spreadsheetId);

  const [headerRes, rowsRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Inventario Central'!A1:Z1",
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Inventario Central'!A2:Z",
    }),
  ]);

  const headerRow: string[] = headerRes.data.values?.[0] || [];
  const rows: string[][] = rowsRes.data.values || [];

  // 1. Check if Linea / Coleccion column already exists
  let colIndex = headerRow.findIndex((h) => {
    const norm = (h || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return norm === 'linea' || norm === 'coleccion';
  });

  // 2. If not found, place it right after the last non-empty header (minimum column V = index 21)
  if (colIndex < 0) {
    let lastNonEmpty = -1;
    headerRow.forEach((h, idx) => {
      if (String(h || '').trim() !== '') lastNonEmpty = idx;
    });
    colIndex = Math.max(lastNonEmpty + 1, 21);
  }

  const colLetter = colIndexToLetter(colIndex);

  // 3. Write header "Linea"
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Inventario Central'!${colLetter}1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['Linea']],
    },
  });

  // 4. Populate empty cells on existing rows with "CLOSET"
  const lastRowWithData = rows.reduce((acc, r, idx) => {
    return r && r[0] && String(r[0]).trim() !== '' ? idx + 2 : acc;
  }, 1);

  let updatedRows = 0;
  if (lastRowWithData >= 2) {
    const colValues = rows.slice(0, lastRowWithData - 1).map((r) => {
      const hasSku = Boolean(r && r[0] && String(r[0]).trim() !== '');
      if (!hasSku) return [''];
      const current = String(r[colIndex] || '').trim().toUpperCase();
      if (current === 'CLOSET' || current === 'SELECT') {
        return [current];
      }
      updatedRows++;
      return ['CLOSET'];
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'Inventario Central'!${colLetter}2:${colLetter}${lastRowWithData}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: colValues,
      },
    });
  }

  // 5. Apply strict dropdown Data Validation (ONLY "CLOSET" and "SELECT")
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1, // Row 2 onwards
              endRowIndex: 1000,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'CLOSET' },
                  { userEnteredValue: 'SELECT' },
                ],
              },
              showCustomUi: true,
              strict: true,
            },
          },
        },
      ],
    },
  });

  return NextResponse.json({
    success: true,
    column: colLetter,
    columnIndex: colIndex,
    header: 'Linea',
    options: ['CLOSET', 'SELECT'],
    strict: true,
    updatedRows,
    totalRowsEvaluated: Math.max(0, lastRowWithData - 1),
  });
}

export async function GET() {
  try {
    return await setupLineaColumn();
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error configurando columna Linea' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return await setupLineaColumn();
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error configurando columna Linea' },
      { status: 500 }
    );
  }
}
