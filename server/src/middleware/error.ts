import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client.js'
import { env } from '../config/env.js'
import { ApiError } from '../lib/errors.js'
import { ZodError } from 'zod'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`))
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details ? { errors: error.details } : {}),
    })
    return
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Please check the submitted data',
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with these details already exists',
        code: 'CONFLICT',
      })
      return
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
        code: 'NOT_FOUND',
      })
      return
    }
    if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        message: 'Related resource does not exist',
        code: 'BAD_REQUEST',
      })
      return
    }
  }

  if (!env.isProduction) {
    console.error(error)
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
    code: 'INTERNAL_ERROR',
  })
}
