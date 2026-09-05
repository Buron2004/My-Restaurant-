import type { Response } from 'express'

export function sendSuccess<T>(
  response: Response,
  data: T,
  meta: Record<string, unknown> = {},
  statusCode = 200,
) {
  return response.status(statusCode).json({
    success: true,
    data,
    meta,
  })
}

export function sendError(
  response: Response,
  code: string,
  message: string,
  statusCode: number,
) {
  return response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  })
}
