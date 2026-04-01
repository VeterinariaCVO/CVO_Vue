<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useRouter } from 'vue-router'
import ReagendarCitaModal from '@/components/admin/RescheduleAppointmentModal.vue'

const mostrarReagendar = ref(false)
const citaReagendarId = ref<number | null>(null)
const router = useRouter()
const citas = ref<any[]>([])
const cargando = ref(false)
const filtroEstado = ref('')
const mensajeExito = ref('')

async function obtenerCitas() {
  cargando.value = true
  let url = '/appointments'
  if (filtroEstado.value) url += '?status=' + filtroEstado.value
  const { data, execute } = ApiUseFetch(url).get().json()
  await execute()
  citas.value = data.value?.data ?? []
  cargando.value = false
}

function abrirReagendar(id: number) {
  citaReagendarId.value = id
  mostrarReagendar.value = true
}

function cerrarReagendar() {
  mostrarReagendar.value = false
  citaReagendarId.value = null
  obtenerCitas()
}

function cambiarFiltro(estado: string) {
  filtroEstado.value = estado
  obtenerCitas()
}

async function cambiarEstado(id: number, status: string) {
  const { execute } = ApiUseFetch('/appointments/' + id).put({ status }).json()
  await execute()
  const labels: Record<string, string> = {
    confirmed: 'Cita confirmada',
    completed: 'Cita completada',
  }
  mensajeExito.value = labels[status] ?? 'Estado actualizado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerCitas()
}

async function cancelarCita(id: number) {
  if (!confirm('¿Cancelar esta cita?')) return
  const { execute } = ApiUseFetch('/appointments/' + id).delete().json()
  await execute()
  mensajeExito.value = 'Cita cancelada'
  setTimeout(() => (mensajeExito.value = ''), 3000)
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

const filtros = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

onMounted(() => obtenerCitas())
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />
 
    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Citas</h1>
          <p class="text-sm text-slate-500 mt-1 mb-0">Supervisa y administra todas las citas del sistema</p>
        </div>
        <button
          @click="router.push('/admin/agendar')"
          class="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2 border-none rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Agendar cita
        </button>
      </div>
 
      <!-- Mensaje éxito -->
      <div v-if="mensajeExito" class="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
        {{ mensajeExito }}
        <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 font-bold text-base leading-none">×</button>
      </div>
 
      <!-- Card principal -->
      <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#dce6f0]">
          <h2 class="text-base font-bold text-[#1d6bbf] m-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
            Lista de Citas
          </h2>
          <span class="text-xs text-slate-400 font-medium">{{ citas.length }} registros</span>
        </div>
 
        <!-- Filtros -->
        <div class="px-6 py-3 border-b border-[#dce6f0] flex flex-wrap gap-2">
          <button
            v-for="f in filtros"
            :key="f.value"
            @click="cambiarFiltro(f.value)"
            :class="filtroEstado === f.value
              ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf] hover:text-[#1d6bbf]'"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
          >
            {{ f.label }}
          </button>
        </div>
 
        <!-- Cargando -->
        <div v-if="cargando" class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-4 border-[#1d6bbf] border-t-transparent"></div>
        </div>
 
        <!-- Sin citas -->
        <p v-else-if="citas.length === 0" class="text-center text-slate-400 py-12">
          No hay citas registradas
        </p>
 
        <!-- Tabla de citas -->
        <table v-else class="w-full border-collapse">
          <thead>
            <tr class="border-b border-[#dce6f0]">
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Cliente</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Mascota / Servicio</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Fecha</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Hora</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Estado</th>
              <th class="text-center text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cita in citas"
              :key="cita.id"
              class="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors duration-150"
            >
              <td class="px-6 py-3 text-sm font-semibold text-[#1e3a5f]">{{ cita.client?.name }}</td>
              <td class="px-6 py-3">
                <p class="text-sm text-slate-800 m-0">{{ cita.pet?.name }}</p>
                <p class="text-xs text-slate-400 m-0">{{ cita.service?.name }}</p>
              </td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ cita.time_slot?.date?.slice(0, 10) }}</td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ cita.time_slot?.start_time }}</td>
              <td class="px-6 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-700': cita.status === 'pending',
                    'bg-blue-100 text-blue-700': cita.status === 'confirmed',
                    'bg-purple-100 text-purple-700': cita.status === 'in_progress',
                    'bg-green-100 text-green-700': cita.status === 'completed',
                    'bg-red-100 text-red-600': cita.status === 'cancelled',
                  }"
                >{{ labelEstado(cita.status) }}</span>
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    v-if="cita.status === 'pending'"
                    @click="cambiarEstado(cita.id, 'confirmed')"
                    class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border-none cursor-pointer transition font-semibold"
                  >Confirmar</button>
 
                  <button
                    v-if="cita.status === 'confirmed'"
                    @click="cambiarEstado(cita.id, 'completed')"
                    class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border-none cursor-pointer transition font-semibold"
                  >Completar</button>
 
                  <button
                    v-if="cita.status === 'pending' || cita.status === 'confirmed'"
                    @click="abrirReagendar(cita.id)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none cursor-pointer transition font-semibold"
                  >Reagendar</button>
 
                  <button
                    v-if="cita.status !== 'cancelled' && cita.status !== 'completed'"
                    @click="cancelarCita(cita.id)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border-none cursor-pointer transition font-semibold"
                  >Cancelar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
 
  <ReagendarCitaModal
    v-if="mostrarReagendar && citaReagendarId"
    :citaId="citaReagendarId"
    @cerrar="cerrarReagendar"
    @guardado="cerrarReagendar"
  />
</template>