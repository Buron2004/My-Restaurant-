type JwtPayload = {
  exp?: number
}

export function getAuthToken() {
  return localStorage.getItem('authToken')
}

export function hasValidAuthToken() {
  const token = getAuthToken()
  if (!token) return false

  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return false
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload
    return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function clearAuthToken() {
  localStorage.removeItem('authToken')
}
