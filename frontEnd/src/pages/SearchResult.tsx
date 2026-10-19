import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    fetchProducts({ search: query, limit: 100 }, controller.signal)
      .then((data) => {
        if (active) setResults(data.products);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to run your search.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-app-text-light">
        {loading ? "Searching products..." : `${results.length} products found`}
      </p>

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
          {error}
        </p>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
          {query ? "No products matched your search." : "Type a keyword to start searching."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
