import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../db.js'
import { ApiError } from '../lib/errors.js'
import { readTokenFromRequest, verifyToken } from '../lib/token.js'
import type { AuthUser } from '../types/auth.js'

async function resolveUser(req: Request): Promise<AuthUser | null> {
  const token = readTokenFromRequest(req.cookies ?? {}, req.headers.authorization)

  if (!token) return null

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, isAdmin: true },
    })
    return user
  } catch {
    return null
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req)
    if (!user) {
      throw ApiError.unauthorized()
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req)
    if (!user) {
      throw ApiError.unauthorized()
    }
    if (!user.isAdmin) {
      throw ApiError.forbidden('Administrator access required')
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
