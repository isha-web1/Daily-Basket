import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { asyncHandler } from '../../lib/asyncHandler.js'
import { sendData } from '../../lib/response.js'
import {
  clearAuthCookie,
  setAuthCookie,
  signToken,
} from '../../lib/token.js'
import { requireAuth } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { authenticateUser, getUserById, registerUser } from './auth.service.js'
import { loginSchema, registerSchema } from './auth.schemas.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMITED',
  },
})

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body)
    const token = signToken(user.id)
    setAuthCookie(res, token)
    sendData(res, { user, token }, 201)
  }),
)

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await authenticateUser(req.body)
    const token = signToken(user.id)
    setAuthCookie(res, token)
    sendData(res, { user, token })
  }),
)

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  sendData(res, { message: 'Signed out successfully' })
})

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.user!.id)
    sendData(res, { user })
  }),
)

export default router
