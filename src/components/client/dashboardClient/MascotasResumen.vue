<template>
  <p v-if="cargando" class="text-slate-400 text-center py-4">Cargando...</p>
  <p v-else-if="mascotas.length === 0" class="text-slate-400 text-center py-4">
    No tienes mascotas registradas.
  </p>
  <div v-else class="flex flex-col gap-2.5 max-h-75 overflow-y-auto pr-1">
    <div
      v-for="mascota in mascotas"
      :key="mascota.id"
      class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl"
    >
      <img
        v-if="mascota.photo_url"
        :src="mascota.photo_url"
        class="w-9 h-9 rounded-full object-cover border-2 border-[#dce6f0] shrink-0"
      />
      <div
        v-else
        class="w-9 h-9 rounded-full bg-[#e8f0fa] flex items-center justify-center text-base shrink-0"
      >
        🐾
      </div>

      <div>
        <p class="font-semibold text-[#1e3a5f] text-sm m-0">{{ mascota.name }}</p>
        <p class="text-xs text-slate-500 mt-0.5 m-0">{{ mascota.species }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const mascotas = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargando.value = false
}

onMounted(cargar)
</script>
