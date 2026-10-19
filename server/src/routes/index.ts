import { Router } from 'express'
import { asyncHandler } from '../lib/asyncHandler.js'
import { sendData } from '../lib/response.js'
import addressRoutes from '../modules/addresses/address.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import authRoutes from '../modules/auth/auth.routes.js'
import orderRoutes from '../modules/orders/order.routes.js'
import productRoutes from '../modules/products/product.routes.js'
import { listCategories } from '../modules/products/product.service.js'

const router = Router()

router.use('/auth', authRoutes)
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    sendData(res, { categories: await listCategories() })
  }),
)
router.use('/products', productRoutes)
router.use('/addresses', addressRoutes)
router.use('/orders', orderRoutes)
router.use('/admin', adminRoutes)

export default router
