import {createFetch} from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.ts'

const urlbasica: string = 'http://127.0.0.1:8000/api/';

export const pato = createFetch({
  baseUrl: urlbasica,

  options: {
    immediate: false,
    updateDataOnError: true,

    async beforeFetch({ options }) {
      const authStore = useAuthStore()
      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
        }
      }
      return { options }
    },

    afterFetch(ctx) {
      return ctx
    },

    onFetchError(ctx) {
      if (ctx.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }
      return ctx
    },
  },

  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
})
