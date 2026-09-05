import type { Request, Response } from 'express'
import { loginSchema } from '../schemas/auth.schema.js'
import { getCurrentUser, login } from '../services/auth.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function loginController(request: Request, response: Response) {
  const input = loginSchema.parse(request.body)
  const result = await login(input)
  return sendSuccess(response, result)
}

export async function meController(request: Request, response: Response) {
  const user = await getCurrentUser(request.user!.id)
  return sendSuccess(response, { user })
}
