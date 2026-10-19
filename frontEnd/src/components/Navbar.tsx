import { ChevronDown, LayoutDashboard, LogOut, MapPin, Package, Search, ShoppingBasket, ShoppingCart, User } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Deals", to: "/deals" },
];

const accountLinks = [
  { label: "My Account", to: "/addresses", icon: User, adminOnly: false },
  { label: "My Orders", to: "/orders", icon: Package, adminOnly: false },
  { label: "Addresses", to: "/addresses", icon: MapPin, adminOnly: false },
  { label: "Admin Dashboard", to: "/admin", icon: LayoutDashboard, adminOnly: true },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { count, openCart } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  async function handleSignOut() {
    setMenuOpen(false);
    await logout();
    toast.success("Signed out");
    navigate("/login");
  }

  const visibleAccountLinks = accountLinks.filter(
    (link) => !link.adminOnly || isAdmin,
  );

  return (
    <header className="border-b border-app-border bg-white">
      <nav className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-8">
        <Link to="/" className="flex items-center gap-2">
          <ShoppingBasket className="size-6 text-app-green" />
          <span className="text-[22px] font-medium leading-8 text-app-green">Daily Basket</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-10">
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm ${
                      isActive
                        ? "font-medium text-app-orange"
                        : "text-app-text-muted hover:text-app-green"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-orange" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for groceries..."
              className="h-9 w-72 rounded-full bg-app-orange-light py-2 pl-9 pr-4 text-sm text-app-green placeholder:text-app-green/60 lg:w-96"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="relative flex size-9 items-center justify-center rounded-xl text-app-green hover:bg-app-cream"
            >
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-app-orange text-[10px] font-medium text-white">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-app-cream"
                  aria-label="Open account menu"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-app-green-dark text-base text-white">
                    {user.name.trim().charAt(0).toUpperCase() || "U"}
                  </span>
                  <ChevronDown className="size-3 text-app-text-muted" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-app-border bg-white py-1 shadow-lg">
                    <div className="border-b border-app-border px-4 py-3">
                      <p className="truncate text-sm font-medium text-app-green">{user.name}</p>
                      <p className="truncate text-xs text-app-text-light">{user.email}</p>
                    </div>
                    {visibleAccountLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-text-muted hover:bg-app-cream hover:text-app-green"
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="flex w-full items-center gap-3 border-t border-app-border px-4 py-2.5 text-sm text-app-text-muted hover:bg-app-cream hover:text-app-green"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-app-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-green-light"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
