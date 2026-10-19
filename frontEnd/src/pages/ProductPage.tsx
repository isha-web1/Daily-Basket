import { ArrowLeft, ArrowRight, Check, Home, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import DummyReviewsSection from "../assets/DummyReviewsSection";
import { api, fetchProducts } from "../lib/api";
import type { Product } from "../types";
import { useCart } from "../context/useCart";
import { formatPrice } from "../utils/format";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Product not found.");
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setQuantity(1);

    api
      .get<{ product: Product }>(`/products/${id}`, controller.signal)
      .then(async (data) => {
        if (!active) return;
        setProduct(data.product);
        try {
          const relatedData = await fetchProducts(
            {
              category: data.product.category,
              excludeId: data.product._id,
              limit: 4,
            },
            controller.signal,
          );
          if (active) setRelated(relatedData.products);
        } catch {
          if (active) setRelated([]);
        }
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setProduct(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load this product.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-8 py-10">
        <div className="grid animate-pulse gap-8 rounded-2xl bg-white p-8 lg:grid-cols-2">
          <div className="h-96 rounded-xl bg-app-cream" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-app-cream" />
            <div className="h-8 w-2/3 rounded bg-app-cream" />
            <div className="h-6 w-1/3 rounded bg-app-cream" />
            <div className="h-24 rounded bg-app-cream" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold text-app-green">Product unavailable</h1>
        <p className="text-sm text-app-text-light">{error || "This product could not be found."}</p>
        <Link
          to="/products"
          className="mt-2 rounded-xl bg-app-orange px-6 py-3 text-sm font-semibold text-white hover:bg-app-orange-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-6">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/" aria-label="Home" className="text-app-text-light hover:text-app-green">
          <Home className="size-4" />
        </Link>
        <span className="text-app-text-light">/</span>
        <Link to="/products" className="text-app-text-light hover:text-app-green">
          Products
        </Link>
        <span className="text-app-text-light">/</span>
        <Link
          to={`/products?category=${product.category}`}
          className="text-app-text-light hover:text-app-green"
        >
          {product.category}
        </Link>
        <span className="text-app-text-light">/</span>
        <span className="font-medium text-app-green">{product.name}</span>
      </nav>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative flex items-center justify-center bg-white p-12">
            <img
              src={product.image}
              alt={product.name}
              className="size-[360px] object-contain"
            />
            {product.discount > 0 && (
              <span className="absolute left-10 top-10 rounded-full bg-app-orange px-2.5 py-1 text-xs font-semibold text-white">
                {product.discount}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center gap-5 p-10">
            <span className="text-xs font-medium uppercase tracking-wide text-app-text-light">
              {product.category}
            </span>

            <h1 className="text-3xl font-semibold text-app-green">{product.name}</h1>

            <div className="flex items-center gap-2">
              <StarRating value={product.rating} />
              <span className="text-sm font-medium text-app-green">{product.rating}</span>
              <span className="text-sm text-app-text-light">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-app-green">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-app-text-light line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-sm text-app-text-light">/ {product.unit}</span>
            </div>

            <p className="text-sm leading-6 text-app-text-light">{product.description}</p>

            <p className="flex items-center gap-2 text-sm font-medium text-app-success">
              <Check className="size-4" />
              In Stock ({product.stock} available)
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center rounded-xl border border-app-border">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                  className="flex size-10 items-center justify-center text-app-green hover:bg-app-cream"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-app-green">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                  className="flex size-10 items-center justify-center text-app-green hover:bg-app-cream"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-app-orange px-6 py-3 text-base font-semibold text-white transition hover:bg-app-orange-dark"
              >
                <ShoppingCart className="size-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <DummyReviewsSection product={product} />

      <section className="mt-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-app-green">Related Products</h2>
            <p className="text-sm text-app-text-light">More from {product.category}</p>
          </div>
          <Link
            to={`/products?category=${product.category}`}
            className="flex items-center gap-1 text-sm font-semibold text-app-orange"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
