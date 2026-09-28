import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { sendError } from '../utils/api-response.js'

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(
    code: string,
    message: string,
    statusCode = 500,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new AppError('NOT_FOUND', 'The requested resource was not found.', 404))
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  void _next

  if (error instanceof AppError) {
    return sendError(response, error.code, error.message, error.statusCode)
  }

  if (error instanceof ZodError) {
    return sendError(response, 'VALIDATION_ERROR', 'The request data is invalid.', 400)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return sendError(response, 'CONFLICT', 'A record with these values already exists.', 409)
    }

    if (error.code === 'P2025') {
      return sendError(response, 'NOT_FOUND', 'The requested record was not found.', 404)
    }
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return sendError(response, 'INVALID_JSON', 'The request body is not valid JSON.', 400)
  }

  // Anything reaching here is genuinely unexpected — log it so it's actually debuggable,
  // even though the client only ever sees the generic message below.
  console.error('Unhandled error:', error)
  return sendError(response, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.', 500)
}