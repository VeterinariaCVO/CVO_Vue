export interface MedicalRecord {
  id: number
  appointment_id: number
  veterinarian: {
    id: number
    name: string
  }
  pet: {
    id: number
    name: string
    species: string
  }
  service: string
  date: string
  weight: string | null
  temperature: string | null
  symptoms: string | null
  diagnosis: string | null
  treatment: string | null
  prescriptions: string | null
  observations: string | null
  next_visit: string | null
  created_at: string
}
