import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";

export default function FlashDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchProducts({ deals: true, limit: 100, sort: "price-asc" }, controller.signal)
      .then((data) => {
        if (active) setProducts(data.products);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load flash deals.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="pb-8">
      <section className="bg-gradient-to-r from-app-orange to-app-orange-dark py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-3 px-8 text-center text-white">
          <div className="flex items-center gap-2">
            <Zap className="size-6 fill-white" />
            <h1 className="text-3xl font-semibold">Flash Deals</h1>
            <Zap className="size-6 fill-white" />
          </div>
          <p className="max-w-lg text-base leading-6 text-white/95">
            Limited-time offers on your favorite organic products. Grab them before they&apos;re
            gone!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-8 py-8">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
            {error}
          </p>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
            No deals are available right now. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
