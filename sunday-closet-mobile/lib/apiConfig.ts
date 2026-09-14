export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('github.io')) {
      return 'https://sunday-closet-dashboard.vercel.app';
    }
  }
  return '';
}
