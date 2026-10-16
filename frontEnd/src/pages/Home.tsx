import { ArrowRight, Leaf, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import {
  appPromoBannerData,
  assets,
  categoriesData,
  dummyProducts,
  heroSectionData,
} from "../assets/assets";

export default function Home() {
  const [email, setEmail] = useState("");

  function handleSubscribe(event: FormEvent) {
    event.preventDefault();
    toast.success("Subscribed! Watch your inbox for fresh offers.");
    setEmail("");
  }

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={assets.hero_bg}
            alt="Fresh produce on a farm"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-app-green/90 via-app-green/70 to-app-green/20" />

          <div className="relative px-8 py-20 lg:px-10">
            <div className="max-w-[560px] space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-app-orange/20 px-4 py-1.5 text-xs font-semibold text-app-orange-light">
                <Leaf className="size-3" />
                Farm-Fresh &amp; Organic
              </span>

              <h1 className="font-serif text-5xl leading-[1.1] text-white lg:text-6xl">
                Nourish your home with Earth&apos;s finest
              </h1>

              <p className="max-w-[440px] text-base leading-6 text-white/90">
                {heroSectionData.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff8904] px-7 py-3 text-base font-semibold text-white transition hover:bg-app-orange-dark"
                >
                  Shop Now
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center rounded-full border border-white bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Browse Categories
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pt-6">
        <div className="grid gap-4 rounded-xl border border-app-border bg-white px-8 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {heroSectionData.hero_features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-app-cream">
                <feature.icon className="size-5 text-app-green" />
              </span>
              <div>
                <p className="text-sm font-semibold text-app-green">{feature.title}</p>
                <p className="text-xs text-app-text-light">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-[1320px] px-4 py-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-semibold text-app-green">Browse Categories</h2>
          <p className="text-sm text-app-text-light">Find exactly what you need using</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {categoriesData.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="flex w-[136px] shrink-0 flex-col items-center gap-3 rounded-2xl p-4 transition hover:bg-white"
            >
              <span className="flex size-[104px] items-center justify-center rounded-2xl bg-app-orange-light p-2">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="size-[88px] rounded-xl object-contain"
                />
              </span>
              <span className="text-center text-xs font-medium text-app-text-muted">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-app-green">Popular Products</h2>
            <p className="text-sm text-app-text-light">Top-rated products this season</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-app-orange">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {dummyProducts.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-8">
        <div className="grid items-center gap-6 overflow-hidden rounded-2xl bg-app-green-dark px-8 py-10 lg:grid-cols-2 lg:px-10">
          <div className="space-y-4">
            <h2 className="max-w-[440px] font-serif text-4xl leading-tight text-white">
              {appPromoBannerData.title}
            </h2>
            <p className="max-w-[460px] text-base leading-6 text-white/90">
              {appPromoBannerData.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="button"
                className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-app-green-dark transition hover:bg-app-cream"
              >
                App Store
              </button>
              <button
                type="button"
                className="rounded-xl border border-white bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Google Play
              </button>
            </div>
          </div>
          <img
            src={assets.delivery_truck}
            alt="Delivery truck"
            className="mx-auto max-h-44 w-full max-w-[480px] object-contain"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-12">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-xl bg-white shadow-md">
            <Mail className="size-8 text-app-green" />
          </span>
          <h2 className="text-3xl font-semibold text-app-green">Subscribe to our Newsletter</h2>
          <p className="max-w-[640px] text-base leading-6 text-app-text-light">
            Get weekly updates on fresh produce, seasonal offers, and exclusive discounts right to
            your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="h-[52px] flex-1 rounded-xl border border-app-border bg-white px-5 text-sm text-app-green placeholder:text-app-text-light"
            />
            <button
              type="submit"
              className="h-[52px] rounded-xl bg-app-green px-8 text-base font-semibold text-white transition hover:bg-app-green-light"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
