export interface User {
  id: number
  name: string
  email: string
  role: string | null
  role_id: number
  phone: string | null
  address: string | null
  active: boolean
}