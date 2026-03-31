<template>
  <div class="min-h-screen bg-[#f0f4f8] p-8">
    <!-- Encabezado -->
    <div class="mb-7">
      <h1 class="text-[1.6rem] font-bold text-[#1e3a5f] m-0">Bienvenido, {{ nombreUsuario }}</h1>
      <p class="text-sm text-slate-500 mt-1">Aquí puedes ver toda la información de tu cuenta</p>
    </div>

    <!-- Cards de resumen -->
    <div class="grid grid-cols-3 gap-4 mb-5">
      <ResumenCard titulo="Mis Mascotas" :valor="totalMascotas" color="azul" />
      <ResumenCard titulo="Citas Pendientes" :valor="totalPendientes" color="amarillo" />
      <ResumenCard titulo="Próxima Cita" :valor="proximaCita" color="verde" />
    </div>

    <!-- Mis Mascotas -->
    <div class="bg-white rounded-2xl border border-[#dce6f0] p-6 shadow-sm mb-7">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-[#1e3a5f] m-0">Mis Mascotas</h2>
        <button
          @click="irAMascotas"
          class="bg-[#e8f0fa] hover:bg-blue-100 text-[#1d6bbf] font-semibold text-xs px-4 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
        >
          Ver Detalles
        </button>
      </div>
      <MascotasResumen />
    </div>

    <!-- Servicios Disponibles -->
    <div class="bg-white rounded-2xl border border-[#dce6f0] p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-[#1e3a5f] m-0">Servicios Disponibles</h2>
      </div>
      <ServiciosResumen />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

import ResumenCard from '@/components/client/dashboardClient/ResumenCard.vue'
import MascotasResumen from '@/components/client/dashboardClient/MascotasResumen.vue'
import ServiciosResumen from '@/components/client/dashboardClient/ServiciosResumen.vue'

const router = useRouter()
const authStore = useAuthStore()

const nombreUsuario = authStore.user?.name ?? 'Cliente'

const totalMascotas = ref(0)
const totalPendientes = ref(0)
const proximaCita = ref('—')

function irAMascotas() {
  router.push('/client/mascotas')
}

async function cargarDatos() {
  const { data: datosMascotas, execute: cargarMascotas } = ApiUseFetch('mis-mascotas').get().json()
  await cargarMascotas()
  totalMascotas.value = datosMascotas.value?.data?.length ?? 0

  const { data: datosCitas, execute: cargarCitas } = ApiUseFetch('appointments').get().json()
  await cargarCitas()
  const todasLasCitas = datosCitas.value?.data ?? []
  const citasPendientes = todasLasCitas.filter(
    (c: any) => c.status === 'pending' || c.status === 'confirmed',
  )
  totalPendientes.value = citasPendientes.length
  proximaCita.value = citasPendientes[0]?.time_slot?.start_time ?? '—'
}

onMounted(cargarDatos)
</script>
