import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';
import fs from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

const BANNER_FILE = path.join(process.cwd(), 'banner-config.json');
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80';

function getStoredBannerLocal(): string {
  try {
    if (fs.existsSync(BANNER_FILE)) {
      const data = JSON.parse(fs.readFileSync(BANNER_FILE, 'utf8'));
      if (data && data.bannerUrl) return data.bannerUrl;
    }
  } catch {}
  return DEFAULT_BANNER;
}

function saveStoredBannerLocal(url: string) {
  try {
    fs.writeFileSync(BANNER_FILE, JSON.stringify({ bannerUrl: url }), 'utf8');
  } catch (err) {
    console.warn('[Banner API] Could not save local banner-config.json:', err);
  }
}

function normalizeGoogleDriveUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com')) {
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return trimmed;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Config!A1',
        });
        const rows = response?.data?.values;
        if (rows && rows.length > 0 && rows[0][0]) {
          const bannerUrl = normalizeGoogleDriveUrl(rows[0][0]);
          return NextResponse.json({ success: true, bannerUrl }, { status: 200, headers: corsHeaders });
        }
      } catch {
        // Fallback to local config if Config tab doesn't exist in sheet
      }
    }
  } catch (error) {
    console.warn('[API Banner GET] Error:', error);
  }

  return NextResponse.json(
    { success: true, bannerUrl: getStoredBannerLocal() },
    { status: 200, headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
    const body = await request.json();
    let { bannerUrl } = body;

    if (!bannerUrl) {
      return NextResponse.json(
        { success: false, error: 'URL del banner es requerida' },
        { status: 400, headers: corsHeaders }
      );
    }

    bannerUrl = normalizeGoogleDriveUrl(bannerUrl);

    // 1. Save locally for guaranteed immediate persistence
    saveStoredBannerLocal(bannerUrl);

    // 2. Also try to persist to Google Sheets Config tab
    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();
      try {
        // Check if Config tab exists, if not create it
        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const hasConfig = meta.data.sheets?.some((s: any) => s.properties?.title === 'Config');
        if (!hasConfig) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: { title: 'Config' },
                  },
                },
              ],
            },
          });
        }

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Config!A1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[bannerUrl]],
          },
        });
      } catch (err: any) {
        console.warn('[API Banner POST] Could not write to Google Sheets Config sheet, stored locally:', err?.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        bannerUrl,
        message: 'Banner actualizado exitosamente para la web.',
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API Banner POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar el banner' },
      { status: 500, headers: corsHeaders }
    );
  }
}
