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
    immediate: false,
    updateDataOnError: true,
    async beforeFetch({}) {},
    afterFetch(ctx) {
      return ctx
    },
    onFetchError(ctx) {
      ctx.error = new Error('hubo un error')
      return ctx
    },
  },

})
