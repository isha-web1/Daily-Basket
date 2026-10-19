import { z } from 'zod'

export const addressCreateSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(40),
  address: z.string().trim().min(3, 'Street address is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(80),
  state: z.string().trim().min(1, 'State is required').max(80),
  zip: z.string().trim().min(2, 'ZIP code is required').max(20),
  isDefault: z.boolean().optional().default(false),
  lat: z.coerce.number().min(-90).max(90).optional().default(0),
  lng: z.coerce.number().min(-180).max(180).optional().default(0),
})

export const addressUpdateSchema = addressCreateSchema.partial()

export const addressIdSchema = z.object({
  id: z.string().trim().min(1, 'Address id is required'),
})

export type AddressInput = z.infer<typeof addressCreateSchema>
