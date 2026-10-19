export const ORDER_STATUSES = [
  'Placed',
  'Confirmed',
  'Assigned',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const TERMINAL_STATUSES: OrderStatus[] = ['Delivered', 'Cancelled']

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Placed: ['Confirmed', 'Packed', 'Cancelled'],
  Confirmed: ['Assigned', 'Packed', 'Cancelled'],
  Assigned: ['Packed', 'Cancelled'],
  Packed: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
}

export interface StatusHistoryEntry {
  status: string
  note: string
  timestamp: string
}

export interface OrderItemSnapshot {
  _id: string
  product: string
  name: string
  image: string
  price: number
  quantity: number
  unit: string
}
