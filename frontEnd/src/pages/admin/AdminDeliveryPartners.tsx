import {
  Bike,
  Car,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createAdminPartner,
  deleteAdminPartner,
  fetchAdminPartners,
  updateAdminPartner,
  type DeliveryPartnerInput,
} from "../../lib/adminApi";
import type { DeliveryPartner } from "../../types";
import { getInitials } from "../../utils/format";

interface PartnerFormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  vehicleType: "bike" | "scooter" | "car";
  isActive: boolean;
}

const emptyForm: PartnerFormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  avatar: "",
  vehicleType: "bike",
  isActive: true,
};

const vehicleIcons = {
  bike: Bike,
  scooter: Bike,
  car: Car,
};

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryPartner | null>(null);
  const [form, setForm] = useState<PartnerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminPartners()
      .then((data) => {
        if (active) setPartners(data);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load delivery partners.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(partner: DeliveryPartner) {
    setEditing(partner);
    setForm({
      name: partner.name,
      email: partner.email,
      password: "",
      phone: partner.phone,
      avatar: partner.avatar,
      vehicleType: partner.vehicleType,
      isActive: partner.isActive,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function updateField<Key extends keyof PartnerFormState>(
    field: Key,
    value: PartnerFormState[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const base: DeliveryPartnerInput = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar.trim(),
        vehicleType: form.vehicleType,
        isActive: form.isActive,
      };

      if (editing) {
        await updateAdminPartner(editing._id, {
          ...base,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("Delivery partner updated");
      } else {
        await createAdminPartner({ ...base, password: form.password });
        toast.success("Delivery partner added");
      }

      closeForm();
      setReloadKey((key) => key + 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to save this delivery partner.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(partner: DeliveryPartner) {
    if (
      !window.confirm(
        `Delete delivery partner "${partner.name}"? Assigned orders will be unassigned.`,
      )
    ) {
      return;
    }

    setDeletingId(partner._id);
    setError("");
    try {
      await deleteAdminPartner(partner._id);
      toast.success("Delivery partner deleted");
      if (editing?._id === partner._id) closeForm();
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this delivery partner.";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-app-green">Delivery Partners</h1>
          <p className="mt-1 text-sm text-app-text-light">
            Manage the couriers available for order assignment
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
          >
            <Plus className="size-4" />
            Add Partner
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-app-border bg-white p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-app-green">
              {editing ? `Edit ${editing.name}` : "New Delivery Partner"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close delivery partner form"
              className="flex size-8 items-center justify-center rounded-lg text-app-text-light hover:bg-app-cream hover:text-app-green"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Name
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Courier name"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="courier@example.com"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              {editing ? "New Password" : "Password"}
              <input
                type="password"
                required={!editing}
                minLength={form.password ? 8 : undefined}
                maxLength={72}
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder={editing ? "Leave blank to keep current password" : "Minimum 8 characters"}
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Phone
              <input
                type="tel"
                required
                minLength={3}
                maxLength={30}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+1 555 0100"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Vehicle
              <select
                value={form.vehicleType}
                onChange={(event) =>
                  updateField("vehicleType", event.target.value as PartnerFormState["vehicleType"])
                }
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green focus:border-app-green"
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Avatar URL
              <input
                type="url"
                value={form.avatar}
                onChange={(event) => updateField("avatar", event.target.value)}
                placeholder="https://example.com/avatar.png"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-app-green sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className="h-4 w-4 accent-app-orange"
              />
              Active and available for assignment
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-app-border bg-white px-5 py-2.5 text-sm font-semibold text-app-text-light hover:bg-app-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-app-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Partner"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-white p-10 text-center">
          <Truck className="mx-auto mb-3 size-8 text-app-text-light" />
          <p className="text-sm text-app-text-light">
            No delivery partners yet. Add one to start assigning orders.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => {
            const VehicleIcon = vehicleIcons[partner.vehicleType] ?? Bike;
            return (
              <article
                key={partner._id}
                className="flex flex-col gap-4 rounded-2xl border border-app-border bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="size-11 rounded-full border border-app-border object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-app-green text-sm font-semibold text-white">
                        {getInitials(partner.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-app-green">
                        {partner.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-app-text-light">
                        <VehicleIcon className="size-3.5" />
                        {partner.vehicleType}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      partner.isActive
                        ? "bg-app-success-light text-app-success-dark"
                        : "bg-app-cream text-app-text-light"
                    }`}
                  >
                    {partner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-app-text-light">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="size-3.5 shrink-0" />
                    {partner.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" />
                    {partner.phone}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-end gap-2 border-t border-app-border pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(partner)}
                    className="flex items-center gap-1.5 rounded-lg bg-app-cream px-3 py-1.5 text-xs font-semibold text-app-green hover:bg-app-cream-dark"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === partner._id}
                    onClick={() => void handleDelete(partner)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                    {deletingId === partner._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
