export interface Appointment {
  id: number
  status: string
  is_walk_in: boolean
  notes: string | null
  pet: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    phone: string | null
  } | null
  service: {
    id: number
    name: string
    price: number
  } | null
  time_slot: {
    id: number
    date: string
    start_time: string
    end_time: string
  } | null
  created_by: string | null
  created_at: string
}