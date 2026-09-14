// src/app/page.tsx
import { fetchLiveProducts } from "@/lib/data/getProducts";
import { MobileStorefront } from "@/components/home/MobileStorefront";

export const dynamic = 'force-static';

export default async function MobileHomePage() {
  const products = await fetchLiveProducts();
  return <MobileStorefront initialProducts={products} />;
}
