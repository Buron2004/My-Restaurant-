import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { env } from '../config/env.js'
import { AppError } from './error-handler.js'
import type { AuthUser } from '../types/auth.js'

export const authenticate: RequestHandler = (request, _response, next) => {
  const header = request.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    return next(new AppError('AUTH_TOKEN_REQUIRED', 'A Bearer token is required.', 401))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)

    if (
      typeof payload === 'string' ||
      !payload.sub ||
      typeof payload.role !== 'string' ||
      !Object.values(UserRole).includes(payload.role as UserRole)
    ) {
      return next(new AppError('AUTH_TOKEN_INVALID', 'The authentication token is invalid.', 401))
    }

    request.user = {
      id: payload.sub,
      email: '',
      name: '',
      role: payload.role as AuthUser['role'],
    }
    return next()
  } catch {
    return next(new AppError('AUTH_TOKEN_INVALID', 'The authentication token is invalid or expired.', 401))
  }
}

export function authorizeRoles(...allowedRoles: AuthUser['role'][]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return next(new AppError('FORBIDDEN', 'You do not have permission to access this resource.', 403))
    }

    return next()
  }
}
