import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user'

export const useClientStore = defineStore('client', () => {

  const clients = ref<User[]>([])
  const { apiFetch, loading, error } = useFetch()

  async function fetchClients() {
    const data = await apiFetch<{ clients: User[] }>('/empleado/clients')
    if (data) clients.value = data.clients
  }

  return { clients, loading, error, fetchClients }
})