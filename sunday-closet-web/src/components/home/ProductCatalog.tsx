'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/data/mockProducts';
import { mapItemToProduct, DASHBOARD_API_URL } from '@/lib/data/getProducts';
import HeroSection from '@/components/home/HeroSection';
import ProductGrid from '@/components/home/ProductGrid';

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    let isMounted = true;

    async function syncLiveCatalog() {
      try {
        const res = await fetch(DASHBOARD_API_URL, {
          cache: 'no-store',
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const live = data.products.map(mapItemToProduct);
          if (isMounted) {
            setProducts(live);
          }
        }
      } catch (err) {
        console.warn('Error syncing live catalog on client:', err);
      }
    }

    syncLiveCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = products.filter((p) => p.visibleEnWeb);
  const featuredProduct = visibleProducts[0] || products[0] || initialProducts[0];

  return (
    <>
      <HeroSection featuredProduct={featuredProduct} />
      <ProductGrid products={visibleProducts} />
    </>
  );
}
