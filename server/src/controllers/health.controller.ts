import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'
import { sendSuccess } from '../utils/api-response.js'

export function healthController(_request: Request, response: Response) {
  return sendSuccess(response, getHealth())
}
