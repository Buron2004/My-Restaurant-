const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type LoginResponse = {
  success: true
  data: {
    token: string
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'STAFF'
    }
  }
}

type ApiErrorResponse = {
  success: false
  error: { code: string; message: string }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = (await response.json()) as LoginResponse | ApiErrorResponse

  if (!response.ok || !body.success) {
    throw new Error('error' in body ? body.error.message : 'Unable to sign in.')
  }

  return body
}
