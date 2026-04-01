<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useRouter } from 'vue-router'

const router = useRouter()
const citas = ref<any[]>([])
const cargando = ref(false)
const filtroEstado = ref('')

async function obtenerCitas() {
  cargando.value = true
  let url = '/appointments'
  if (filtroEstado.value) url += '?status=' + filtroEstado.value

  const { data, execute } = ApiUseFetch(url).get().json()
  await execute()
  citas.value = data.value?.data ?? []
  cargando.value = false
}

function cambiarFiltro(estado: string) {
  filtroEstado.value = estado
  obtenerCitas()
}

async function cambiarEstado(id: number, status: string) {
  const { execute } = ApiUseFetch('/appointments/' + id).put({ status }).json()
  await execute()
  obtenerCitas()
}

async function cancelarCita(id: number) {
  if (!confirm('¿Cancelar esta cita?')) return
  const { execute } = ApiUseFetch('/appointments/' + id).delete().json()
  await execute()
  obtenerCitas()
}

function labelEstado(status: string): string {
  if (status === 'pending') return 'Pendiente'
  if (status === 'confirmed') return 'Confirmada'
  if (status === 'in_progress') return 'En progreso'
  if (status === 'completed') return 'Completada'
  if (status === 'cancelled') return 'Cancelada'
  return status
}

onMounted(() => obtenerCitas())
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-5xl mx-auto">

      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-blue-800">Gestión de Citas</h2>
          <p class="text-blue-400 text-sm mt-1">Panel de recepcionista</p>
        </div>
        <button
          @click="router.push('/recepcionista/agendar')"
          class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
        >+ Agendar cita</button>
      </div>

      <div class="mb-5 flex flex-wrap gap-2">
        <button @click="cambiarFiltro('')" :class="filtroEstado === '' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">Todas</button>
        <button @click="cambiarFiltro('pending')" :class="filtroEstado === 'pending' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">Pendientes</button>
        <button @click="cambiarFiltro('confirmed')" :class="filtroEstado === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">Confirmadas</button>
        <button @click="cambiarFiltro('in_progress')" :class="filtroEstado === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">En progreso</button>
        <button @click="cambiarFiltro('completed')" :class="filtroEstado === 'completed' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">Completadas</button>
        <button @click="cambiarFiltro('cancelled')" :class="filtroEstado === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'" class="px-4 py-1.5 rounded-lg text-sm font-medium transition">Canceladas</button>
      </div>

      <div v-if="cargando" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent"></div>
      </div>

      <div v-if="!cargando && citas.length === 0" class="text-center py-16 text-gray-400">
        No hay citas registradas
      </div>

      <div v-if="!cargando && citas.length > 0" class="grid gap-3">
        <div
          v-for="cita in citas"
          :key="cita.id"
          class="bg-white rounded-xl border border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div class="min-w-40">
            <p class="font-semibold text-gray-800">{{ cita.client.name }}</p>
            <p class="text-sm text-gray-400">{{ cita.pet.name }} · {{ cita.service.name }}</p>
          </div>

          <div class="text-sm text-gray-500 min-w-25">
            <p>{{ cita.time_slot.date.slice(0, 10) }}</p>
            <p>{{ cita.time_slot.start_time }}</p>
          </div>

          <span
            class="px-3 py-1 rounded-full text-xs font-semibold w-fit"
            :class="{
              'bg-yellow-100 text-yellow-700': cita.status === 'pending',
              'bg-blue-100 text-blue-700': cita.status === 'confirmed',
              'bg-purple-100 text-purple-700': cita.status === 'in_progress',
              'bg-green-100 text-green-700': cita.status === 'completed',
              'bg-red-100 text-red-600': cita.status === 'cancelled',
            }"
          >{{ labelEstado(cita.status) }}</span>

          <div class="flex flex-wrap gap-2 ml-auto">
            <button
              v-if="cita.status === 'pending'"
              @click="cambiarEstado(cita.id, 'confirmed')"
              class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium"
            >Confirmar</button>

            <button
              v-if="cita.status === 'confirmed'"
              @click="cambiarEstado(cita.id, 'completed')"
              class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition font-medium"
            >Completar</button>

            <button
              v-if="cita.status !== 'cancelled' && cita.status !== 'completed'"
              @click="cancelarCita(cita.id)"
              class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition font-medium"
            >Cancelar</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
