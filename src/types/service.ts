export interface Service {
  id: number
  name: string
  price: number
  duration?: number
  description?: string | null
  is_active?: boolean
}