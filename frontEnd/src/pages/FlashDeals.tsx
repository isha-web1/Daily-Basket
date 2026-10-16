import { Zap } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { dummyProducts } from "../assets/assets";

export default function FlashDeals() {
  return (
    <div className="pb-8">
      <section className="bg-gradient-to-r from-app-orange to-app-orange-dark py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-3 px-8 text-center text-white">
          <div className="flex items-center gap-2">
            <Zap className="size-6 fill-white" />
            <h1 className="text-3xl font-semibold">Flash Deals</h1>
            <Zap className="size-6 fill-white" />
          </div>
          <p className="max-w-lg text-base leading-6 text-white/95">
            Limited-time offers on your favorite organic products. Grab them before they&apos;re
            gone!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {dummyProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
