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
    const { data, error, execute } = ApiUseFetch('/login',
      { immediate: false, }).post({ email, password }).json()

    await execute()

    console.log('DATA:', data.value)
    console.log('ERROR:', error.value)

    if (error.value) {
      throw new Error(error.value?.message || 'Credenciales incorrectas')
    }

    if (!data.value || !data.value.data) {
      throw new Error('Respuesta invalida del servidor')
    }

    const response = data.value.data

    token.value = response.token
    user.value = response.user

    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    console.log('TOKEN GUARDADO:', response.token)

    return response
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
