import {
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { dummyAdminDashboardData, statusColors } from "../assets/assets";
import { formatPrice } from "../utils/format";

const stats = [
  { label: "Total Orders", value: dummyAdminDashboardData.totalOrders, icon: ShoppingBag },
  { label: "Total Users", value: dummyAdminDashboardData.totalUsers, icon: Users },
  { label: "Total Products", value: dummyAdminDashboardData.totalProducts, icon: Package },
  { label: "Out of Stock", value: dummyAdminDashboardData.outOfStock, icon: AlertTriangle },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Add Product", icon: PackagePlus },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ShoppingBag },
  { label: "Delivery Partners", icon: Truck },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-2xl border border-app-border bg-white p-4 lg:w-64">
          <div className="mb-4 flex items-center gap-2 border-b border-app-border px-2 pb-4">
            <LayoutDashboard className="size-5 text-app-green" />
            <h2 className="text-lg font-semibold text-app-green">Admin Panel</h2>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition ${
                  item.active
                    ? "bg-app-green font-medium text-white"
                    : "text-app-text-light hover:bg-app-cream"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-sm text-app-text-light transition hover:bg-app-cream"
            >
              <LogOut className="size-4" />
              Exit
            </button>
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-white p-5"
              >
                <div className="space-y-0.5">
                  <p className="text-2xl font-semibold text-app-text">{stat.value}</p>
                  <p className="text-sm text-app-text-light">{stat.label}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-app-orange-light">
                  <stat.icon className="size-5 text-app-orange" />
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-app-border px-6 py-4">
              <h2 className="text-lg font-semibold text-app-text">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-medium text-app-orange hover:text-app-orange-dark">
                View All →
              </Link>
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
                  {dummyAdminDashboardData.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-app-border last:border-b-0">
                      <td className="px-6 py-4 font-mono-data text-sm text-app-text-faint">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-app-text">{order.user.name}</p>
                        <p className="text-xs text-app-text-faint">{order.user.email}</p>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
