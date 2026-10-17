import { ArrowLeft, Check, MapPin, Package, Phone, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { dummyDashboardOrdersData, statusColors } from "../assets/assets";
import { formatDateTime, formatFullDate, formatPrice } from "../utils/format";

const steps = ["Placed", "Confirmed", "Assigned", "Packed", "Out for Delivery", "Delivered"];

export default function OrderTracking() {
  const { id } = useParams();
  const order = dummyDashboardOrdersData.find((item) => item._id === id) ?? dummyDashboardOrdersData[0];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-app-text-light hover:text-app-green"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-app-green">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-app-text-light">Placed on {formatFullDate(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            statusColors[order.status] ?? "bg-app-cream text-app-text-light"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          {order.deliveryOtp && (
            <div className="space-y-3 rounded-2xl bg-gradient-to-r from-app-green to-app-green-light p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-white">
                  <ShieldCheck className="size-5 text-app-green" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Delivery OTP</h3>
                  <p className="text-xs text-white/90">Share this with your delivery partner</p>
                </div>
              </div>
              <div className="flex gap-2">
                {order.deliveryOtp.split("").map((digit, index) => (
                  <span
                    key={index}
                    className="flex h-13 w-11 items-center justify-center rounded-xl bg-white font-mono-data text-2xl font-bold text-app-green"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex h-70 items-center justify-center overflow-hidden rounded-2xl border border-app-border bg-app-cream-dark">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="relative flex flex-col items-center gap-2 text-app-text-light">
              <MapPin className="size-8 text-app-orange" />
              <p className="text-sm font-medium">{order.shippingAddress.address}</p>
              <p className="text-xs">
                {order.shippingAddress.city} {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold text-app-green">Delivery Progress</h2>

            <ol className="space-y-0">
              {steps.map((step, index) => {
                const entry = order.statusHistory.find((item) => item.status === step);
                const done = Boolean(entry);
                const isLast = index === steps.length - 1;

                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                          done ? "bg-app-green text-white" : "bg-app-cream text-app-text-light"
                        }`}
                      >
                        {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                      </span>
                      {!isLast && (
                        <span className={`w-0.5 flex-1 ${done ? "bg-app-green" : "bg-app-border"}`} />
                      )}
                    </div>
                    <div className={isLast ? "pb-0" : "pb-6"}>
                      <p className={`text-sm font-semibold ${done ? "text-app-green" : "text-app-text-light"}`}>
                        {step}
                      </p>
                      {entry && (
                        <p className="text-xs text-app-text-light">{formatDateTime(entry.timestamp)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-app-green text-base font-semibold text-white">
                {order.deliveryPartner?.name.charAt(0) ?? "D"}
              </span>
              <div>
                <p className="text-sm font-semibold text-app-green">
                  {order.deliveryPartner?.name ?? "Not assigned"}
                </p>
                <p className="text-xs text-app-text-light">• Delivery Partner</p>
              </div>
            </div>
            {order.deliveryPartner?.phone && (
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                aria-label="Call delivery partner"
                className="flex size-9 items-center justify-center rounded-xl bg-app-cream text-app-green hover:bg-app-cream-dark"
              >
                <Phone className="size-4" />
              </a>
            )}
          </div>
        </div>

        <div className="w-full space-y-5 lg:w-[347px]">
          <div className="space-y-3 rounded-2xl bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-app-green">
              <MapPin className="size-4" />
              Delivery Address
            </h3>
            <p className="text-sm leading-6 text-app-text-light">
              {order.shippingAddress.label}
              <br />
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city} {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-app-green">
              <Package className="size-4" />
              Items ({order.items.length})
            </h3>

            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item._id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-10 rounded-lg border border-app-border bg-app-cream object-contain p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-app-green">{item.name}</p>
                    <p className="text-xs text-app-text-light">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-app-green">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-app-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-app-text-light">Subtotal</span>
                <span className="text-app-green">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-text-light">Delivery</span>
                <span className="text-app-green">
                  {order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-text-light">Tax</span>
                <span className="text-app-green">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-app-border pt-2">
                <span className="font-semibold text-app-green">Total</span>
                <span className="font-semibold text-app-green">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
