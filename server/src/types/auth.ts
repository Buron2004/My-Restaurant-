import type { UserRole } from '@prisma/client'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

export {}
