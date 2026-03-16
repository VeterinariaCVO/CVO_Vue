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