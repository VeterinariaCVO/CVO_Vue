import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'
import type { Pet } from '@/types/pet'
import type { User } from '@/types/user'

export const usePetStore = defineStore('pet', () => {

  const pet       = ref<Pet | null>(null)
  const pets      = ref<Pet[]>([])
  const client    = ref<User | null>(null)
  const citas     = ref<any[]>([])
  const { apiFetch, loading, error } = useFetch()

  async function fetchClientWithPets(clientId: number) {
    const data = await apiFetch<{ client: User; pets: Pet[] }>(
      `/empleado/clients/${clientId}`
    )
    if (data) {
      client.value = data.client
      pets.value   = data.pets ?? []
    }
  }

  async function fetchPetsByClient(clientId: number) {
    const data = await apiFetch<{ pets: Pet[] }>(
      `/pets?owner_id=${clientId}`
    )
    if (data) pets.value = data.pets
  }

  async function fetchPet(petId: number) {
    const data = await apiFetch<{ pet: Pet }>(`/pets/${petId}`)
    if (data) pet.value = data.pet
  }

  async function fetchCitas(petId: number) {
    const data = await apiFetch<{ data?: any[]; appointments?: any[] }>(
      `/appointments?pet_id=${petId}`
    )
    if (data) citas.value = data.data ?? data.appointments ?? []
  }

  async function createPet(formData: FormData) {
    return await apiFetch<{ pet: Pet }>('/pets', {
      method: 'POST',
      body: formData,
    })
  }

  async function updatePet(id: number, formData: FormData) {
    return await apiFetch<{ pet: Pet }>(`/pets/${id}`, {
      method: 'POST',
      body: formData,
    })
  }

  async function deletePet(id: number) {
    const data = await apiFetch(`/pets/${id}`, { method: 'DELETE' })
    if (data !== null) {
      pets.value = pets.value.filter(p => p.id !== id)
      pet.value  = null
    }
    return data
  }

  return {
    pet, pets, client, citas,
    loading, error,
    fetchClientWithPets, fetchPetsByClient,
    fetchPet, fetchCitas,
    createPet, updatePet, deletePet,
  }
})