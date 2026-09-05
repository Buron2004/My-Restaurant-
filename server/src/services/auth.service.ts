import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error-handler.js'
import { findUserByEmail, findUserById } from '../repositories/user.repository.js'
import type { AuthUser } from '../types/auth.js'
import type { LoginInput } from '../schemas/auth.schema.js'

function toAuthUser(user: { id: string; email: string; name: string; role: UserRole }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email)
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false

  if (!user || !passwordMatches) {
    throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401)
  }

  const authUser = toAuthUser(user)
  const token = jwt.sign({ role: authUser.role }, env.JWT_SECRET, {
    subject: authUser.id,
    expiresIn: '1d',
  })

  return { token, user: authUser }
}

export async function getCurrentUser(id: string) {
  const user = await findUserById(id)

  if (!user) {
    throw new AppError('AUTH_USER_NOT_FOUND', 'The authenticated user no longer exists.', 401)
  }

  return toAuthUser(user)
}
