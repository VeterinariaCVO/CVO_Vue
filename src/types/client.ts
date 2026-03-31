export interface Client {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  active: boolean
  role_id: number
  role: string | null
  gender: string | null
  birth_date: string | null
  age: number | null
  profile_photo: string | null
  created_at: string | null
}