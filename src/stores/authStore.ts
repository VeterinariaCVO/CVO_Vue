// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import { useRouter } from 'vue-router'
import { type User } from '@/types/user.ts'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role_id === 1)
  const isEmpleado = computed(() => user.value?.role_id === 2)
  const isCliente = computed(() => user.value?.role_id === 3)
  const roleName = computed(() => user.value?.role ?? '')

  async function login(email: string, password: string) {
    const { data, error } = await ApiUseFetch('/login').post({ email, password }).json()

    if (error.value) {
      throw new Error(error.value?.message || 'Credenciales incorrectas')
    }

    token.value = data.value.data.token
    user.value = data.value.data.user

    localStorage.setItem('token', token.value!)
    localStorage.setItem('user', JSON.stringify(user.value))

    return data.value.data
  }

  async function logout() {
    const router = useRouter()

    try {
      await ApiUseFetch('/logout').post().json()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isEmpleado,
    isCliente,
    roleName,
    login,
    logout,
  }
})
