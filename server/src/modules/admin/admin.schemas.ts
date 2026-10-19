import { z } from 'zod'
import { orderQuerySchema } from '../orders/order.schemas.js'

export const adminOrderQuerySchema = orderQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
})

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
})

export const deliveryPartnerInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(3).max(30),
  avatar: z.string().trim().max(500).optional().default(''),
  vehicleType: z.enum(['bike', 'scooter', 'car']).optional().default('bike'),
  isActive: z.boolean().optional().default(true),
})

export const deliveryPartnerUpdateSchema = deliveryPartnerInputSchema
  .partial()
  .extend({ password: z.string().min(8).max(72).optional() })

export const deliveryPartnerIdSchema = z.object({
  id: z.string().trim().min(1),
})

export const assignDeliveryPartnerSchema = z.object({
  deliveryPartnerId: z.string().trim().min(1, 'Delivery partner is required'),
})

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>
export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>
export type DeliveryPartnerInput = z.infer<typeof deliveryPartnerInputSchema>
export type AssignDeliveryPartnerInput = z.infer<typeof assignDeliveryPartnerSchema>
