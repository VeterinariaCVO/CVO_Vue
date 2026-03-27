import { createFetch } from '@vueuse/core'
import { useAuthStore } from "@/stores/authStore";

const urlBase: string = import.meta.env.VITE_API_URL

let isLoggingOut = false

export const ApiUseFetch = createFetch({
  baseUrl: urlBase,

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

    async onFetchError(ctx) {
      if (ctx.response?.status === 401 && !isLoggingOut) {
        isLoggingOut = true

        const authStore = useAuthStore()
        await authStore.logout()

        isLoggingOut = false
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
