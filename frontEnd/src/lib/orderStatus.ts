export const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Assigned",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Placed: ["Confirmed", "Packed", "Cancelled"],
  Confirmed: ["Assigned", "Packed", "Cancelled"],
  Assigned: ["Packed", "Cancelled"],
  Packed: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export function getNextStatuses(status: string): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status as OrderStatus] ?? [];
}
