import { Calendar, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statusColors } from "../assets/assets";
import { fetchOrders } from "../lib/api";
import type { Order } from "../types";
import { formatOrderDate, formatPrice } from "../utils/format";

const filters = ["All Orders", "Placed", "Out for Delivery", "Delivered"] as const;

export default function MyOrders() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All Orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    fetchOrders(
      {
        limit: 100,
        status: activeFilter === "All Orders" ? undefined : activeFilter,
      },
      controller.signal,
    )
      .then((data) => {
        if (active) setOrders(data.orders);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load your orders.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeFilter, reloadKey]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green">My Orders</h1>

      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-app-green text-white"
                : "bg-white text-app-text-light hover:bg-app-cream"
            }`}
          >
            {filter}
          </button>
        ))}
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
          No orders found.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id}>
              <Link
                to={`/orders/${order._id}`}
                className="flex flex-col gap-3 rounded-2xl bg-white p-5 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-app-green">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-app-text-light">
                      <Calendar className="size-3" />
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-4 py-1 text-xs font-medium ${
                        statusColors[order.status] ?? "bg-app-cream text-app-text-light"
                      }`}
                    >
                      {order.status}
                    </span>
                    <ChevronRight className="size-4 text-app-text-light" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.items.map((item) => (
                    <img
                      key={item._id}
                      src={item.image}
                      alt={item.name}
                      className="size-16 rounded-lg border border-app-border bg-app-cream object-contain p-1"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-app-border pt-3">
                  <span className="text-sm text-app-text-light">{order.items.length} items</span>
                  <span className="text-sm font-semibold text-app-green">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
