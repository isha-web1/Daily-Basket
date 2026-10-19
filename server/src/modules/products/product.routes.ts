import { Router } from 'express'
import { asyncHandler } from '../../lib/asyncHandler.js'
import { sendData } from '../../lib/response.js'
import { validate } from '../../middleware/validate.js'
import { productIdSchema, productQuerySchema, type ProductQuery } from './product.schemas.js'
import { getProduct, listProducts } from './product.service.js'

const router = Router()

router.get(
  '/',
  validate(productQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await listProducts(req.query as unknown as ProductQuery)
    sendData(res, result)
  }),
)

router.get(
  '/:id',
  validate(productIdSchema, 'params'),
  asyncHandler(async (req, res) => {
    const product = await getProduct(req.params.id as string)
    sendData(res, { product })
  }),
)

export default router
