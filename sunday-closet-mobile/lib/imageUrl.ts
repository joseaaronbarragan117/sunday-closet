// lib/imageUrl.ts

/**
 * Extrae el ID de archivo de Google Drive a partir de cualquier variante de URL
 * o del ID directo.
 */
export function extractGoogleDriveId(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // Si ya es un ID de Google Drive puro (aprox 25 a 50 caracteres alfanuméricos)
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

/**
 * Normaliza cualquier URL de Google Drive a la URL CDN directa (lh3.googleusercontent.com).
 * Si no es de Google Drive, devuelve la URL original limpia.
 */
export function formatDriveImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

/**
 * Genera la URL alternativa de miniaturas de Google Drive con tamaño optimizado.
 */
export function getDriveThumbnailUrl(url: string | null | undefined, size: number = 800): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  return trimmed;
}

/**
 * Genera la URL local del proxy (/api/drive-image) para garantizar la carga 100%
 * libre de bloqueos de referrer, Safari ITP o CORS.
 */
export function getDriveProxyUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    return `/api/drive-image?id=${fileId}`;
  }

  return `/api/drive-image?url=${encodeURIComponent(trimmed)}`;
}
