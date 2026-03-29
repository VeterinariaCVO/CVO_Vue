export interface Credentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  address: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  address: string
  role_id: number
  active: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginData {
  user: User
  role: number
  token: string
}
