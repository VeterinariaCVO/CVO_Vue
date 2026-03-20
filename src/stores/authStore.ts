// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/services/ApiUseFetch.ts'
import { useRouter } from 'vue-router'
import { type User } from '@/types/user.ts'

export const useAuthStore = defineStore('auth', () => {
  // ── STATE ─────────────────────────────────────────────
  // Son las variables que guarda este store

  // El token es como un pase de acceso, lo buscamos primero en localStorage
  const token = ref<string | null>(localStorage.getItem('token'))

  // Los datos del usuario, también los buscamos en localStorage
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  // ── GETTERS ───────────────────────────────────────────
  // Son variables calculadas automáticamente basadas en el state
  // computed() significa: "calcula esto cada vez que cambie lo que usa"

  // ¿Hay un token guardado? Si sí, el usuario está autenticado
  const isAuthenticated = computed(() => !!token.value)

  // ¿El usuario tiene rol 1? Entonces es admin
  const isAdmin = computed(() => user.value?.role_id === 1)
  const isEmpleado = computed(() => user.value?.role_id === 2)
  const isCliente = computed(() => user.value?.role_id === 3)

  // El nombre del rol (ej: "Admin", "Trabajador")
  const roleName = computed(() => user.value?.role ?? '')

  // ── ACTIONS ───────────────────────────────────────────
  // Son las funciones que modifican el state

  async function login(email: string, password: string) {
    // Mandamos el email y password al backend
    const { data, error } = await ApiUseFetch('/login').post({ email, password }).json()


    // Si el backend respondió con error, lanzamos un aviso
    if (error.value) {
      throw new Error(error.value?.message || 'Credenciales incorrectas')
    }

    // Si todo salió bien, guardamos el token y el usuario
    // data.value.data.token viene así del backend según tu ApiResponse
    token.value = data.value.data.token
    user.value = data.value.data.user

    // También lo guardamos en localStorage para que sobreviva al recargar
    localStorage.setItem('token', token.value!)
    localStorage.setItem('user', JSON.stringify(user.value))

    return data.value.data
  }

  async function logout() {
    const router = useRouter()

    try {
      // Le avisamos al backend que cierre la sesión
      await ApiUseFetch('/logout').post().json()
    } finally {
      // Pase lo que pase, borramos todo localmente
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Mandamos al usuario a la pantalla de login
      router.push('/login')
    }
  }

  // Esta función se puede usar si quieres guardar el usuario
  // desde otro lugar (no muy común, pero útil)
  function setUser(userData: User, tokenValue: string) {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Todo lo que queremos usar FUERA del store lo retornamos aquí
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
    setUser,
  }
})
