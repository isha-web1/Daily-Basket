import { prisma } from '../../db.js'
import { Prisma } from '../../../generated/prisma/client.js'
import { ApiError } from '../../lib/errors.js'
import { buildPagination } from '../../lib/response.js'
import { serializeProduct } from '../../lib/serialize.js'
import type { ProductInput, ProductQuery } from './product.schemas.js'

function buildWhere(query: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  if (query.category && query.category !== 'all') {
    where.category = query.category
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    }
  }

  if (query.excludeId) {
    where.id = { not: query.excludeId }
  }

  if (query.deals) {
    where.originalPrice = { gt: prisma.product.fields.price }
  }

  return where
}

function buildOrderBy(sort: ProductQuery['sort']): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' }
    case 'price-desc':
      return { price: 'desc' }
    case 'rating':
      return { rating: 'desc' }
    case 'name':
      return { name: 'asc' }
    default:
      return { createdAt: 'desc' }
  }
}

export async function listProducts(query: ProductQuery) {
  const where = buildWhere(query)
  const skip = (query.page - 1) * query.limit

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: query.limit,
    }),
  ])

  return {
    products: products.map(serializeProduct),
    pagination: buildPagination(query.page, query.limit, total),
  }
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw ApiError.notFound('Product not found')
  }
  return serializeProduct(product)
}

export async function listCategories() {
  const grouped = await prisma.product.groupBy({
    by: ['category'],
    _count: { _all: true },
    orderBy: { category: 'asc' },
  })

  return grouped.map((entry) => ({
    slug: entry.category,
    name: entry.category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    productCount: entry._count._all,
  }))
}

export async function createProduct(input: ProductInput) {
  const product = await prisma.product.create({ data: input })
  return serializeProduct(product)
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Product not found')
  }
  const product = await prisma.product.update({ where: { id }, data: input })
  return serializeProduct(product)
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Product not found')
  }
  await prisma.product.delete({ where: { id } })
}
