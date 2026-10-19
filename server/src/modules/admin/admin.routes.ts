import { Router } from 'express'
import { asyncHandler } from '../../lib/asyncHandler.js'
import { sendData } from '../../lib/response.js'
import { requireAdmin } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import {
  productIdSchema,
  productInputSchema,
  productUpdateSchema,
} from '../products/product.schemas.js'
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '../products/product.service.js'
import { orderIdSchema, updateOrderStatusSchema } from '../orders/order.schemas.js'
import { updateOrderStatus } from '../orders/order.service.js'
import {
  adminOrderQuerySchema,
  adminUserQuerySchema,
  assignDeliveryPartnerSchema,
  deliveryPartnerIdSchema,
  deliveryPartnerInputSchema,
  deliveryPartnerUpdateSchema,
  type AdminOrderQuery,
  type AdminUserQuery,
} from './admin.schemas.js'
import {
  assignDeliveryPartner,
  createDeliveryPartner,
  deleteDeliveryPartner,
  getAdminOrders,
  getDashboardStats,
  listDeliveryPartners,
  listUsers,
  updateDeliveryPartner,
} from './admin.service.js'

const router = Router()
router.use(requireAdmin)

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    sendData(res, await getDashboardStats())
  }),
)

router.get(
  '/orders',
  validate(adminOrderQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    sendData(res, await getAdminOrders(req.query as unknown as AdminOrderQuery))
  }),
)

router.patch(
  '/orders/:id/status',
  validate(orderIdSchema, 'params'),
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await updateOrderStatus(req.params.id as string, req.body.status, req.body.note)
    sendData(res, { order })
  }),
)

router.patch(
  '/orders/:id/delivery-partner',
  validate(orderIdSchema, 'params'),
  validate(assignDeliveryPartnerSchema),
  asyncHandler(async (req, res) => {
    const order = await assignDeliveryPartner(req.params.id as string, req.body)
    sendData(res, { order })
  }),
)

router.get(
  '/users',
  validate(adminUserQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    sendData(res, await listUsers(req.query as unknown as AdminUserQuery))
  }),
)

router.post(
  '/products',
  validate(productInputSchema),
  asyncHandler(async (req, res) => {
    const product = await createProduct(req.body)
    sendData(res, { product }, 201)
  }),
)

router.patch(
  '/products/:id',
  validate(productIdSchema, 'params'),
  validate(productUpdateSchema),
  asyncHandler(async (req, res) => {
    const product = await updateProduct(req.params.id as string, req.body)
    sendData(res, { product })
  }),
)

router.delete(
  '/products/:id',
  validate(productIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    await deleteProduct(req.params.id as string)
    sendData(res, { message: 'Product deleted' })
  }),
)

router.get(
  '/delivery-partners',
  asyncHandler(async (_req, res) => {
    sendData(res, { partners: await listDeliveryPartners() })
  }),
)

router.post(
  '/delivery-partners',
  validate(deliveryPartnerInputSchema),
  asyncHandler(async (req, res) => {
    const partner = await createDeliveryPartner(req.body)
    sendData(res, { partner }, 201)
  }),
)

router.patch(
  '/delivery-partners/:id',
  validate(deliveryPartnerIdSchema, 'params'),
  validate(deliveryPartnerUpdateSchema),
  asyncHandler(async (req, res) => {
    const partner = await updateDeliveryPartner(req.params.id as string, req.body)
    sendData(res, { partner })
  }),
)

router.delete(
  '/delivery-partners/:id',
  validate(deliveryPartnerIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    await deleteDeliveryPartner(req.params.id as string)
    sendData(res, { message: 'Delivery partner deleted' })
  }),
)

export default router
