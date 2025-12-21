/**
 * Validation utilities for forms
 */

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: 'Email is required' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' }
  }
  return { valid: true }
}

export function validatePhone(phone: string): { valid: boolean; message?: string } {
  if (!phone) {
    return { valid: true } // Phone is optional
  }
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return { valid: false, message: 'Please enter a valid phone number' }
  }
  return { valid: true }
}

export function validatePassword(password: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  score: number
  message?: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
} {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let valid = false
  let message: string | undefined

  if (score <= 2) {
    strength = 'weak'
    message = 'Password is too weak'
  } else if (score <= 4) {
    strength = 'medium'
    message = 'Password could be stronger'
  } else {
    strength = 'strong'
    valid = true
  }

  if (!checks.length) {
    message = 'Password must be at least 8 characters'
  }

  return { valid, strength, score, message, checks }
}

export function calculateProfileCompletion(profile: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bio?: string
  avatar?: string
  country?: string
  state?: string
  city?: string
}): { percentage: number; missing: string[] } {
  const fields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'bio', label: 'Bio' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'country', label: 'Country' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
  ]

  const completed = fields.filter((field) => {
    const value = profile[field.key as keyof typeof profile]
    return value && String(value).trim().length > 0
  }).length

  const missing = fields
    .filter((field) => {
      const value = profile[field.key as keyof typeof profile]
      return !value || String(value).trim().length === 0
    })
    .map((f) => f.label)

  const percentage = Math.round((completed / fields.length) * 100)

  return { percentage, missing }
}
