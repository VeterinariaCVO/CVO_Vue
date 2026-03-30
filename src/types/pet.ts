export interface Pet {
  id: number
  name: string
  species: string
  breed: string | null
  color: string | null
  special_marks: string | null
  weight: number | null
  sex: 'male' | 'female'
  age: number | null
  photo_path: string | null
  owner_id: number
  active: boolean
}


export interface PetVet {
  id: number
  name: string
  species: string
  breed: string | null
  color: string | null
  special_marks: string | null
  weight: string | null
  sex: 'male' | 'female'
  age: number | null
  photo_url: string | null
  owner_id: number
  owner: {
    id: number
    name: string
    email: string
    phone: string
  }
  active: boolean
  created_at: string
}
