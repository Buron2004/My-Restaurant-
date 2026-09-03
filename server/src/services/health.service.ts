import { getHealthStatus } from '../repositories/health.repository.js'

export function getHealth() {
  return getHealthStatus()
}
