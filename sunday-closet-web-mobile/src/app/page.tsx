// src/app/page.tsx
import { fetchLiveProducts } from "@/lib/data/getProducts";
import { InstagramCatalogFeed } from "@/components/home/InstagramCatalogFeed";

export const dynamic = 'force-dynamic';

export default async function MobileHomePage() {
  const products = await fetchLiveProducts();
  return <InstagramCatalogFeed initialProducts={products} />;
}
