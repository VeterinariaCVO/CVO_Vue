import {createFetch} from '@vueuse/core'

const urlbasica: string = 'http://127.0.0.1:8000/api/';

export const pato = createFetch({
  baseUrl: urlbasica,

  fetchOptions: {
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json',
      //mode: 'cors',
    },
  },

  options: {
  // Interceptor: Se ejecuta justo antes de cada petición
  async beforeFetch({ options, cancel }) {
    const authStore = useAuthStore()
    if (!authStore.token){
      cancel()
    }

    if (authStore.token) {
      // Garantizamos que headers sea un objeto y añadimos el Bearer
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }

    return { options }
  },

  // Interceptor: Manejo de errores global (ej. Token expirado)
  onFetchError(ctx) {
    const authStore = useAuthStore()

    if (ctx.response?.status === 401) {
      authStore.logout()
      router.push('/login')
      // Opcional: redirigir al login con
    }

    return ctx
  },
},
// Opciones de fetch nativo (opcional)
fetchOptions: {
  mode: 'cors',
},
})
