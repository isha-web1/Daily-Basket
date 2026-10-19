import type { Response } from 'express'

export function sendData<T>(res: Response, data: T, statusCode = 200) {
  res.status(statusCode).json({ success: true, data })
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function buildPagination(page: number, limit: number, total: number): Pagination {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
