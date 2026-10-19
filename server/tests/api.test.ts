import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { Server } from 'node:http'
import { createApp } from '../src/createApp.js'
import { env } from '../src/config/env.js'
import { prisma } from '../src/db.js'

let server: Server
let baseUrl: string
let userCookie = ''
let adminCookie = ''
let otherCookie = ''
let productId = ''
let addressId = ''
let orderId = ''
let deliveryOrderId = ''
let partnerId = ''

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const userEmail = `buyer-${suffix}@dailybasket.test`
const otherEmail = `other-${suffix}@dailybasket.test`
const partnerEmail = `partner-${suffix}@dailybasket.test`
const password = 'TestPass123!'
const productName = `Test Product ${suffix}`

interface ApiResult {
  status: number
  cookie: string
  body: any
}

async function api(
  path: string,
  options: { method?: string; body?: unknown; cookie?: string } = {},
): Promise<ApiResult> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.cookie) headers.Cookie = options.cookie

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const setCookie = response.headers.getSetCookie().find((value) => value.startsWith('db_token='))

  return {
    status: response.status,
    cookie: setCookie ? setCookie.split(';')[0] : '',
    body: await response.json().catch(() => null),
  }
}

before(async () => {
  server = createApp().listen(0)
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  baseUrl = `http://127.0.0.1:${address.port}/api`
})

after(async () => {
  await prisma.order.deleteMany({ where: { user: { email: { startsWith: `buyer-${suffix}` } } } })
  await prisma.user.deleteMany({ where: { email: { in: [userEmail, otherEmail] } } })
  await prisma.product.deleteMany({ where: { name: productName } })
  await prisma.deliveryPartner.deleteMany({ where: { email: partnerEmail } })
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await prisma.$disconnect()
})

describe('health and catalog', () => {
  it('reports database health', async () => {
    const result = await api('/health')
    assert.equal(result.status, 200)
    assert.equal(result.body.data.database, 'ok')
  })

  it('returns paginated products with computed discount', async () => {
    const result = await api('/products?limit=3&sort=price-asc')
    assert.equal(result.status, 200)
    assert.equal(result.body.data.products.length, 3)
    assert.equal(result.body.data.pagination.limit, 3)
    assert.equal(typeof result.body.data.products[0].discount, 'number')
    assert.ok(result.body.data.products[0]._id)
  })

  it('supports category, search and deal filters', async () => {
    const search = await api('/products?search=Spinach')
    assert.equal(search.status, 200)
    assert.ok(search.body.data.products.every((product: any) =>
      `${product.name} ${product.description} ${product.category}`.toLowerCase().includes('spinach'),
    ))

    const deals = await api('/products?deals=true&limit=100')
    assert.equal(deals.status, 200)
    assert.ok(deals.body.data.products.length > 0)
    for (const product of deals.body.data.products) {
      assert.ok(product.originalPrice > product.price)
    }
  })

  it('returns categories and product details', async () => {
    const categories = await api('/categories')
    assert.equal(categories.status, 200)
    assert.ok(categories.body.data.categories.length >= 5)

    const products = await api('/products?limit=1')
    const id = products.body.data.products[0]._id
    const detail = await api(`/products/${id}`)
    assert.equal(detail.status, 200)
    assert.equal(detail.body.data.product._id, id)

    const missing = await api('/products/does-not-exist')
    assert.equal(missing.status, 404)
  })
})

describe('authentication and authorization', () => {
  it('rejects duplicate registration and invalid credentials', async () => {
    const first = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Test Buyer', email: userEmail, password },
    })
    assert.equal(first.status, 201)
    assert.ok(first.cookie)
    userCookie = first.cookie
    assert.equal(first.body.data.user.email, userEmail)
    assert.equal(first.body.data.user.isAdmin, false)
    assert.equal(first.body.data.user.password, undefined)

    const duplicate = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Test Buyer', email: userEmail, password },
    })
    assert.equal(duplicate.status, 409)

    const badLogin = await api('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password: 'WrongPass123!' },
    })
    assert.equal(badLogin.status, 401)
  })

  it('returns the authenticated user and rejects anonymous access', async () => {
    const me = await api('/auth/me', { cookie: userCookie })
    assert.equal(me.status, 200)
    assert.equal(me.body.data.user.email, userEmail)

    const anonymous = await api('/auth/me')
    assert.equal(anonymous.status, 401)
  })

  it('logs in and out with cookie sessions', async () => {
    const login = await api('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password },
    })
    assert.equal(login.status, 200)
    assert.ok(login.cookie)

    const logout = await api('/auth/logout', { method: 'POST', cookie: login.cookie })
    assert.equal(logout.status, 200)
    assert.equal(logout.cookie, 'db_token=')

    const unauthenticated = await api('/addresses')
    assert.equal(unauthenticated.status, 401)
  })

  it('creates the second test user', async () => {
    const result = await api('/auth/register', {
      method: 'POST',
      body: { name: 'Other Buyer', email: otherEmail, password },
    })
    assert.equal(result.status, 201)
    otherCookie = result.cookie
  })

  it('enforces admin RBAC and exposes the dashboard', async () => {
    const denied = await api('/admin/stats', { cookie: userCookie })
    assert.equal(denied.status, 403)

    assert.ok(env.ADMIN_EMAIL && env.ADMIN_PASSWORD, 'admin env credentials must be set')
    const login = await api('/auth/login', {
      method: 'POST',
      body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
    })
    assert.equal(login.status, 200)
    assert.equal(login.body.data.user.isAdmin, true)
    adminCookie = login.cookie

    const stats = await api('/admin/stats', { cookie: adminCookie })
    assert.equal(stats.status, 200)
    assert.equal(typeof stats.body.data.stats.totalProducts, 'number')
    assert.ok(Array.isArray(stats.body.data.recentOrders))
  })
})

describe('addresses', () => {
  it('creates a default address', async () => {
    const result = await api('/addresses', {
      method: 'POST',
      cookie: userCookie,
      body: {
        label: 'Home',
        address: '1 Test Street',
        city: 'Testville',
        state: 'TS',
        zip: '12345',
      },
    })
    assert.equal(result.status, 201)
    assert.equal(result.body.data.address.isDefault, true)
    addressId = result.body.data.address._id
  })

  it('keeps a single default address when another is added', async () => {
    const second = await api('/addresses', {
      method: 'POST',
      cookie: userCookie,
      body: {
        label: 'Work',
        address: '2 Test Street',
        city: 'Testville',
        state: 'TS',
        zip: '12346',
        isDefault: true,
      },
    })
    assert.equal(second.status, 201)
    assert.equal(second.body.data.address.isDefault, true)

    const list = await api('/addresses', { cookie: userCookie })
    assert.equal(list.status, 200)
    const defaults = list.body.data.addresses.filter((address: any) => address.isDefault)
    assert.equal(defaults.length, 1)
    assert.equal(defaults[0]._id, second.body.data.address._id)

    await api(`/addresses/${second.body.data.address._id}`, {
      method: 'DELETE',
      cookie: userCookie,
    })
  })

  it('enforces ownership on updates and deletes', async () => {
    const update = await api(`/addresses/${addressId}`, {
      method: 'PATCH',
      cookie: otherCookie,
      body: { label: 'Hijacked' },
    })
    assert.equal(update.status, 404)

    const remove = await api(`/addresses/${addressId}`, {
      method: 'DELETE',
      cookie: otherCookie,
    })
    assert.equal(remove.status, 404)
  })
})

describe('orders', () => {
  it('creates a product for order tests', async () => {
    const result = await api('/admin/products', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        name: productName,
        description: 'Temporary product for integration tests',
        price: 10,
        originalPrice: 12,
        image: 'https://example.com/test-product.png',
        category: 'pantry-staples',
        unit: '1kg',
        stock: 10,
        isOrganic: false,
        rating: 4,
        reviewCount: 1,
      },
    })
    assert.equal(result.status, 201)
    productId = result.body.data.product._id
  })

  it('places an order, decrements stock and returns totals', async () => {
    const result = await api('/orders', {
      method: 'POST',
      cookie: userCookie,
      body: {
        items: [{ productId, quantity: 2 }],
        addressId,
        paymentMethod: 'cash',
      },
    })
    assert.equal(result.status, 201)
    const order = result.body.data.order
    orderId = order._id
    assert.equal(order.status, 'Placed')
    assert.equal(order.subtotal, 20)
    assert.equal(order.deliveryFee, 0)
    assert.equal(order.tax, 1.6)
    assert.equal(order.total, 21.6)
    assert.equal(order.items[0].quantity, 2)
    assert.equal(order.shippingAddress.label, 'Home')
    assert.equal(order.deliveryOtp, '')

    const product = await api(`/products/${productId}`)
    assert.equal(product.body.data.product.stock, 8)
  })

  it('rejects insufficient stock', async () => {
    const result = await api('/orders', {
      method: 'POST',
      cookie: userCookie,
      body: {
        items: [{ productId, quantity: 50 }],
        addressId,
        paymentMethod: 'cash',
      },
    })
    assert.equal(result.status, 409)
  })

  it('lists, reads and protects user orders', async () => {
    const list = await api('/orders', { cookie: userCookie })
    assert.equal(list.status, 200)
    assert.ok(list.body.data.orders.some((order: any) => order._id === orderId))

    const detail = await api(`/orders/${orderId}`, { cookie: userCookie })
    assert.equal(detail.status, 200)
    assert.equal(detail.body.data.order._id, orderId)

    const forbidden = await api(`/orders/${orderId}`, { cookie: otherCookie })
    assert.equal(forbidden.status, 404)
  })

  it('cancels an order and restores stock', async () => {
    const result = await api(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      cookie: userCookie,
    })
    assert.equal(result.status, 200)
    assert.equal(result.body.data.order.status, 'Cancelled')
    assert.ok(result.body.data.order.statusHistory.some((entry: any) => entry.status === 'Cancelled'))

    const product = await api(`/products/${productId}`)
    assert.equal(product.body.data.product.stock, 10)
  })

  it('lets an admin advance status, issues an OTP and delivers', async () => {
    const created = await api('/orders', {
      method: 'POST',
      cookie: userCookie,
      body: {
        items: [{ productId, quantity: 1 }],
        addressId,
        paymentMethod: 'card',
      },
    })
    assert.equal(created.status, 201)
    deliveryOrderId = created.body.data.order._id

    const skipped = await api(`/admin/orders/${deliveryOrderId}/status`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { status: 'Delivered' },
    })
    assert.equal(skipped.status, 409)

    const partner = await api('/admin/delivery-partners', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        name: `Test Partner ${suffix}`,
        email: partnerEmail,
        password,
        phone: '555-0100',
        vehicleType: 'bike',
        isActive: true,
      },
    })
    assert.equal(partner.status, 201)
    partnerId = partner.body.data.partner._id

    const assigned = await api(`/admin/orders/${deliveryOrderId}/delivery-partner`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { deliveryPartnerId: partnerId },
    })
    assert.equal(assigned.status, 200)
    assert.equal(assigned.body.data.order.deliveryPartner._id, partnerId)

    for (const status of ['Confirmed', 'Assigned', 'Packed', 'Out for Delivery']) {
      const updated = await api(`/admin/orders/${deliveryOrderId}/status`, {
        method: 'PATCH',
        cookie: adminCookie,
        body: { status },
      })
      assert.equal(updated.status, 200)
      assert.equal(updated.body.data.order.status, status)
      assert.equal(updated.body.data.order.deliveryPartner._id, partnerId)
    }

    const outForDelivery = await api(`/orders/${deliveryOrderId}`, { cookie: userCookie })
    assert.match(outForDelivery.body.data.order.deliveryOtp, /^\d{6}$/)

    const delivered = await api(`/admin/orders/${deliveryOrderId}/status`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { status: 'Delivered', note: 'Handed to customer' },
    })
    assert.equal(delivered.status, 200)
    assert.equal(delivered.body.data.order.isPaid, true)

    const cancelDelivered = await api(`/orders/${deliveryOrderId}/cancel`, {
      method: 'PATCH',
      cookie: userCookie,
    })
    assert.equal(cancelDelivered.status, 409)
  })

  it('prevents non-admins from changing order status', async () => {
    const result = await api(`/admin/orders/${deliveryOrderId}/status`, {
      method: 'PATCH',
      cookie: userCookie,
      body: { status: 'Cancelled' },
    })
    assert.equal(result.status, 403)
  })
})
