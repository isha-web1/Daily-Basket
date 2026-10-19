import { z } from 'zod'
import { ORDER_STATUSES } from '../../lib/orderStatus.js'

export const orderItemInputSchema = z.object({
  productId: z.string().trim().min(1, 'Product id is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(99),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required').max(100),
  addressId: z.string().trim().min(1, 'A delivery address is required'),
  paymentMethod: z.enum(['cash', 'card']).default('cash'),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(ORDER_STATUSES).optional(),
})

export const orderIdSchema = z.object({
  id: z.string().trim().min(1, 'Order id is required'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(200).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type OrderQuery = z.infer<typeof orderQuerySchema>
