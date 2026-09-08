import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '../api/auth'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginFormInput = z.input<typeof loginSchema>
type LoginFormValues = z.output<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInput, undefined, LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const submit = async (values: LoginFormValues) => {
    setSubmitError('')
    try {
      const response = await login(values.email, values.password)
      localStorage.setItem('authToken', response.data.token)
      const destination = (location.state as { from?: string } | null)?.from ?? '/admin/meals'
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    }
  }

  return <main className="login-page"><section className="login-panel"><div className="login-heading"><p className="eyebrow">Restaurant operations</p><h1>Welcome back</h1><p>Sign in to manage the menu and keep service moving.</p></div><form className="login-form" onSubmit={handleSubmit(submit)} noValidate><label className="login-field">Email address<input type="email" autoComplete="email" placeholder="admin@restaurant.test" {...register('email')} />{errors.email && <span>{errors.email.message}</span>}</label><label className="login-field">Password<input type="password" autoComplete="current-password" placeholder="Your password" {...register('password')} />{errors.password && <span>{errors.password.message}</span>}</label>{submitError && <p className="login-error" role="alert">{submitError}</p>}<button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button></form><p className="login-hint">Use the seeded admin account to access meal management.</p></section></main>
}
