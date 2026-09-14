// src/app/page.tsx
import { fetchLiveProducts } from "@/lib/data/getProducts";
import ProductCatalog from "@/components/home/ProductCatalog";

export const dynamic = 'force-static';

export default async function HomePage() {
  const products = await fetchLiveProducts();

  return <ProductCatalog initialProducts={products} />;
}

