import type { Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

const COOKIE_NAME = 'db_token'

export interface TokenPayload {
  sub: string
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET)
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Invalid token payload')
  }
  return { sub: decoded.sub }
}

export function readTokenFromRequest(cookies: Record<string, string>, authorization?: string) {
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7).trim()
  }
  return cookies[COOKIE_NAME]
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: env.cookieMaxAgeMs,
    path: '/',
  })
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
  })
}

export { COOKIE_NAME }
