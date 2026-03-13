




import { ref } from 'vue'

export function useFetch() {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function fetchData(url, options = {}) {
    loading.value = true
    error.value = null
    data.value = null

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const json = await response.json()

      if (response.ok) {
        data.value = json
      } else {
        error.value = json.message ?? 'Error en la petición'
      }
    } catch (e) {
      error.value = 'No se pudo conectar con el servidor.'
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetchData }
}
