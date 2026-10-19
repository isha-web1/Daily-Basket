import type {
  Address,
  Order,
  Product,
  User,
} from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace(/\/$/, "");

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  stats: {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    outOfStock: number;
    totalPartners: number;
  };
  recentOrders: Order[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "Something went wrong. Please try again.",
      response.status,
      payload?.errors,
    );
  }

  return payload.data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export async function fetchProducts(
  params: Record<string, string | number | boolean | undefined | null> = {},
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  return api.get<ProductListResponse>(`/products${buildQuery(params)}`, signal);
}

export async function fetchAddresses(signal?: AbortSignal): Promise<Address[]> {
  const data = await api.get<{ addresses: Address[] }>("/addresses", signal);
  return data.addresses;
}

export async function fetchOrders(
  params: Record<string, string | number | boolean | undefined | null> = {},
  signal?: AbortSignal,
): Promise<OrderListResponse> {
  return api.get<OrderListResponse>(`/orders${buildQuery(params)}`, signal);
}

export async function fetchOrder(id: string): Promise<Order> {
  const data = await api.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>("/admin/stats");
}
