// src/app/page.tsx
import { fetchLiveProducts } from "@/lib/data/getProducts";
import HeroSection from "@/components/home/HeroSection";
import ProductGrid from "@/components/home/ProductGrid";

export const revalidate = 0; // Fresh fetch on every request

export default async function HomePage() {
  const products = await fetchLiveProducts();
  const visibleProducts = products.filter((p) => p.visibleEnWeb);
  const featuredProduct = visibleProducts[0] || products[0];

  return (
    <>
      <HeroSection featuredProduct={featuredProduct} />
      <ProductGrid products={visibleProducts} />
    </>
  );
}
