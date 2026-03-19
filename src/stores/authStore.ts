// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // --- Estado (state) ---
  const token = ref<string | null>(localStorage.getItem('user_token'))
  const user = ref<{ id: number; name: string } | null>(null)

  // --- Getters (computed) ---
  const isAuthenticated = computed(() => !!token.value)

  // --- Acciones (actions) ---
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('user_token', newToken)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('user_token')
  }

  function setUser(userData: { id: number; name: string }) {
    user.value = userData
  }

  // Retornamos todo lo que queremos exponer
  return {
    token,
    user,
    isAuthenticated,
    setToken,
    logout,
    setUser
  }
})
