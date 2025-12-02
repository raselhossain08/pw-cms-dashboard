import Cookies from 'js-cookie'

const ACCESS_KEY = 'pw_access_token'
const REFRESH_KEY = 'pw_refresh_token'

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_KEY, accessToken, { secure: false, sameSite: 'lax' })
  Cookies.set(REFRESH_KEY, refreshToken, { secure: false, sameSite: 'lax' })
}

export function getAccessToken() {
  return Cookies.get(ACCESS_KEY) || ''
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_KEY) || ''
}

export function clearTokens() {
  Cookies.remove(ACCESS_KEY)
  Cookies.remove(REFRESH_KEY)
}
