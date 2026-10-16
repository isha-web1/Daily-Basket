import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { formatPrice } from "../utils/format";

export default function CartDrawer() {
  const { items, isOpen, subtotal, closeCart, updateQuantity, removeItem } = useCart();

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-app-green/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-app-green">
            <ShoppingCart className="size-5" />
            Your Cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex size-8 items-center justify-center rounded-lg text-app-text-light hover:bg-app-cream"
          >
            <X className="size-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart className="size-10 text-app-border" />
            <p className="text-sm text-app-text-light">Your cart is empty.</p>
            <Link
              to="/products"
              onClick={closeCart}
              className="rounded-xl bg-app-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-orange-dark"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="flex gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-16 shrink-0 rounded-lg border border-app-border bg-app-cream object-contain p-1"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-app-green">{product.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(product._id)}
                        aria-label={`Remove ${product.name}`}
                        className="text-app-text-light hover:text-app-error"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-app-text-light">{formatPrice(product.price)} / {product.unit}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-app-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="flex size-7 items-center justify-center text-app-green hover:bg-app-cream"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-app-green">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex size-7 items-center justify-center text-app-green hover:bg-app-cream"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <span className="ml-auto text-sm font-semibold text-app-green">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-app-border px-5 py-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-app-text-light">Subtotal</span>
                <span className="text-base font-semibold text-app-green">{formatPrice(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="block rounded-xl bg-app-green px-5 py-3 text-center text-sm font-semibold text-white hover:bg-app-green-light"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
