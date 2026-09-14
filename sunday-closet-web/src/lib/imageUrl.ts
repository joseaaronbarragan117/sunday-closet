/**
 * src/lib/imageUrl.ts
 *
 * Normaliza cualquier URL de Google Drive / Google Docs a la URL CDN directa
 * que devuelve la imagen en bruto (sin autenticacion HTML).
 *
 * Patrones soportados:
 *   - https://drive.google.com/file/d/<ID>/view?usp=sharing
 *   - https://drive.google.com/open?id=<ID>
 *   - https://docs.google.com/uc?id=<ID>
 *   - https://drive.google.com/uc?id=<ID>&export=view
 *   - https://lh3.googleusercontent.com/d/<ID>  (ya CDN)
 *
 * Si no es una URL de Google, se devuelve sin cambios.
 * Si la URL esta vacia, devuelve string vacio.
 */
export function extractGoogleDriveId(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  if (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com')
  ) {
    const match =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function formatDriveImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

export function getDriveThumbnailUrl(url: string | null | undefined, size: number = 800): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  return trimmed;
}

