import { MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, fetchAddresses } from "../lib/api";
import type { Address } from "../types";

const emptyForm = { label: "", address: "", city: "", state: "", zip: "" };

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchAddresses(controller.signal)
      .then((data) => {
        if (active) setAddresses(data);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load your addresses.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = await api.post<{ address: Address }>("/addresses", form);
      setAddresses((current) =>
        current.map((address) =>
          data.address.isDefault ? { ...address, isDefault: false } : address,
        ).concat(data.address),
      );
      setForm(emptyForm);
      setFormOpen(false);
      toast.success("Address added");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to save this address.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError("");
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(await fetchAddresses());
      toast.success("Address removed");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete this address.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId("");
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/addresses/${id}/default`);
      setAddresses((current) =>
        current.map((address) => ({ ...address, isDefault: address._id === id })),
      );
      toast.success("Default address updated");
    } catch (defaultError) {
      const message =
        defaultError instanceof Error
          ? defaultError.message
          : "Unable to update the default address.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-app-green">My Addresses</h1>
          <p className="mt-1 text-sm text-app-text-light">Manage your delivery addresses</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((open) => !open)}
          className="flex items-center gap-2 rounded-xl bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
        >
          {formOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          {formOpen ? "Cancel" : "Add New Address"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2">
          {[
            { name: "label", label: "Label", placeholder: "Home, Work..." },
            { name: "address", label: "Street Address", placeholder: "123 Main St" },
            { name: "city", label: "City", placeholder: "New York" },
            { name: "state", label: "State", placeholder: "NY" },
            { name: "zip", label: "ZIP Code", placeholder: "10001" },
          ].map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-sm font-medium text-app-green">
              {field.label}
              <input
                type="text"
                required
                value={form[field.name as keyof typeof emptyForm]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.name]: event.target.value }))
                }
                placeholder={field.placeholder}
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>
          ))}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-app-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <p className="rounded-2xl border border-app-border bg-white p-10 text-center text-sm text-app-text-light">
          You have not saved any addresses yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div key={address._id} className="flex flex-col gap-3 rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-app-green">
                <MapPin className="size-4" />
                {address.label}
              </span>
              {address.isDefault && (
                <span className="rounded-full bg-app-success-light px-2.5 py-0.5 text-xs font-semibold text-app-success-dark">
                  Default
                </span>
              )}
            </div>

            <p className="text-sm leading-6 text-app-text-light">
              {address.address}
              <br />
              {address.city} {address.state} {address.zip}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-app-border pt-3">
              {!address.isDefault && (
                <button
                  type="button"
                  disabled={busyId === address._id}
                  onClick={() => void handleSetDefault(address._id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-app-text-light hover:text-app-green disabled:opacity-50"
                >
                  <Star className="size-3.5" />
                  Set as default
                </button>
              )}
              <button
                type="button"
                disabled={busyId === address._id}
                onClick={() => void handleDelete(address._id)}
                aria-label={`Delete ${address.label} address`}
                className="ml-auto flex items-center gap-1.5 text-xs font-medium text-app-text-light hover:text-app-error disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
