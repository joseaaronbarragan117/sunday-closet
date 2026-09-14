// src/lib/data/getBanner.ts

const DASHBOARD_BANNER_API =
  process.env.NEXT_PUBLIC_BANNER_API_URL || 'http://localhost:3000/api/banner';

export async function fetchBannerUrl(): Promise<string | null> {
  try {
    const res = await fetch(DASHBOARD_BANNER_API, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.bannerUrl) {
      return data.bannerUrl;
    }
  } catch (error) {
    console.warn('[Storefront] Could not fetch custom banner URL:', error);
  }

  return null;
}
