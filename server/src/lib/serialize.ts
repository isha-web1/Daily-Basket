import type { Address, DeliveryPartner, Order, Product, User } from '../../generated/prisma/client.js'

export interface PublicUser {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
  addresses?: PublicAddress[]
}

export interface PublicAddress {
  _id: string
  id: string
  label: string
  address: string
  city: string
  state: string
  zip: string
  isDefault: boolean
  lat: number
  lng: number
  createdAt: string
  updatedAt: string
}

export interface PublicProduct {
  _id: string
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  image: string
  category: string
  unit: string
  stock: number
  isOrganic: boolean
  rating: number
  reviewCount: number
  discount: number
  createdAt: string
  updatedAt: string
}

export interface PublicDeliveryPartner {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  vehicleType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function serializeUser(user: User, addresses?: Address[]): PublicUser {
  return {
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    avatar: user.avatar ?? '',
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    ...(addresses ? { addresses: addresses.map(serializeAddress) } : {}),
  }
}

export function serializeAddress(address: Address): PublicAddress {
  return {
    _id: address.id,
    id: address.id,
    label: address.label,
    address: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    isDefault: address.isDefault,
    lat: address.lat,
    lng: address.lng,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }
}

export function serializeProduct(product: Product): PublicProduct {
  const originalPrice = product.originalPrice ?? 0
  const discount =
    originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0

  return {
    _id: product.id,
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    originalPrice,
    image: product.image,
    category: product.category,
    unit: product.unit ?? 'piece',
    stock: product.stock ?? 0,
    isOrganic: product.isOrganic ?? false,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    discount,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export function serializeDeliveryPartner(partner: DeliveryPartner): PublicDeliveryPartner {
  return {
    _id: partner.id,
    id: partner.id,
    name: partner.name,
    email: partner.email,
    phone: partner.phone,
    avatar: partner.avatar ?? '',
    vehicleType: partner.vehicleType ?? 'bike',
    isActive: partner.isActive ?? true,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
  }
}

export function serializeOrder(
  order: Order & { user?: User; deliveryPartner?: DeliveryPartner | null },
) {
  return {
    _id: order.id,
    id: order.id,
    user: order.user ? serializeUser(order.user) : order.userId,
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee ?? 0,
    tax: order.tax ?? 0,
    total: order.total,
    status: order.status,
    statusHistory: order.statusHistory,
    deliveryPartner: order.deliveryPartner ? serializeDeliveryPartner(order.deliveryPartner) : null,
    deliveryOtp: order.deliveryOtp ?? '',
    liveLocation: order.liveLocation ?? null,
    isPaid: order.isPaid ?? false,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
