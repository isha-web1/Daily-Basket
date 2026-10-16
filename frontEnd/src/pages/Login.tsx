import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShoppingCartPlus,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { heroSectionData } from "../assets/assets";

export default function Login() {
  const [isLoginState, setLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center">
        <img
          src={heroSectionData.hero_image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="relative px-12 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-white">
            Welcome Back To InstantMart
          </h2>
          <p className="mx-auto max-w-sm font-serif text-xl text-white/60">
            Fresh groceries and organic produce, delivered to your doorstep
          </p>
        </div>
      </div>

      <div className="flex-1 bg-app-cream px-4 py-12 flex-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <ShoppingCartPlus className="size-8 text-app-green" />
              <span className="text-2xl font-semibold">InstantMart</span>
            </Link>

            <h1 className="mb-2 text-2xl font-semibold text-app-green">
              {isLoginState
                ? "Sign in to your account"
                : "Sign up for an account"}
            </h1>

            <p className="text-sm text-app-text-light">
              {isLoginState
                ? "Don't have an account?"
                : "Already have an account"}
              <button
                type="button"
                onClick={() => setLoginState(!isLoginState)}
                className="ml-1 font-semibold text-orange-500 hover:text-orange-600"
              >
                {isLoginState ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginState && (
              <label className="flex flex-col gap-1 text-sm font-medium text-app-text">
                Name
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-app-text-light" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-app-border bg-white py-3 pl-11 pr-4 text-sm text-app-text placeholder:text-app-text-light transition-all focus:border-app-green"
                  />
                </div>
              </label>
            )}

            <label className="flex flex-col gap-1 text-sm font-medium text-app-text">
              Email address
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-app-text-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-app-border bg-white py-3 pl-11 pr-4 text-sm text-app-text placeholder:text-app-text-light transition-all focus:border-app-green"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-text">
              Password
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-app-text-light" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-app-border bg-white py-3 pl-11 pr-11 text-sm text-app-text placeholder:text-app-text-light transition-all focus:border-app-green"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-light hover:text-app-green"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-app-text-light">
                <input type="checkbox" className="h-4 w-4 accent-app-orange" />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-app-green hover:text-app-green-light"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-app-green px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-app-green-light disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? isLoginState
                  ? "Signing in..."
                  : "Creating account..."
                : isLoginState
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
