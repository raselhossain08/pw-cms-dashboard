import { apiFetch } from '@/lib/api-client'
import type { AuthUser } from '@/types/auth'

type UploadProgress = (percent: number) => void

export async function fetchProfile() {
  return apiFetch<AuthUser>('/auth/profile')
}

export async function updateProfile(id: string, data: Partial<AuthUser & { phone?: string; bio?: string; country?: string; state?: string; city?: string; certifications?: string[]; flightHours?: number }>) {
  // Use /users/me for current user, /users/:id for other users
  if (id) {
    return apiFetch(`/users/me`, { method: 'PATCH', body: JSON.stringify(data) })
  }
  return apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function uploadAvatar(file: File, onProgress?: UploadProgress): Promise<{ success: boolean; url?: string; error?: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('type', 'image')

  return new Promise(async (resolve) => {
    try {
      const { getAccessToken } = await import('@/lib/cookies')
      const token = getAccessToken()

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/upload`)
      xhr.withCredentials = true
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (evt) => {
        if (onProgress && evt.lengthComputable) {
          const percent = Math.round((evt.loaded * 100) / evt.total)
          onProgress(percent)
        }
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          try {
            const json = JSON.parse(xhr.responseText || '{}')
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = json?.data ?? json
              resolve({ success: true, url: data?.url || data?.secure_url || data?.path })
            } else {
              resolve({ success: false, error: json?.error || json?.message || `HTTP ${xhr.status}` })
            }
          } catch {
            resolve({ success: false, error: `HTTP ${xhr.status}` })
          }
        }
      }

      xhr.onerror = () => resolve({ success: false, error: 'Network error' })
      xhr.send(form)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed'
      resolve({ success: false, error: message })
    }
  })
}

export async function setAvatar(id: string, avatarUrl: string) {
  return updateProfile(id, { avatar: avatarUrl })
}

// Security
export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  // Use /users/me/change-password for current user
  return apiFetch(`/users/me/change-password`, { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) })
}

export async function deleteAccount(id?: string) {
  if (id) return apiFetch(`/users/${id}`, { method: 'DELETE' })
  return apiFetch(`/users/me`, { method: 'DELETE' })
}

// Notifications
export type NotificationItem = {
  _id: string
  title?: string
  message?: string
  isRead?: boolean
  createdAt?: string
}

export async function getNotifications(page = 1, limit = 20) {
  return apiFetch<{ notifications: NotificationItem[]; total: number }>(`/notifications?page=${page}&limit=${limit}`)
}

export async function getUnreadCount() {
  return apiFetch<{ count: number }>(`/notifications/unread-count`)
}

export async function markNotificationRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead() {
  return apiFetch(`/notifications/mark-all-read`, { method: 'POST' })
}

export async function deleteNotification(id: string) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' })
}

// Billing
export type OrderItem = { _id: string; orderNumber?: string; status?: string; total?: number; createdAt?: string }
export type InvoiceItem = { _id: string; invoiceDate?: string; order?: { orderNumber?: string; total?: number } }

export async function getInvoices(page = 1, limit = 10) {
  return apiFetch<{ invoices: InvoiceItem[]; total: number; page: number; limit: number }>(`/payments/invoices?page=${page}&limit=${limit}`)
}

export async function getOrders(page = 1, limit = 10) {
  return apiFetch<{ orders: OrderItem[]; total: number; page: number; limit: number }>(`/orders/my-orders?page=${page}&limit=${limit}`)
}

// Email Verification
export async function resendVerificationEmail() {
  return apiFetch(`/auth/resend-verification`, { method: 'POST', body: JSON.stringify({}) })
}

export async function getEmailVerificationStatus() {
  return apiFetch<{ emailVerified: boolean; email?: string }>(`/auth/email-status`)
}

// User Sessions
export type SessionItem = {
  _id: string
  device?: string
  browser?: string
  ip?: string
  location?: string
  lastActive?: string
  isCurrent?: boolean
}

export async function getUserSessions() {
  return apiFetch<{ sessions: SessionItem[] }>(`/auth/sessions`)
}

export async function deleteSession(sessionId: string) {
  return apiFetch(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function deleteAllSessions() {
  return apiFetch(`/auth/sessions`, { method: 'DELETE' })
}

// Notification Preferences
export type NotificationPreferences = {
  email?: {
    courseUpdates?: boolean
    marketing?: boolean
    security?: boolean
    system?: boolean
  }
  push?: {
    courseUpdates?: boolean
    marketing?: boolean
    security?: boolean
    system?: boolean
  }
}

export async function getNotificationPreferences() {
  return apiFetch<{ preferences: NotificationPreferences }>(`/users/notification-preferences`)
}

export async function updateNotificationPreferences(preferences: NotificationPreferences) {
  return apiFetch(`/users/notification-preferences`, { method: 'PATCH', body: JSON.stringify(preferences) })
}

// Privacy Settings
export type PrivacySettings = {
  profileVisibility?: 'public' | 'private' | 'friends'
  showEmail?: boolean
  showPhone?: boolean
  allowMessages?: boolean
  showActivity?: boolean
}

export async function getPrivacySettings() {
  return apiFetch<{ settings: PrivacySettings }>(`/users/privacy-settings`)
}

export async function updatePrivacySettings(settings: PrivacySettings) {
  return apiFetch(`/users/privacy-settings`, { method: 'PATCH', body: JSON.stringify(settings) })
}

// Download Invoice/Order
export async function downloadInvoice(invoiceId: string) {
  return apiFetch<{ url: string }>(`/payments/invoices/${invoiceId}/download`)
}

export async function downloadOrder(orderId: string) {
  return apiFetch<{ url: string }>(`/orders/${orderId}/download`)
}

// Profile Statistics
export type ProfileStats = {
  coursesEnrolled?: number
  coursesCompleted?: number
  certificatesEarned?: number
  totalSpent?: number
  lastLogin?: string
}

export async function getProfileStats() {
  return apiFetch<{ stats: ProfileStats }>(`/users/profile/stats`)
}
