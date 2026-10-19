import { Banknote, Check, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, fetchAddresses } from "../lib/api";
import type { Address, Order } from "../types";
import { useCart } from "../context/useCart";
import { formatPrice } from "../utils/format";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchAddresses(controller.signal)
      .then((data) => {
        if (!active) return;
        setAddresses(data);
        const preferred = data.find((address) => address.isDefault) ?? data[0];
        setSelectedAddress(preferred?._id ?? "");
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setAddressError(
          fetchError instanceof Error ? fetchError.message : "Unable to load your addresses.",
        );
      })
      .finally(() => {
        if (active) setAddressesLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const deliveryFee = subtotal >= 20 ? 0 : 5;
  const tax = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = subtotal + deliveryFee + tax;

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacing(true);
    setOrderError("");

    try {
      const data = await api.post<{ order: Order }>("/orders", {
        items: items.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
        })),
        addressId: selectedAddress,
        paymentMethod,
      });
      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/orders/${data.order._id}`);
    } catch (placeError) {
      const message =
        placeError instanceof Error ? placeError.message : "Unable to place your order.";
      setOrderError(message);
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 px-8 py-24 text-center">
        <ShoppingBag className="size-12 text-app-border" />
        <h1 className="text-2xl font-semibold text-app-green">Your cart is empty</h1>
        <p className="text-sm text-app-text-light">Add some fresh groceries before checking out.</p>
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
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-app-green">Checkout</h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <section className="space-y-4 rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-app-green">
              <MapPin className="size-5" />
              Delivery Address
            </h2>

            {addressesLoading ? (
              <p className="rounded-xl bg-app-cream p-4 text-sm text-app-text-light">
                Loading your saved addresses...
              </p>
            ) : addressError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {addressError}
              </p>
            ) : addresses.length === 0 ? (
              <div className="rounded-xl border border-app-border bg-app-cream p-5">
                <p className="text-sm text-app-text-light">
                  You do not have a delivery address yet.
                </p>
                <Link
                  to="/addresses"
                  className="mt-3 inline-block rounded-lg bg-app-green px-4 py-2 text-sm font-semibold text-white"
                >
                  Add an Address
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => {
                  const isSelected = selectedAddress === address._id;
                  return (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => setSelectedAddress(address._id)}
                      className={`relative rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-app-green bg-app-cream"
                          : "border-app-border hover:border-app-green/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-app-green">{address.label}</span>
                        {isSelected && <Check className="size-4 text-app-green" />}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-app-text-light">
                        {address.address}
                        <br />
                        {address.city} {address.state} {address.zip}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold text-app-green">Payment Method</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "cash", label: "Cash on Delivery", icon: Banknote },
                { id: "card", label: "Credit / Debit Card", icon: CreditCard },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id as "cash" | "card")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    paymentMethod === option.id
                      ? "border-app-green bg-app-cream"
                      : "border-app-border hover:border-app-green/50"
                  }`}
                >
                  <option.icon className="size-5 text-app-green" />
                  <span className="text-sm font-medium text-app-green">{option.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="w-full space-y-4 rounded-2xl bg-white p-6 lg:w-[380px]">
          <h2 className="text-lg font-semibold text-app-green">Order Summary</h2>

          <ul className="space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product._id} className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-12 rounded-lg border border-app-border bg-app-cream object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-green">{product.name}</p>
                  <p className="text-xs text-app-text-light">x{quantity}</p>
                </div>
                <span className="text-sm font-semibold text-app-green">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-app-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-app-text-light">Subtotal</span>
              <span className="text-app-green">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-text-light">Delivery</span>
              <span className="text-app-green">
                {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-text-light">Tax</span>
              <span className="text-app-green">{formatPrice(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-app-border pt-2">
              <span className="font-semibold text-app-green">Total</span>
              <span className="font-semibold text-app-green">{formatPrice(total)}</span>
            </div>
          </div>

          {orderError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {orderError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handlePlaceOrder()}
            disabled={placing || addressesLoading || !selectedAddress}
            className="w-full rounded-xl bg-app-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-app-green-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
