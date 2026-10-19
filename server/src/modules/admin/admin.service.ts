import bcrypt from 'bcryptjs'
import { prisma } from '../../db.js'
import { Prisma } from '../../../generated/prisma/client.js'
import { ApiError } from '../../lib/errors.js'
import { buildPagination } from '../../lib/response.js'
import { serializeDeliveryPartner, serializeOrder, serializeUser } from '../../lib/serialize.js'
import type {
  AdminOrderQuery,
  AdminUserQuery,
  AssignDeliveryPartnerInput,
  DeliveryPartnerInput,
} from './admin.schemas.js'
import { listAllOrders } from '../orders/order.service.js'

export async function getDashboardStats() {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    outOfStock,
    totalPartners,
    recentOrders,
  ] = await prisma.$transaction([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 0 } } }),
    prisma.deliveryPartner.count(),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: true, deliveryPartner: true },
    }),
  ])

  return {
    stats: {
      totalOrders,
      totalUsers,
      totalProducts,
      outOfStock,
      totalPartners,
    },
    recentOrders: recentOrders.map(serializeOrder),
  }
}

export async function listUsers(query: AdminUserQuery) {
  const where: Prisma.UserWhereInput = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { addresses: true },
    }),
  ])

  return {
    users: users.map((user) => {
      const { addresses, ...rest } = user
      return serializeUser(rest, addresses)
    }),
    pagination: buildPagination(query.page, query.limit, total),
  }
}

export async function getAdminOrders(query: AdminOrderQuery) {
  return listAllOrders(query)
}

export async function assignDeliveryPartner(
  orderId: string,
  input: AssignDeliveryPartnerInput,
) {
  const [order, partner] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    prisma.deliveryPartner.findUnique({ where: { id: input.deliveryPartnerId } }),
  ])

  if (!order) {
    throw ApiError.notFound('Order not found')
  }
  if (order.status === 'Delivered' || order.status === 'Cancelled') {
    throw ApiError.conflict(`A ${order.status.toLowerCase()} order cannot be assigned`)
  }
  if (!partner) {
    throw ApiError.notFound('Delivery partner not found')
  }
  if (!(partner.isActive ?? true)) {
    throw ApiError.badRequest('Select an active delivery partner')
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { deliveryPartnerId: partner.id },
    include: { user: true, deliveryPartner: true },
  })

  return serializeOrder(updated)
}

export async function listDeliveryPartners() {
  const partners = await prisma.deliveryPartner.findMany({ orderBy: { createdAt: 'desc' } })
  return partners.map(serializeDeliveryPartner)
}

export async function createDeliveryPartner(input: DeliveryPartnerInput) {
  const password = await bcrypt.hash(input.password, 12)
  const partner = await prisma.deliveryPartner.create({
    data: { ...input, password },
  })
  return serializeDeliveryPartner(partner)
}

export async function updateDeliveryPartner(
  id: string,
  input: Partial<DeliveryPartnerInput>,
) {
  const existing = await prisma.deliveryPartner.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Delivery partner not found')
  }

  const data: Prisma.DeliveryPartnerUpdateInput = { ...input }
  if (input.password) {
    data.password = await bcrypt.hash(input.password, 12)
  }

  const partner = await prisma.deliveryPartner.update({ where: { id }, data })
  return serializeDeliveryPartner(partner)
}

export async function deleteDeliveryPartner(id: string) {
  const existing = await prisma.deliveryPartner.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Delivery partner not found')
  }
  await prisma.deliveryPartner.delete({ where: { id } })
}
