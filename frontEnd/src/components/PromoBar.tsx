import { Leaf, Truck, X } from "lucide-react";
import { useState } from "react";

export default function PromoBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-app-green via-app-green-muted to-app-green text-white">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-6 px-8 py-2">
        <div className="flex items-center gap-2">
          <Truck className="size-4" />
          <span className="text-sm font-medium">Free delivery on orders above $20</span>
        </div>

        <span className="text-sm text-white/60">|</span>

        <div className="hidden items-center gap-2 sm:flex">
          <Leaf className="size-3.5" />
          <span className="text-sm">Farm-fresh produce delivered daily</span>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="ml-auto text-white/80 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
