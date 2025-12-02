import { apiFetch } from '@/lib/api-client'
import { setTokens, clearTokens } from '@/lib/cookies'
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthUser,
  AuthTokens,
} from '@/types/auth'

export async function login(payload: LoginPayload) {
  const res = await apiFetch<{ user: AuthUser } & AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (res.success && res.data) {
    setTokens(res.data.accessToken, res.data.refreshToken)
  }
  return res
}

export async function register(payload: RegisterPayload) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) })
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) })
}

export async function verifyEmail(token: string) {
  return apiFetch('/auth/verify-email?token=' + encodeURIComponent(token))
}

export async function getProfile() {
  const { getAccessToken } = await import('@/lib/cookies')
  return apiFetch<AuthUser>('/auth/profile', { headers: { Authorization: `Bearer ${getAccessToken()}` } })
}

export async function verifyEmailCode(code: string) {
  return apiFetch('/auth/verify-email-code', { method: 'POST', body: JSON.stringify({ code }) })
}

export async function resendVerification(token: string) {
  const qs = '?token=' + encodeURIComponent(token)
  return apiFetch('/auth/resend-verification' + qs, { method: 'POST' })
}

export async function logout() {
  clearTokens()
  return { success: true }
}

export async function refresh() {
  const { getRefreshToken, setTokens } = await import('@/lib/cookies')
  const rt = getRefreshToken()
  if (!rt) return { success: false, error: 'No refresh token' }
  const res = await apiFetch<{ accessToken: string; refreshToken: string; expiresIn: string }>(
    '/auth/refresh-token',
    { method: 'POST', body: JSON.stringify({ refreshToken: rt }) }
  )
  if (res.success && res.data) {
    setTokens(res.data.accessToken, res.data.refreshToken)
  }
  return res
}
