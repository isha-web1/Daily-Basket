import { z } from 'zod'

export const CATEGORY_SLUGS = [
  'fruits-vegetables',
  'personal-care',
  'pantry-staples',
  'bakery',
  'beverages',
  'meat-seafood',
  'snacks',
  'frozen-foods',
  'baby-care',
  'dairy-eggs',
] as const

const booleanParam = z.preprocess(
  (value) => value === true || value === 'true' || value === '1',
  z.boolean(),
)

export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    search: z.string().trim().max(120).optional(),
    category: z.string().trim().max(80).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'name']).default('newest'),
    deals: booleanParam,
    excludeId: z.string().trim().max(64).optional(),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] },
  )

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(''),
  price: z.coerce.number().min(0).max(1_000_000),
  originalPrice: z.coerce.number().min(0).max(1_000_000).optional().default(0),
  image: z.string().trim().url('Image must be a valid URL'),
  category: z.enum(CATEGORY_SLUGS),
  unit: z.string().trim().min(1).max(30).optional().default('piece'),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
  isOrganic: z.boolean().optional().default(false),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  reviewCount: z.coerce.number().int().min(0).optional().default(0),
})

export const productUpdateSchema = productInputSchema.partial()

export const productIdSchema = z.object({
  id: z.string().trim().min(1, 'Product id is required'),
})

export type ProductQuery = z.infer<typeof productQuerySchema>
export type ProductInput = z.infer<typeof productInputSchema>
