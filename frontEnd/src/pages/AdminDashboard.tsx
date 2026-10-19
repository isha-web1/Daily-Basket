import {
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDeliveryPartners from "./admin/AdminDeliveryPartners";
import AdminOrders from "./admin/AdminOrders";
import AdminOverview from "./admin/AdminOverview";
import AdminProducts from "./admin/AdminProducts";

type AdminTab = "dashboard" | "add-product" | "products" | "orders" | "partners";

const navItems: {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add-product", label: "Add Product", icon: PackagePlus },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "partners", label: "Delivery Partners", icon: Truck },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-2xl border border-app-border bg-white p-4 lg:w-64">
          <div className="mb-4 flex items-center gap-2 border-b border-app-border px-2 pb-4">
            <LayoutDashboard className="size-5 text-app-green" />
            <h2 className="text-lg font-semibold text-app-green">Admin Panel</h2>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm transition ${
                  activeTab === item.id
                    ? "bg-app-green font-medium text-white"
                    : "text-app-text-light hover:bg-app-cream"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
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

        <div className="min-w-0 flex-1">
          {activeTab === "dashboard" && (
            <AdminOverview onViewOrders={() => setActiveTab("orders")} />
          )}
          {activeTab === "add-product" && (
            <AdminProducts
              createMode
              onCreated={() => setActiveTab("products")}
            />
          )}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "partners" && <AdminDeliveryPartners />}
        </div>
      </div>
    </div>
  );
}
