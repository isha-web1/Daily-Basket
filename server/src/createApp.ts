/// <reference path="./types/express.d.ts" />

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { prisma } from './db.js'
import { asyncHandler } from './lib/asyncHandler.js'
import { ApiError } from './lib/errors.js'
import { sendData } from './lib/response.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import apiRoutes from './routes/index.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(new ApiError(403, 'Origin is not allowed by CORS', 'CORS_DENIED'))
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  app.get('/api/health', asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      throw new ApiError(503, 'Database is unavailable', 'SERVICE_UNAVAILABLE')
    }
    sendData(res, {
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    })
  }))

  app.use('/api', apiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
