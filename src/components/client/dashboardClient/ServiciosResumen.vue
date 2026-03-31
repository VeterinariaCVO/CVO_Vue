<template>
  <p v-if="cargando" class="text-slate-400 text-center py-4">Cargando...</p>
  <p v-else-if="servicios.length === 0" class="text-slate-400 text-center py-4">
    No hay servicios disponibles.
  </p>
  <div
    v-else
    class="grid gap-3"
    style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))"
  >
    <div
      v-for="servicio in servicios"
      :key="servicio.id"
      class="bg-slate-50 rounded-xl p-3.5 border border-[#dce6f0]"
    >
      <p class="font-semibold text-[#1e3a5f] text-sm m-0 mb-1">{{ servicio.name }}</p>
      <p class="text-xs text-slate-500 m-0 mb-2">{{ servicio.description ?? '—' }}</p>
      <span class="text-sm font-bold text-[#1d6bbf]">${{ servicio.price }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const servicios = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
  cargando.value = false
}

onMounted(cargar)
</script>
