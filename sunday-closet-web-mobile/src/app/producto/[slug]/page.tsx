// src/app/producto/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchLiveProducts, getLiveProductBySlug } from "@/lib/data/getProducts";
import { MobileProductDetailView } from "@/components/product/MobileProductDetailView";
import type { Metadata } from "next";

export const dynamic = 'auto';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await fetchLiveProducts();
  const catalog = products && products.length > 0 ? products : [];
  return catalog.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);
  if (!product) return { title: "Prenda no encontrada — Sunday Clóset" };

  return {
    title: `${product.nombre} — Sunday Clóset Móvil`,
    description: product.descripcion,
  };
}

export default async function MobileProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await fetchLiveProducts();
  const related = (allProducts || []).filter(
    (p) => p.id !== product.id && p.categoriaRopa === product.categoriaRopa
  );

  return (
    <MobileProductDetailView
      product={product}
      relatedProducts={related}
    />
  );
}
