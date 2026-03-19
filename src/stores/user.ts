import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {

  const users = ref<User[]>([])
  const { apiFetch, loading, error } = useFetch()

  async function fetchUsers() {
    const data = await apiFetch<{ users: User[] }>('/admin/users')
    if (data) users.value = data.users
  }

  async function createUser(payload: object) {
    const data = await apiFetch<{ user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return data
  }

  async function updateUser(id: number, payload: object) {
    const data = await apiFetch<{ user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return data
  }

  async function toggleActive(user: User) {
    const data = await apiFetch(`/admin/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name:    user.name,
        email:   user.email,
        role_id: user.role_id,
        phone:   user.phone,
        address: user.address,
        active:  !user.active,
      }),
    })

    if (data !== null) {
      user.active = !user.active
    }

    return data
  }

  return { users, loading, error, fetchUsers, createUser, updateUser, toggleActive }
})