<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const BASE = import.meta.env.VITE_API_URL

const router = useRouter()
const auth = useAuthStore()

const citas = ref<any[]>([])
const cargando = ref(false)
const error = ref(false)
const filtroEstado = ref('')
const mensajeExito = ref('')

async function obtenerCitas() {
  cargando.value = true
  error.value = false
  citas.value = []

  let url = BASE + '/appointments'
  if (filtroEstado.value !== '') {
    url += '?status=' + filtroEstado.value
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
        Accept: 'application/json',
      },
    })

    const json = await res.json()
    citas.value = json.data ?? []
  } catch (e) {
    error.value = true
  }

  cargando.value = false
}

function cambiarFiltro(estado: string) {
  filtroEstado.value = estado
  obtenerCitas()
}

async function cancelarCita(id: number) {
  if (!confirm('¿Cancelar esta cita?')) return

  await fetch(BASE + '/appointments/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
      Accept: 'application/json',
    },
  })

  mensajeExito.value = 'Cita cancelada'
  setTimeout(() => (mensajeExito.value = ''), 3000)

  obtenerCitas()
}

function labelEstado(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_progress: 'En progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

const filtros = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

onMounted(obtenerCitas)
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Mis Citas</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">
          {{ auth.user?.name }}
        </p>
      </div>

      <button
        @click="router.push('/client/agendar')"
        class="bg-[#1d6bbf] hover:bg-[#155a9c] text-white text-sm px-4 py-2 rounded-lg transition"
      >
        + Agendar cita
      </button>
    </div>

    <!-- Mensaje -->
    <div
      v-if="mensajeExito"
      class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex justify-between"
    >
      {{ mensajeExito }}
      <button @click="mensajeExito = ''">×</button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="f in filtros"
        :key="f.value"
        @click="cambiarFiltro(f.value)"
        :class="
          filtroEstado === f.value
            ? 'bg-[#1d6bbf] text-white'
            : 'bg-white text-slate-500 border border-slate-200'
        "
        class="px-3 py-1.5 rounded-lg text-xs transition"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-3 border-b text-xs text-slate-400">
        {{ citas.length }} registros
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="flex justify-center py-14">
        <div class="animate-spin h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf] rounded-full"></div>
      </div>

      <!-- Error -->
      <p v-else-if="error" class="text-center text-red-400 py-10 text-sm">
        Error al cargar citas
      </p>

      <!-- Empty -->
      <p v-else-if="citas.length === 0" class="text-center text-slate-400 py-12 text-sm">
        No hay citas registradas
      </p>

      <!-- Tabla -->
      <table v-else class="w-full border-collapse">
        <thead>
        <tr class="border-b border-slate-100">
          <th class="px-5 py-3 text-left text-xs text-slate-400">Mascota</th>
          <th class="px-5 py-3 text-left text-xs text-slate-400">Servicio</th>
          <th class="px-5 py-3 text-left text-xs text-slate-400">Fecha</th>
          <th class="px-5 py-3 text-left text-xs text-slate-400">Hora</th>
          <th class="px-5 py-3 text-left text-xs text-slate-400">Estado</th>
          <th class="px-5 py-3"></th>
        </tr>
        </thead>

        <tbody>
        <tr
          v-for="cita in citas"
          :key="cita.id"
          class="border-b border-slate-50 hover:bg-slate-50"
        >
          <td class="px-5 py-3 text-sm text-slate-800">
            {{ cita.pet?.name }}
          </td>

          <td class="px-5 py-3 text-sm text-slate-500">
            {{ cita.service?.name }}
          </td>

          <td class="px-5 py-3 text-sm text-slate-500">
            {{ cita.time_slot?.date?.slice(0, 10) }}
          </td>

          <td class="px-5 py-3 text-sm text-slate-500">
            {{ cita.time_slot?.start_time }}
          </td>

          <td class="px-5 py-3">
              <span
                class="text-xs px-2 py-1 rounded-md font-medium"
                :class="{
                  'bg-yellow-100 text-yellow-700': cita.status === 'pending',
                  'bg-blue-100 text-blue-700': cita.status === 'confirmed',
                  'bg-purple-100 text-purple-700': cita.status === 'in_progress',
                  'bg-green-100 text-green-700': cita.status === 'completed',
                  'bg-red-100 text-red-500': cita.status === 'cancelled',
                }"
              >
                {{ labelEstado(cita.status) }}
              </span>
          </td>

          <td class="px-5 py-3 text-right">
            <button
              v-if="cita.status === 'pending' || cita.status === 'confirmed'"
              @click="cancelarCita(cita.id)"
              class="text-xs px-3 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100"
            >
              Cancelar
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
