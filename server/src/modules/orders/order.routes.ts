import { Router } from 'express'
import { asyncHandler } from '../../lib/asyncHandler.js'
import { sendData } from '../../lib/response.js'
import { requireAuth } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { createOrderSchema, orderIdSchema, orderQuerySchema, type OrderQuery } from './order.schemas.js'
import {
  cancelUserOrder,
  createOrder,
  getUserOrder,
  listUserOrders,
} from './order.service.js'

const router = Router()
router.use(requireAuth)

router.post(
  '/',
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const order = await createOrder(req.user!.id, req.body)
    sendData(res, { order }, 201)
  }),
)

router.get(
  '/',
  validate(orderQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await listUserOrders(req.user!.id, req.query as unknown as OrderQuery)
    sendData(res, result)
  }),
)

router.get(
  '/:id',
  validate(orderIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const order = await getUserOrder(req.user!.id, req.params.id as string)
    sendData(res, { order })
  }),
)

router.patch(
  '/:id/cancel',
  validate(orderIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const order = await cancelUserOrder(req.user!.id, req.params.id as string)
    sendData(res, { order })
  }),
)

export default router
