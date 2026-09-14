// src/app/producto/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchLiveProducts, getLiveProductBySlug } from "@/lib/data/getProducts";
import { getPodiaGustarte, getCombinaTuPrenda } from "@/lib/algorithms/recommendations";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCarousel from "@/components/product/ProductCarousel";
import ProductImage from "@/components/product/ProductImage";
import { formatPrice } from "@/lib/utils/format";
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
  if (!product) return { title: "Producto no encontrado — Sunday Clóset" };

  return {
    title: `${product.nombre} — Sunday Clóset`,
    description: product.descripcion,
    openGraph: {
      title: product.nombre,
      description: product.descripcion,
      images: [product.imagenUrl],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await fetchLiveProducts();
  const catalog = allProducts && allProducts.length > 0 ? allProducts : [product];
  const podiaGustarte = getPodiaGustarte(product, catalog);
  const combinaTuPrenda = getCombinaTuPrenda(product, catalog);

  const categoryLabel: Record<string, string> = {
    superior: "Superior",
    inferior: "Inferior",
    accesorio: "Accesorio",
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1F1F1F]">
      {/* Breadcrumb Navigation with generous top margin */}
      <div className="site-container pt-28 sm:pt-36 pb-6">
        <nav aria-label="Breadcrumb" className="text-xs font-light text-[#8A8880] tracking-wider flex items-center gap-2">
          <a href="/" className="hover:text-[#1F1F1F] transition-colors">
            Inicio
          </a>
          <span>/</span>
          <span className="text-[#1F1F1F] font-normal">{product.nombre}</span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <section className="site-container pb-16 sm:pb-24 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Column: Product Image */}
          <div className="relative">
            <div className="product-img-wrap relative aspect-[3/4] w-full bg-[#EFEDE8] rounded-xs overflow-hidden">
              <ProductImage
                src={product.imagenUrl}
                alt={product.nombre}
                loading="eager"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge status={product.estado} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8A8880] font-light tracking-widest uppercase">
              ✦ {product.drop}
            </p>
          </div>

          {/* Right Column: Details & Add to Cart */}
          <div className="flex flex-col pt-0 lg:pt-4 space-y-6">
            {/* Style & Category Pills */}
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-[0.2em] font-light text-[#C2A78C] uppercase">
                {product.estilo}
              </span>
              <span className="text-[#E5E3DD]">·</span>
              <span className="text-xs tracking-[0.2em] font-light text-[#8A8880] uppercase">
                {categoryLabel[product.categoriaRopa] || "Superior"}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display font-light text-3xl sm:text-5xl text-[#1F1F1F] leading-tight">
              {product.nombre}
            </h1>

            {/* Brand */}
            <p className="text-sm font-light text-[#8A8880] tracking-wide">
              {product.marca}
            </p>

            {/* Price */}
            <div className="pt-2 flex items-baseline gap-2">
              <span className="font-display font-medium text-3xl sm:text-4xl text-[#1F1F1F]">
                {formatPrice(product.precio)}
              </span>
              <span className="text-xs font-light text-[#8A8880] tracking-widest uppercase">
                MXN
              </span>
            </div>

            <hr className="border-[#E5E3DD]" />

            {/* Talla Tile */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-light">
                <span className="text-[#1F1F1F] uppercase tracking-wider">Talla Seleccionada</span>
                <span className="text-[#8A8880] underline cursor-pointer hover:text-[#1F1F1F]">
                  Guía de tallas
                </span>
              </div>
              <div className="inline-flex items-center justify-center w-12 h-12 border border-[#1F1F1F] rounded-xs">
                <span className="text-sm font-medium text-[#1F1F1F]">{product.talla}</span>
              </div>
              <p className="text-xs text-[#8A8880] font-light">
                Pieza única curada — solo 1 unidad disponible
              </p>
            </div>

            {/* Add to Cart Component */}
            <AddToCartButton product={product} />

            {/* Description */}
            <div className="border-t border-[#E5E3DD] pt-6 space-y-2">
              <h2 className="text-xs uppercase tracking-widest text-[#1F1F1F] font-medium">
                Descripción
              </h2>
              <p className="text-sm font-light text-[#5A5852] leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            {/* Policies */}
            <div className="pt-4 space-y-2 text-xs font-light text-[#8A8880] border-t border-[#E5E3DD]">
              <p>🔒 Pagos 100% seguros</p>
              <p>📦 Envíos rápidos a todo el país</p>
              <p>♻️ Moda circular — pieza única curada</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-20">
          <ProductCarousel
            title="Podría gustarte"
            subtitle={`Otras piezas de estilo ${product.estilo}`}
            products={podiaGustarte}
          />
        </div>

        <div className="mt-12">
          <ProductCarousel
            title="Combina tu prenda"
            subtitle={`Piezas que combinan perfectamente en talla ${product.talla}`}
            products={combinaTuPrenda}
          />
        </div>
      </section>
    </div>
  );
}
