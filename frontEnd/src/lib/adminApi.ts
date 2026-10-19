import { api, buildQuery, type Pagination, type ProductListResponse } from "./api";
import type { DeliveryPartner, Order, Product } from "../types";

export interface AdminProductInput {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  unit?: string;
  stock?: number;
  isOrganic?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface DeliveryPartnerInput {
  name: string;
  email: string;
  password?: string;
  phone: string;
  avatar?: string;
  vehicleType: "bike" | "scooter" | "car";
  isActive: boolean;
}

export interface AdminOrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function fetchAdminProducts(
  params: Record<string, string | number | boolean | undefined | null> = {},
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  return api.get<ProductListResponse>(`/products${buildQuery(params)}`, signal);
}

export async function createAdminProduct(input: AdminProductInput): Promise<Product> {
  const data = await api.post<{ product: Product }>("/admin/products", input);
  return data.product;
}

export async function updateAdminProduct(
  id: string,
  input: Partial<AdminProductInput>,
): Promise<Product> {
  const data = await api.patch<{ product: Product }>(`/admin/products/${id}`, input);
  return data.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete<{ message: string }>(`/admin/products/${id}`);
}

export async function fetchAdminOrders(
  params: AdminOrderQuery = {},
  signal?: AbortSignal,
): Promise<AdminOrdersResponse> {
  return api.get<AdminOrdersResponse>(
    `/admin/orders${buildQuery({
      page: params.page,
      limit: params.limit,
      status: params.status,
      search: params.search,
    })}`,
    signal,
  );
}

export async function updateAdminOrderStatus(
  id: string,
  status: string,
  note?: string,
): Promise<Order> {
  const data = await api.patch<{ order: Order }>(`/admin/orders/${id}/status`, {
    status,
    ...(note?.trim() ? { note: note.trim() } : {}),
  });
  return data.order;
}

export async function assignAdminOrderPartner(
  id: string,
  deliveryPartnerId: string,
): Promise<Order> {
  const data = await api.patch<{ order: Order }>(
    `/admin/orders/${id}/delivery-partner`,
    { deliveryPartnerId },
  );
  return data.order;
}

export async function fetchAdminPartners(): Promise<DeliveryPartner[]> {
  const data = await api.get<{ partners: DeliveryPartner[] }>("/admin/delivery-partners");
  return data.partners;
}

export async function createAdminPartner(
  input: DeliveryPartnerInput,
): Promise<DeliveryPartner> {
  const data = await api.post<{ partner: DeliveryPartner }>(
    "/admin/delivery-partners",
    input,
  );
  return data.partner;
}

export async function updateAdminPartner(
  id: string,
  input: Partial<DeliveryPartnerInput>,
): Promise<DeliveryPartner> {
  const data = await api.patch<{ partner: DeliveryPartner }>(
    `/admin/delivery-partners/${id}`,
    input,
  );
  return data.partner;
}

export async function deleteAdminPartner(id: string): Promise<void> {
  await api.delete<{ message: string }>(`/admin/delivery-partners/${id}`);
}
