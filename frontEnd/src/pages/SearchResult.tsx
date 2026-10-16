import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { dummyProducts } from "../assets/assets";

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const results = useMemo(() => {
    const term = query.toLowerCase();
    if (!term) return [];
    return dummyProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-app-text-light">{results.length} products found</p>

      {results.length === 0 ? (
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
