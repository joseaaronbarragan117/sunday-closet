import { google } from 'googleapis';

export function getSpreadsheetId(): string {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
}

export async function getInventorySheetId(sheets: any, spreadsheetId: string): Promise<number> {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const target = meta.data.sheets?.find(
      (s: any) => s.properties?.title?.trim().toLowerCase() === 'inventario central'
    );
    if (target?.properties?.sheetId !== undefined) {
      return target.properties.sheetId;
    }
    return meta.data.sheets?.[0]?.properties?.sheetId || 0;
  } catch (err) {
    console.warn('[Google Sheets] Could not dynamically get sheetId, using fallback 977960078:', err);
    return 977960078;
  }
}

/**
 * Normalizes any Google Service Account Private Key string into standard OpenSSL 3.0 PEM format.
 */
function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return '';

  // Clean quotes and unescape backslashes
  let cleaned = rawKey
    .replace(/^"+|"+$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')
    .trim();

  // If key contains PEM headers, rebuild clean 64-char chunked PEM
  if (cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
    const lines = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';

    // Filter out header & footer lines to get raw base64 string
    const bodyLines = lines.filter(
      (line) => !line.startsWith('-----BEGIN') && !line.startsWith('-----END')
    );
    const rawBase64 = bodyLines.join('');

    // Re-chunk base64 body into 64-character lines
    const chunks = rawBase64.match(/.{1,64}/g) || [rawBase64];
    return `${header}\n${chunks.join('\n')}\n${footer}\n`;
  }

  return cleaned;
}

export function getGoogleSheetsClient() {
  const spreadsheetId = getSpreadsheetId();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || '';

  const privateKey = formatPrivateKey(rawPrivateKey);

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.warn('[Google Sheets] Missing credentials in environment variables.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}
