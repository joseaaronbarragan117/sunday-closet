const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1].trim()] = value;
  }
});

const SPREADSHEET_ID = env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
const GOOGLE_CLIENT_EMAIL = env.GOOGLE_CLIENT_EMAIL || '';
let rawKey = env.GOOGLE_PRIVATE_KEY || '';

// Clean up key: replace escaped newlines and ensure standard PEM formatting
let cleanedKey = rawKey
  .replace(/\\n/g, '\n')
  .replace(/"/g, '')
  .trim();

async function checkHeaders() {
  try {
    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: cleanedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    console.log('SHEET_TABS:', meta.data.sheets.map(s => s.properties.title));

    // Get headers (Row 1)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1:Z1',
    });

    console.log('HEADERS_FOUND:', JSON.stringify(res.data.values ? res.data.values[0] : []));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

checkHeaders();
