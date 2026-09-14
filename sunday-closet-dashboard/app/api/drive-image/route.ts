import { NextResponse } from 'next/server';
import { extractGoogleDriveId } from '@/lib/imageUrl';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rawUrl = searchParams.get('url');

    const fileId = id || (rawUrl ? extractGoogleDriveId(rawUrl) : null);

    if (!fileId && !rawUrl) {
      return NextResponse.json({ error: 'Missing id or url parameter' }, { status: 400 });
    }

    // Try candidates in order:
    // 1. Direct Google Usercontent CDN
    // 2. Google Drive Thumbnail service
    // 3. Google Drive uc export
    const candidateUrls: string[] = [];
    if (fileId) {
      candidateUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
      candidateUrls.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`);
      candidateUrls.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
    }
    if (rawUrl && !candidateUrls.includes(rawUrl)) {
      candidateUrls.push(rawUrl);
    }

    let imageBuffer: ArrayBuffer | null = null;
    let contentType = 'image/jpeg';

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (res.ok) {
          const type = res.headers.get('content-type') || '';
          if (type.startsWith('image/')) {
            contentType = type;
            imageBuffer = await res.arrayBuffer();
            break;
          }
        }
      } catch (err) {
        // Try next candidate
      }
    }

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Could not fetch image from Google Drive' }, { status: 404 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('[Drive Image Proxy Error]:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
