const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');

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

console.log('Testing crypto.createPrivateKey...');
try {
  const keyObject = crypto.createPrivateKey(cleanedKey);
  console.log('✅ Key successfully decoded by Node.js crypto!');
} catch (e) {
  console.error('❌ Crypto error decoding key:', e.message);
}

async function testConnection() {
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

    console.log('✅ SUCCESS! Spreadsheet Title:', meta.data.properties.title);
  } catch (err) {
    console.error('❌ Google Sheets API Error:', err.message);
    if (err.response && err.response.data) {
      console.error('API Details:', err.response.data);
    }
  }
}

testConnection();
