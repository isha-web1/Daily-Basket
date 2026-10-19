import { Router } from 'express'
import { asyncHandler } from '../../lib/asyncHandler.js'
import { sendData } from '../../lib/response.js'
import { requireAuth } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { addressCreateSchema, addressIdSchema, addressUpdateSchema } from './address.schemas.js'
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from './address.service.js'

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const addresses = await listAddresses(req.user!.id)
    sendData(res, { addresses })
  }),
)

router.post(
  '/',
  validate(addressCreateSchema),
  asyncHandler(async (req, res) => {
    const address = await createAddress(req.user!.id, req.body)
    sendData(res, { address }, 201)
  }),
)

router.patch(
  '/:id/default',
  validate(addressIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const address = await setDefaultAddress(req.user!.id, req.params.id as string)
    sendData(res, { address })
  }),
)

router.patch(
  '/:id',
  validate(addressIdSchema, 'params'),
  validate(addressUpdateSchema),
  asyncHandler(async (req, res) => {
    const address = await updateAddress(req.user!.id, req.params.id as string, req.body)
    sendData(res, { address })
  }),
)

router.delete(
  '/:id',
  validate(addressIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    await deleteAddress(req.user!.id, req.params.id as string)
    sendData(res, { message: 'Address deleted' })
  }),
)

export default router
