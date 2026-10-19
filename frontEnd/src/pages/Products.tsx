import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categoriesData } from "../assets/assets";
import { fetchProducts, type Pagination } from "../lib/api";
import type { Product } from "../types";

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";

  const [category, setCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");

      fetchProducts(
        {
          page,
          limit: 12,
          category: category === "all" ? undefined : category,
          minPrice: minPrice === "" ? undefined : Number(minPrice),
          maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
          sort,
        },
        controller.signal,
      )
        .then((data) => {
          if (!active) return;
          setProducts(data.products);
          setPagination(data.pagination);
        })
        .catch((fetchError: unknown) => {
          if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
            return;
          }
          setError(
            fetchError instanceof Error ? fetchError.message : "Unable to load products.",
          );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [category, minPrice, maxPrice, sort, page, reloadKey]);

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function updateSort(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-6">
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link to="/" aria-label="Home" className="text-app-text-light hover:text-app-green">
          <Home className="size-4" />
        </Link>
        <span className="text-app-text-light">/</span>
        <span className="font-medium text-app-green">All Products</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="space-y-6 rounded-2xl border border-app-border bg-white p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-app-green">Categories</h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => updateCategory("all")}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    category === "all"
                      ? "bg-app-green font-medium text-white"
                      : "text-app-text-light hover:bg-app-cream"
                  }`}
                >
                  All Categories
                </button>
                {categoriesData.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => updateCategory(item.slug)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      category === item.slug
                        ? "bg-app-green font-medium text-white"
                        : "text-app-text-light hover:bg-app-cream"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-app-green">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Min"
                  className="h-[38px] w-full rounded-lg border border-app-border bg-white px-3 text-sm text-app-green placeholder:text-app-text-light"
                />
                <span className="text-app-text-light">—</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Max"
                  className="h-[38px] w-full rounded-lg border border-app-border bg-white px-3 text-sm text-app-green placeholder:text-app-text-light"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-semibold text-app-green">All Products</h1>
              <p className="text-sm text-app-text-light">
                {loading ? "Loading products..." : `${pagination.total} products found`}
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-app-border bg-white px-4 py-2 text-sm text-app-green">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => updateSort(event.target.value as SortOption)}
                className="cursor-pointer bg-transparent text-sm text-app-green focus:outline-none"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-app-green shadow-sm"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
              No products match your filters.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-lg border border-app-border bg-white px-4 py-2 text-sm font-medium text-app-green disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-app-text-light">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(pagination.totalPages, current + 1))
                    }
                    className="rounded-lg border border-app-border bg-white px-4 py-2 text-sm font-medium text-app-green disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
