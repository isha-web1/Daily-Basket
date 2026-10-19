import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodType } from 'zod'
import { ApiError } from '../lib/errors.js'

type RequestSource = 'body' | 'query' | 'params'

export function validate<T>(schema: ZodType<T>, source: RequestSource = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }))
      next(ApiError.validation('Please check the submitted data', details))
      return
    }

    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    } else {
      req[source] = result.data as never
    }
    next()
  }
}
