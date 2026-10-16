import { Home } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categoriesData, dummyProducts } from "../assets/assets";

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";

  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const products = useMemo(() => {
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);

    const filtered = dummyProducts.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesPrice = product.price >= min && product.price <= max;
      return matchesCategory && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [category, minPrice, maxPrice, sort]);

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
                  onClick={() => setCategory("all")}
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
                    onClick={() => setCategory(item.slug)}
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
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Min"
                  className="h-[38px] w-full rounded-lg border border-app-border bg-white px-3 text-sm text-app-green placeholder:text-app-text-light"
                />
                <span className="text-app-text-light">—</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
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
              <p className="text-sm text-app-text-light">{products.length} products found</p>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-app-border bg-white px-4 py-2 text-sm text-app-green">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
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

          {products.length === 0 ? (
            <p className="rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
              No products match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
