import { Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { Product } from "../types";
import { useCart } from "../context/useCart";
import { formatUnitPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-app-border/70 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="relative block">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full bg-app-cream object-contain p-2"
        />
        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-app-orange px-2 py-0.5 text-[10px] font-semibold text-white">
            {product.discount}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-1 text-sm font-normal text-zinc-700">
          <Link to={`/products/${product._id}`} className="hover:text-app-green">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1">
          <Star className="size-3 fill-app-warning text-app-warning" />
          <span className="text-xs font-medium text-app-green">{product.rating}</span>
          <span className="text-xs text-app-text-light">({product.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-medium text-zinc-700">
              {formatUnitPrice(product.price)}
            </span>
            <span className="text-xs text-app-text-light">/{product.unit}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-app-text-light line-through">
                {formatUnitPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-app-orange text-white transition hover:bg-app-orange-dark"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
