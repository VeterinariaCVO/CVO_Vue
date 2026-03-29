import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import router from '@/router'
import { type User } from '@/types/user'

function getStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(getStoredUser())


  const isAuthenticated = computed(() => !!token.value)


  const isAdmin = computed(() => user.value?.role_id === 1)
  const isRecepcionista = computed(() => user.value?.role_id === 2)
  const isCliente = computed(() => user.value?.role_id === 3)
  const isVeterinario = computed(() => user.value?.role_id === 4)

  const roleName = computed(() => user.value?.role ?? '')


  function hasRole(roleId: number) {
    return user.value?.role_id === roleId
  }


  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }


  async function login(email: string, password: string) {
    const { data, error } = await ApiUseFetch('/login')
      .post({ email, password })
      .json<{ data: { token: string; user: User } }>()

    if (error.value) {
      throw new Error(error.value?.message || 'Credenciales incorrectas')
    }

    if (!data.value?.data?.token) {
      throw new Error('Respuesta inválida del servidor')
    }

    token.value = data.value.data.token
    user.value = data.value.data.user

    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))

    return data.value.data
  }


  async function logout() {
  try {
    await ApiUseFetch('/logout').post().json()
  } catch (error) {
    console.warn('Error al hacer logout:', error)
  } finally {
    clearAuth()
    router.push('/login')
  }
}

  return {
    token,
    user,
    isAuthenticated,

    isAdmin,
    isRecepcionista,
    isCliente,
    isVeterinario,
    hasRole,
    roleName,

    login,
    logout,
  }
})
