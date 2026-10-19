import {
  Image as ImageIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { categoriesData } from "../../assets/assets";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type AdminProductInput,
} from "../../lib/adminApi";
import type { Pagination } from "../../lib/api";
import type { Product } from "../../types";
import { formatPrice, getCategoryName } from "../../utils/format";

interface AdminProductsProps {
  createMode?: boolean;
  onCreated?: () => void;
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  category: string;
  unit: string;
  stock: string;
  isOrganic: boolean;
  rating: string;
  reviewCount: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  image: "",
  category: categoriesData[0]?.slug ?? "fruits-vegetables",
  unit: "1kg",
  stock: "0",
  isOrganic: false,
  rating: "0",
  reviewCount: "0",
};

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : "",
    image: product.image,
    category: product.category,
    unit: product.unit,
    stock: String(product.stock),
    isOrganic: product.isOrganic,
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
  };
}

function toPayload(form: ProductFormState): AdminProductInput {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice === "" ? 0 : Number(form.originalPrice),
    image: form.image.trim(),
    category: form.category,
    unit: form.unit.trim() || "piece",
    stock: form.stock === "" ? 0 : Number(form.stock),
    isOrganic: form.isOrganic,
    rating: form.rating === "" ? 0 : Number(form.rating),
    reviewCount: form.reviewCount === "" ? 0 : Number(form.reviewCount),
  };
}

export default function AdminProducts({ createMode = false, onCreated }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(createMode);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminProducts(
      {
        page,
        limit: 10,
        search: search || undefined,
        sort: "newest",
      },
      controller.signal,
    )
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load products.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, search, reloadKey]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm(toFormState(product));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    if (createMode) onCreated?.();
  }

  function updateField<Key extends keyof ProductFormState>(
    field: Key,
    value: ProductFormState[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = toPayload(form);
      if (editing) {
        await updateAdminProduct(editing._id, payload);
        toast.success("Product updated");
        setFormOpen(false);
        setEditing(null);
        setForm(emptyForm);
        setReloadKey((key) => key + 1);
      } else {
        const product = await createAdminProduct(payload);
        toast.success(`${product.name} added`);
        setForm(emptyForm);
        setFormOpen(false);
        if (createMode) {
          onCreated?.();
        } else {
          setPage(1);
          setSearch("");
          setSearchInput("");
          setReloadKey((key) => key + 1);
        }
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to save this product.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(product._id);
    setError("");
    try {
      await deleteAdminProduct(product._id);
      toast.success("Product deleted");
      if (editing?._id === product._id) {
        setFormOpen(false);
        setEditing(null);
        setForm(emptyForm);
      }
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete this product.";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  }

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-app-green">
            {createMode ? "Add Product" : "Products"}
          </h1>
          <p className="mt-1 text-sm text-app-text-light">
            {createMode
              ? "Create a new product for the storefront"
              : "Manage catalog pricing, stock, and availability"}
          </p>
        </div>
        {!createMode && !formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
          >
            <Plus className="size-4" />
            Add Product
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
              {editing ? `Edit ${editing.name}` : "New Product"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close product form"
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
                maxLength={120}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Organic Bananas"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Category
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green focus:border-app-green"
              >
                {categoriesData.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Price
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="4.99"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Original Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(event) => updateField("originalPrice", event.target.value)}
                placeholder="5.99"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Unit
              <input
                type="text"
                maxLength={30}
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                placeholder="1kg, 500g, piece"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                placeholder="100"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green sm:col-span-2">
              Image URL
              <input
                type="url"
                required
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                placeholder="https://example.com/product.png"
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green sm:col-span-2">
              Description
              <textarea
                rows={3}
                maxLength={2000}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Short product description"
                className="resize-y rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Rating
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => updateField("rating", event.target.value)}
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green focus:border-app-green"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-app-green">
              Review Count
              <input
                type="number"
                min="0"
                step="1"
                value={form.reviewCount}
                onChange={(event) => updateField("reviewCount", event.target.value)}
                className="rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-normal text-app-green focus:border-app-green"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-app-green sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isOrganic}
                onChange={(event) => updateField("isOrganic", event.target.checked)}
                className="h-4 w-4 accent-app-orange"
              />
              Organic product
            </label>
          </div>

          {form.image && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-app-cream p-3">
              <img
                src={form.image}
                alt=""
                className="size-14 rounded-lg border border-app-border bg-white object-contain p-1"
              />
              <p className="flex items-center gap-1.5 text-xs text-app-text-light">
                <ImageIcon className="size-3.5" />
                Image preview
              </p>
            </div>
          )}

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
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!createMode && (
        <>
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
                placeholder="Search products by name, description, or category"
                className="w-full rounded-xl border border-app-border bg-white py-2.5 pl-10 pr-4 text-sm text-app-green placeholder:text-app-text-light focus:border-app-green"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
                className="text-sm font-medium text-app-text-light hover:text-app-green"
              >
                Clear
              </button>
            )}
          </form>

          <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="bg-app-cream">
                    {["Product", "Category", "Price", "Stock", "Visibility", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-app-text-faint"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-app-text-light">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-app-text-light">
                        No products match this search.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="border-b border-app-border last:border-b-0">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="size-11 rounded-lg border border-app-border bg-app-cream object-contain p-1"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-app-green">
                                {product.name}
                              </p>
                              <p className="text-xs text-app-text-light">{product.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-app-text-muted">
                          {getCategoryName(product.category)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-app-green">
                            {formatPrice(product.price)}
                          </p>
                          {product.originalPrice > product.price && (
                            <p className="text-xs text-app-text-faint line-through">
                              {formatPrice(product.originalPrice)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock <= 5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-app-success-light text-app-success-dark"
                            }`}
                          >
                            {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-app-cream px-2.5 py-1 text-xs font-semibold text-app-text-muted">
                            {product.isOrganic ? "Organic" : "Standard"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="flex items-center gap-1.5 rounded-lg bg-app-cream px-3 py-1.5 text-xs font-semibold text-app-green hover:bg-app-cream-dark"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === product._id}
                              onClick={() => void handleDelete(product)}
                              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 className="size-3.5" />
                              {deletingId === product._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-5 py-3 text-sm text-app-text-light">
              <span>
                {pagination
                  ? `${pagination.total} product${pagination.total === 1 ? "" : "s"}`
                  : "Products"}
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
        </>
      )}

      {createMode && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-app-border bg-white/60 p-6 text-sm text-app-text-light">
          <Package className="size-5 text-app-green" />
          New products appear in the storefront immediately after creation.
        </div>
      )}
    </div>
  );
}
