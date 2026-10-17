import { MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { dummyAddressData } from "../assets/assets";
import type { Address } from "../types";

const emptyForm = { label: "", address: "", city: "", state: "", zip: "" };

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>(dummyAddressData);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const newAddress: Address = {
      _id: Date.now().toString(),
      ...form,
      isDefault: addresses.length === 0,
      lat: 40.7128,
      lng: -74.006,
    };
    setAddresses((current) => [...current, newAddress]);
    setForm(emptyForm);
    setFormOpen(false);
    toast.success("Address added");
  }

  function handleDelete(id: string) {
    setAddresses((current) => current.filter((address) => address._id !== id));
    toast.success("Address removed");
  }

  function handleSetDefault(id: string) {
    setAddresses((current) =>
      current.map((address) => ({ ...address, isDefault: address._id === id })),
    );
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
              className="w-full rounded-xl bg-app-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-orange-dark"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

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
                  onClick={() => handleSetDefault(address._id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-app-text-light hover:text-app-green"
                >
                  <Star className="size-3.5" />
                  Set as default
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(address._id)}
                aria-label={`Delete ${address.label} address`}
                className="ml-auto flex items-center gap-1.5 text-xs font-medium text-app-text-light hover:text-app-error"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
