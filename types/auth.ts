export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student' | 'affiliate'

export type AuthUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  avatar?: string
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: UserRole
}
export type ForgotPasswordPayload = { email: string }
export type ResetPasswordPayload = { token: string; password: string }

export type AuthTokens = { accessToken: string; refreshToken: string; expiresIn: string }
