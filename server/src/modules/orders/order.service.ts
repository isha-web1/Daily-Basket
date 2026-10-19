import { randomUUID } from 'node:crypto'
import { prisma } from '../../db.js'
import { Prisma } from '../../../generated/prisma/client.js'
import { ApiError } from '../../lib/errors.js'
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  type OrderItemSnapshot,
  type OrderStatus,
  type StatusHistoryEntry,
} from '../../lib/orderStatus.js'
import { buildPagination } from '../../lib/response.js'
import { serializeOrder } from '../../lib/serialize.js'
import type { CreateOrderInput, OrderQuery } from './order.schemas.js'

const TAX_RATE = 0.08
const FREE_DELIVERY_THRESHOLD = 20
const DELIVERY_FEE = 5

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
  })

  if (!address) {
    throw ApiError.notFound('Delivery address not found')
  }

  const quantities = new Map<string, number>()
  for (const item of input.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: [...quantities.keys()] } },
    })
    const productById = new Map(products.map((product) => [product.id, product]))

    const items: OrderItemSnapshot[] = []
    let subtotal = 0

    for (const [productId, quantity] of quantities) {
      const product = productById.get(productId)
      if (!product) {
        throw ApiError.badRequest('One or more products are no longer available')
      }

      const availableStock = product.stock ?? 0
      if (availableStock < quantity) {
        throw ApiError.conflict(
          `${product.name} only has ${availableStock} item(s) left in stock`,
        )
      }

      const reserved = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      })

      if (reserved.count === 0) {
        throw ApiError.conflict(`${product.name} is no longer available in that quantity`)
      }

      items.push({
        _id: randomUUID(),
        product: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        unit: product.unit ?? 'piece',
      })
      subtotal += product.price * quantity
    }

    subtotal = roundCurrency(subtotal)
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const tax = roundCurrency(subtotal * TAX_RATE)
    const total = roundCurrency(subtotal + deliveryFee + tax)
    const timestamp = new Date().toISOString()

    const order = await tx.order.create({
      data: {
        userId,
        items: items as unknown as Prisma.InputJsonValue,
        shippingAddress: {
          label: address.label,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          lat: address.lat,
          lng: address.lng,
        } as Prisma.InputJsonValue,
        paymentMethod: input.paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: 'Placed',
        statusHistory: [
          { status: 'Placed', note: 'Order placed successfully', timestamp },
        ] as unknown as Prisma.InputJsonValue,
      },
      include: { user: true, deliveryPartner: true },
    })

    return serializeOrder(order)
  })
}

export async function listUserOrders(userId: string, query: OrderQuery) {
  const where = {
    userId,
    ...(query.status ? { status: query.status } : {}),
  }

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { user: true, deliveryPartner: true },
    }),
  ])

  return {
    orders: orders.map(serializeOrder),
    pagination: buildPagination(query.page, query.limit, total),
  }
}

export async function getUserOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { user: true, deliveryPartner: true },
  })

  if (!order) {
    throw ApiError.notFound('Order not found')
  }

  return serializeOrder(order)
}

export async function cancelUserOrder(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, userId } })
    if (!order) {
      throw ApiError.notFound('Order not found')
    }
    if (order.status === 'Cancelled') {
      throw ApiError.conflict('This order is already cancelled')
    }
    if (order.status === 'Delivered') {
      throw ApiError.conflict('Delivered orders cannot be cancelled')
    }

    const items = (order.items as unknown as OrderItemSnapshot[]) ?? []
    for (const item of items) {
      await tx.product.updateMany({
        where: { id: item.product },
        data: { stock: { increment: item.quantity } },
      })
    }

    const history = (order.statusHistory as unknown as StatusHistoryEntry[]) ?? []
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'Cancelled',
        statusHistory: [
          ...history,
          {
            status: 'Cancelled',
            note: 'Order cancelled by customer',
            timestamp: new Date().toISOString(),
          },
        ] as unknown as Prisma.InputJsonValue,
      },
      include: { user: true, deliveryPartner: true },
    })

    return serializeOrder(updated)
  })
}

export async function listAllOrders(query: OrderQuery & { search?: string }) {
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { id: { contains: query.search, mode: 'insensitive' } },
            { user: { name: { contains: query.search, mode: 'insensitive' } } },
            { user: { email: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { user: true, deliveryPartner: true },
    }),
  ])

  return {
    orders: orders.map(serializeOrder),
    pagination: buildPagination(query.page, query.limit, total),
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  if (!ORDER_STATUSES.includes(status)) {
    throw ApiError.badRequest('Invalid order status')
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } })
    if (!order) {
      throw ApiError.notFound('Order not found')
    }

    if (order.status === status) {
      throw ApiError.conflict(`Order is already ${status}`)
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      throw ApiError.conflict(`A ${order.status.toLowerCase()} order cannot be updated`)
    }

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status as OrderStatus] ?? []
    if (!allowedTransitions.includes(status)) {
      throw ApiError.conflict(`Cannot move an order from ${order.status} to ${status}`)
    }

    const history = (order.statusHistory as unknown as StatusHistoryEntry[]) ?? []
    const timestamp = new Date().toISOString()
    const entry: StatusHistoryEntry = {
      status,
      note: note || `Status updated to ${status}`,
      timestamp,
    }

    if (status === 'Cancelled') {
      const items = (order.items as unknown as OrderItemSnapshot[]) ?? []
      for (const item of items) {
        await tx.product.updateMany({
          where: { id: item.product },
          data: { stock: { increment: item.quantity } },
        })
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: [...history, entry] as unknown as Prisma.InputJsonValue,
        ...(status === 'Out for Delivery' && !order.deliveryOtp
          ? { deliveryOtp: String(Math.floor(100000 + Math.random() * 900000)) }
          : {}),
        ...(status === 'Delivered' ? { isPaid: true } : {}),
      },
      include: { user: true, deliveryPartner: true },
    })

    return serializeOrder(updated)
  })
}
