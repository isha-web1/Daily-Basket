import {
  AlertTriangle,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { statusColors } from "../../assets/assets";
import { fetchDashboardStats, type DashboardStats } from "../../lib/api";
import { formatPrice } from "../../utils/format";

interface AdminOverviewProps {
  onViewOrders: () => void;
}

export default function AdminOverview({ onViewOrders }: AdminOverviewProps) {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchDashboardStats()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load the dashboard.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const stats = [
    { label: "Total Orders", value: dashboard?.stats.totalOrders ?? 0, icon: ShoppingBag },
    { label: "Total Users", value: dashboard?.stats.totalUsers ?? 0, icon: Users },
    { label: "Total Products", value: dashboard?.stats.totalProducts ?? 0, icon: Package },
    { label: "Out of Stock", value: dashboard?.stats.outOfStock ?? 0, icon: AlertTriangle },
    { label: "Delivery Partners", value: dashboard?.stats.totalPartners ?? 0, icon: Truck },
  ];

  return (
    <div className="space-y-6">
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-app-border bg-white p-5"
            >
              <div className="space-y-0.5">
                <p className="text-2xl font-semibold text-app-text">
                  {loading ? "—" : stat.value}
                </p>
                <p className="text-sm text-app-text-light">{stat.label}</p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-app-orange-light">
                <stat.icon className="size-5 text-app-orange" />
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-app-border px-6 py-4">
          <h2 className="text-lg font-semibold text-app-text">Recent Orders</h2>
          <button
            type="button"
            onClick={onViewOrders}
            className="text-sm font-medium text-app-orange hover:text-app-orange-dark"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-app-cream">
                {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-app-text-faint"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-app-text-light">
                    Loading recent orders...
                  </td>
                </tr>
              ) : (dashboard?.recentOrders.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-app-text-light">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                dashboard?.recentOrders.map((order) => {
                  const customer = typeof order.user === "string" ? null : order.user;
                  return (
                    <tr key={order._id} className="border-b border-app-border last:border-b-0">
                      <td className="px-6 py-4 font-mono-data text-sm text-app-text-faint">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-app-text">
                          {customer?.name ?? "Unknown customer"}
                        </p>
                        <p className="text-xs text-app-text-faint">
                          {customer?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-app-text-muted">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-app-green">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusColors[order.status] ?? "bg-app-cream text-app-text-light"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono-data text-sm text-app-text-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
