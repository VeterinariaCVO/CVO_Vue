import { ref } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  role: number
}

export const useAuthStore = defineStore('auth', () => {

  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser: User) {
    user.value = newUser
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, setToken, setUser, clear }
})