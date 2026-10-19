import {
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Package,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { statusColors } from "../../assets/assets";
import {
  assignAdminOrderPartner,
  fetchAdminOrders,
  fetchAdminPartners,
  updateAdminOrderStatus,
  type AdminOrdersResponse,
} from "../../lib/adminApi";
import { ORDER_STATUSES, getNextStatuses } from "../../lib/orderStatus";
import type { DeliveryPartner, Order } from "../../types";
import { formatDateTime, formatOrderDate, formatPrice } from "../../utils/format";

function getCustomer(order: Order) {
  return typeof order.user === "string" ? null : order.user;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<AdminOrdersResponse["pagination"] | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [partnerSelection, setPartnerSelection] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [actionBusy, setActionBusy] = useState<"partner" | "status" | "">("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminOrders(
      {
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      },
      controller.signal,
    )
      .then((data) => {
        if (!active) return;
        setOrders(data.orders);
        setPagination(data.pagination);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load orders.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, search, statusFilter, reloadKey]);

  useEffect(() => {
    let active = true;

    fetchAdminPartners()
      .then((data) => {
        if (active) setPartners(data);
      })
      .catch(() => {
        if (active) setPartners([]);
      });

    return () => {
      active = false;
    };
  }, []);

  function openOrder(order: Order) {
    setSelectedOrder(order);
    setPartnerSelection(order.deliveryPartner?._id ?? "");
    setNextStatus(getNextStatuses(order.status)[0] ?? "");
    setStatusNote("");
  }

  function closeOrder() {
    setSelectedOrder(null);
    setPartnerSelection("");
    setNextStatus("");
    setStatusNote("");
    setActionBusy("");
  }

  function applyOrder(updated: Order, message: string) {
    setOrders((current) =>
      current.map((order) => (order._id === updated._id ? updated : order)),
    );
    setSelectedOrder(updated);
    setPartnerSelection(updated.deliveryPartner?._id ?? "");
    setNextStatus(getNextStatuses(updated.status)[0] ?? "");
    setStatusNote("");
    toast.success(message);
  }

  async function handleAssignPartner() {
    if (!selectedOrder) return;
    if (!partnerSelection) {
      toast.error("Choose a delivery partner first");
      return;
    }

    setActionBusy("partner");
    try {
      const updated = await assignAdminOrderPartner(selectedOrder._id, partnerSelection);
      applyOrder(updated, "Delivery partner assigned");
    } catch (assignError) {
      toast.error(
        assignError instanceof Error
          ? assignError.message
          : "Unable to assign this delivery partner.",
      );
    } finally {
      setActionBusy("");
    }
  }

  async function handleStatusUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selectedOrder || !nextStatus) return;

    setActionBusy("status");
    try {
      let order = selectedOrder;

      if (nextStatus === "Assigned" && !order.deliveryPartner) {
        if (!partnerSelection) {
          throw new Error("Assign a delivery partner before moving this order to Assigned.");
        }
        order = await assignAdminOrderPartner(order._id, partnerSelection);
      }

      const updated = await updateAdminOrderStatus(
        order._id,
        nextStatus,
        statusNote.trim() || undefined,
      );
      applyOrder(updated, `Order moved to ${updated.status}`);
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update the order status.",
      );
    } finally {
      setActionBusy("");
    }
  }

  const totalPages = pagination?.totalPages ?? 1;
  const activePartners = partners.filter((partner) => partner.isActive);
  const assignablePartners = selectedOrder
    ? partners.filter(
        (partner) =>
          partner.isActive || partner._id === selectedOrder.deliveryPartner?._id,
      )
    : activePartners;
  const allowedStatuses = selectedOrder ? getNextStatuses(selectedOrder.status) : [];
  const orderClosed =
    selectedOrder?.status === "Delivered" || selectedOrder?.status === "Cancelled";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-app-green">Orders</h1>
        <p className="mt-1 text-sm text-app-text-light">
          Review orders, assign couriers, and advance delivery status
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-app-text-light" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by order ID, customer name, or email"
            className="w-full rounded-xl border border-app-border bg-white py-2.5 pl-10 pr-4 text-sm text-app-green placeholder:text-app-text-light focus:border-app-green"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm text-app-green focus:border-app-green"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
        >
          Search
        </button>

        {(search || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-sm font-medium text-app-text-light hover:text-app-green"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="bg-app-cream">
                {[
                  "Order",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Partner",
                  "Date",
                  "Manage",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-app-text-faint"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-app-text-light">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-app-text-light">
                    No orders match these filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customer = getCustomer(order);
                  return (
                    <tr key={order._id} className="border-b border-app-border last:border-b-0">
                      <td className="px-5 py-4">
                        <p className="font-mono-data text-sm font-semibold text-app-green">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-app-text-light">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-app-green">
                          {customer?.name ?? "Unknown customer"}
                        </p>
                        <p className="text-xs text-app-text-light">
                          {customer?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-app-text-muted">
                        {order.items.length}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-app-green">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusColors[order.status] ?? "bg-app-cream text-app-text-light"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {order.deliveryPartner ? (
                          <div>
                            <p className="text-sm font-medium text-app-green">
                              {order.deliveryPartner.name}
                            </p>
                            <p className="text-xs text-app-text-light">
                              {order.deliveryPartner.vehicleType}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-app-text-light">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-app-text-light">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openOrder(order)}
                          className="rounded-lg bg-app-cream px-3 py-1.5 text-xs font-semibold text-app-green hover:bg-app-cream-dark"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-5 py-3 text-sm text-app-text-light">
          <span>
            {pagination
              ? `${pagination.total} order${pagination.total === 1 ? "" : "s"}`
              : "Orders"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-app-border px-3 py-1.5 font-medium text-app-green hover:bg-app-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-1">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-app-border px-3 py-1.5 font-medium text-app-green hover:bg-app-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Manage order ${selectedOrder._id}`}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-app-green/50 p-4 backdrop-blur-sm sm:p-8"
          onClick={closeOrder}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl bg-app-cream shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-app-green">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <p className="flex items-center gap-1.5 text-xs text-app-text-light">
                  <Calendar className="size-3" />
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[selectedOrder.status] ?? "bg-app-cream text-app-text-light"
                  }`}
                >
                  {selectedOrder.status}
                </span>
                <button
                  type="button"
                  onClick={closeOrder}
                  aria-label="Close order details"
                  className="flex size-8 items-center justify-center rounded-lg text-app-text-light hover:bg-app-cream hover:text-app-green"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:p-6">
              <div className="space-y-5">
                <section className="rounded-2xl bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-green">
                    <UserRound className="size-4" />
                    Customer
                  </h3>
                  <p className="text-sm font-medium text-app-green">
                    {getCustomer(selectedOrder)?.name ?? "Unknown customer"}
                  </p>
                  <p className="text-sm text-app-text-light">
                    {getCustomer(selectedOrder)?.email ?? "—"}
                  </p>
                  {getCustomer(selectedOrder)?.phone && (
                    <p className="text-sm text-app-text-light">
                      {getCustomer(selectedOrder)?.phone}
                    </p>
                  )}
                  <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-app-text-light">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {selectedOrder.shippingAddress.label}:{" "}
                      {selectedOrder.shippingAddress.address},{" "}
                      {selectedOrder.shippingAddress.city}{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zip}
                    </span>
                  </p>
                </section>

                <section className="rounded-2xl bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-green">
                    <Package className="size-4" />
                    Items ({selectedOrder.items.length})
                  </h3>
                  <ul className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <li key={item._id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-11 rounded-lg border border-app-border bg-app-cream object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-app-green">
                            {item.name}
                          </p>
                          <p className="text-xs text-app-text-light">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-app-green">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 space-y-2 border-t border-app-border pt-4 text-sm">
                    <div className="flex items-center justify-between text-app-text-light">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-app-text-light">
                      <span>Delivery</span>
                      <span>
                        {selectedOrder.deliveryFee === 0
                          ? "Free"
                          : formatPrice(selectedOrder.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-app-text-light">
                      <span>Tax</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-app-border pt-2 font-semibold text-app-green">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-green">
                    <CheckCircle2 className="size-4" />
                    Status History
                  </h3>
                  <ol className="space-y-3">
                    {selectedOrder.statusHistory.length === 0 ? (
                      <li className="text-sm text-app-text-light">No history yet.</li>
                    ) : (
                      [...selectedOrder.statusHistory].reverse().map((entry, index) => (
                        <li key={`${entry.status}-${entry.timestamp}-${index}`} className="flex gap-3">
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-app-green" />
                          <div>
                            <p className="text-sm font-medium text-app-green">{entry.status}</p>
                            <p className="text-xs text-app-text-light">
                              {formatDateTime(entry.timestamp)}
                              {entry.note ? ` • ${entry.note}` : ""}
                            </p>
                          </div>
                        </li>
                      ))
                    )}
                  </ol>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-green">
                    <Truck className="size-4" />
                    Delivery Partner
                  </h3>

                  {selectedOrder.deliveryPartner ? (
                    <div className="mb-3 rounded-xl bg-app-cream p-3">
                      <p className="text-sm font-semibold text-app-green">
                        {selectedOrder.deliveryPartner.name}
                      </p>
                      <p className="text-xs text-app-text-light">
                        {selectedOrder.deliveryPartner.phone} •{" "}
                        {selectedOrder.deliveryPartner.vehicleType}
                      </p>
                    </div>
                  ) : (
                    <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
                      No delivery partner is assigned to this order yet.
                    </p>
                  )}

                  <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
                    Choose partner
                    <select
                      value={partnerSelection}
                      onChange={(event) => setPartnerSelection(event.target.value)}
                      disabled={orderClosed || actionBusy !== ""}
                      className="rounded-xl border border-app-border bg-white px-3 py-2.5 text-sm font-normal text-app-green disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Select a partner</option>
                      {assignablePartners.map((partner) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.name}
                          {partner.isActive ? "" : " (inactive)"} • {partner.vehicleType}
                        </option>
                      ))}
                    </select>
                  </label>

                  {activePartners.length === 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      Add an active delivery partner before assigning orders.
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={
                      orderClosed ||
                      !partnerSelection ||
                      actionBusy !== "" ||
                      partnerSelection === selectedOrder.deliveryPartner?._id
                    }
                    onClick={() => void handleAssignPartner()}
                    className="mt-3 w-full rounded-xl bg-app-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionBusy === "partner" ? "Assigning..." : "Assign Partner"}
                  </button>
                </section>

                <section className="rounded-2xl bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-app-green">
                    <CircleDollarSign className="size-4" />
                    Update Status
                  </h3>

                  {orderClosed ? (
                    <p className="rounded-xl bg-app-cream p-3 text-sm text-app-text-light">
                      This order is {selectedOrder.status.toLowerCase()} and can no longer be
                      changed.
                    </p>
                  ) : allowedStatuses.length === 0 ? (
                    <p className="text-sm text-app-text-light">No status changes available.</p>
                  ) : (
                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                      <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
                        Next status
                        <select
                          value={nextStatus}
                          onChange={(event) => setNextStatus(event.target.value)}
                          disabled={actionBusy !== ""}
                          className="rounded-xl border border-app-border bg-white px-3 py-2.5 text-sm font-normal text-app-green disabled:opacity-60"
                        >
                          {allowedStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      {nextStatus === "Assigned" && !selectedOrder.deliveryPartner && (
                        <p className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
                          Select a delivery partner above. It will be assigned automatically
                          when you continue.
                        </p>
                      )}

                      <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
                        Note <span className="font-normal text-app-text-light">(optional)</span>
                        <input
                          type="text"
                          maxLength={200}
                          value={statusNote}
                          onChange={(event) => setStatusNote(event.target.value)}
                          placeholder="Optional status note"
                          className="rounded-xl border border-app-border bg-white px-3 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={!nextStatus || actionBusy !== ""}
                        className="w-full rounded-xl bg-app-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-app-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionBusy === "status" ? "Updating..." : "Update Status"}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
