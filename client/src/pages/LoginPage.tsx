import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '../api/auth'
import { BackButton } from '../components/BackButton'
import toast from 'react-hot-toast'

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
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInput, undefined, LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const submit = async (values: LoginFormValues) => {
    setSubmitError('')
    try {
      const response = await login(values.email, values.password)
      localStorage.setItem('authToken', response.data.token)
      toast.success('Signed in successfully.')
      const destination = (location.state as { from?: string } | null)?.from ?? '/admin/meals'
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    }
  }

  return <main className="login-page"><div className="w-full max-w-md mb-4"><BackButton to="/" />
  </div>
    <section className="login-panel">
      <div className="login-heading"><p className="eyebrow">
        Restaurant operations</p><h1>Welcome back</h1><p>Sign in to manage the menu and keep service moving.</p>
      </div><form className="login-form" onSubmit={handleSubmit(submit)} noValidate><label className="login-field">Email address<input type="email" autoComplete="email" placeholder="admin@restaurant.test" {...register('email')} />{errors.email && <span>{errors.email.message}</span>}</label><label className="login-field">Password<div style={{ position: 'relative', width: '100%' }}><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" {...register('password')} style={{ paddingRight: '3rem', width: '100%', boxSizing: 'border-box' }} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: '#4B6B4F', display: 'flex', alignItems: 'center' }}>{showPassword ? (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>) : (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>)}</button></div>{errors.password && <span>{errors.password.message}</span>}</label>{submitError && <p className="login-error" role="alert">{submitError}</p>}<button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
      </form><p className="login-hint">Use the seeded admin account to access meal management.</p></section></main>
}