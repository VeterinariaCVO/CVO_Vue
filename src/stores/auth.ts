import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>('1|B9QzRD56swdkBoz47Fvn1InyxjdgoUpBKsWLqY1170370a10')
  const user = ref<any | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, setToken, clear }
})