import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export interface ValidationErrors {
  [field: string]: string
}

export function useFetch() {
  const loading          = ref(false)
  const error            = ref<string | null>(null)
  const validationErrors = ref<ValidationErrors>({})

  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

  async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    loading.value          = true
    error.value            = null
    validationErrors.value = {}

    const token = localStorage.getItem('token')

    try {
      const isFormData = options.body instanceof FormData

      const headers: HeadersInit = {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) ?? {}),
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      if (response.status === 204) return null

      const text = await response.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Error del servidor (${response.status})`)
      }

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const parsed: ValidationErrors = {}
          for (const key in data.errors) {
            parsed[key] = data.errors[key][0]
          }
          validationErrors.value = parsed
          return null
        }
        throw new Error(data.message ?? `Error ${response.status}`)
      }

      return data as T
    } catch (e: any) {
      error.value = e?.message ?? 'Error de red'
      return null
    } finally {
      loading.value = false
    }
  }

  return { apiFetch, loading, error, validationErrors }
}