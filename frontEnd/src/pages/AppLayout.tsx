import { Outlet } from "react-router-dom";
import PromoBar from "../components/PromoBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-app-cream">
      <PromoBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
