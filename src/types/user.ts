export interface User {
  id: number
  name: string
  email: string
  role_id: number
  role?: string | null
  phone?: string | null
  address?: string | null
  active: boolean
  gender?: string | null
  birth_date?: string | null
  age?: number | null
  profile_photo?: string | null
  created_at?: string | null
}
