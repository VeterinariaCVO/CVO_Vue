<template>
  <p v-if="cargando" class="text-slate-400 text-center py-4">Cargando...</p>
  <p v-else-if="historial.length === 0" class="text-slate-400 text-center py-4">
    No hay registros médicos.
  </p>
  <div v-else class="flex flex-col gap-2.5">
    <div
      v-for="registro in historial"
      :key="registro.id"
      class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
    >
      <div class="flex-1">
        <p class="font-semibold text-[#1e3a5f] text-sm m-0">
          {{ registro.appointment?.pet?.name ?? '—' }}
        </p>
        <p class="text-xs text-slate-500 mt-0.5 m-0">
          {{ registro.diagnosis ?? 'Sin diagnóstico' }}
        </p>
      </div>
      <p class="text-xs text-slate-400 m-0">{{ registro.created_at ?? '—' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const historial = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('medical-records').get().json()
  await execute()
  historial.value = data.value?.data ?? []
  cargando.value = false
}

onMounted(cargar)
</script>
