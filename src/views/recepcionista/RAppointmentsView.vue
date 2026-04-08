<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import ReagendarCitaModal from '@/views/recepcionista/RUpdateAppointment.vue'
import RCreateAppointmentView from '@/views/recepcionista/RCreateAppointment.vue'

const mostrarReagendar = ref(false)
const citaReagendarId = ref<number | null>(null)
const mostrarAgendar = ref(false)
const citas = ref<any[]>([])
const cargando = ref(false)
const filtroEstado = ref('')
const mensajeExito = ref('')

const mostrarConfirmCancelar = ref(false)
const citaACancelar = ref<any | null>(null)

const citasFiltradas = computed(() => {
  if (!filtroEstado.value) return citas.value
  return citas.value.filter((c: any) => c.status === filtroEstado.value)
})

async function obtenerCitas() {
  cargando.value = true
  citas.value = []
  const { data, execute } = ApiUseFetch('/appointments').get().json()
  await execute()
  citas.value = data.value?.data ?? []
  cargando.value = false
}

function abrirReagendar(id: number) {
  citaReagendarId.value = id
  mostrarReagendar.value = true
}

async function cerrarReagendar() {
  mostrarReagendar.value = false
  citaReagendarId.value = null
  await obtenerCitas()
}

function cerrarAgendar() {
  mostrarAgendar.value = false
  mensajeExito.value = 'Cita agendada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerCitas()
}

function cambiarFiltro(estado: string) {
  filtroEstado.value = estado
}

// FIX: solo mandar time_slot_id si la cita lo tiene (walk-in no tienen slot)
function buildPayload(cita: any, status: string) {
  const payload: Record<string, any> = { status }
  if (cita?.time_slot?.id) {
    payload.time_slot_id = cita.time_slot.id
  }
  return payload
}

async function cambiarEstado(id: number, status: string) {
  const cita = citas.value.find((c: any) => c.id === id)
  const { data, statusCode, execute } = ApiUseFetch(`/recep/appointments/${id}`)
    .put(buildPayload(cita, status)).json()
  await execute()

  if (statusCode.value && statusCode.value >= 400) {
    alert((data.value as any)?.message ?? 'Error al actualizar')
    return
  }

  const labels: Record<string, string> = {
    confirmed: 'Cita confirmada',
    completed: 'Cita completada',
    in_progress: 'Cita en progreso',
  }
  mensajeExito.value = labels[status] ?? 'Estado actualizado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerCitas()
}

function confirmarCancelar(id: number) {
  const cita = citas.value.find((c: any) => c.id === id) ?? null
  citaACancelar.value = cita
  mostrarConfirmCancelar.value = true
}

async function ejecutarCancelar() {
  if (!citaACancelar.value) return
  const cita = citaACancelar.value
  const { data, statusCode, execute } = ApiUseFetch(`/recep/appointments/${cita.id}`)
    .put(buildPayload(cita, 'cancelled')).json()
  await execute()

  mostrarConfirmCancelar.value = false
  citaACancelar.value = null

  if (statusCode.value && statusCode.value >= 400) {
    alert((data.value as any)?.message ?? 'Error al cancelar')
    return
  }

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
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Citas</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Gestion de citas</p>
      </div>
      <button
        @click="mostrarAgendar = true"
        class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Agendar cita
      </button>
    </div>

    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">
      {{ mensajeExito }}
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="f in filtros"
            :key="f.value"
            @click="cambiarFiltro(f.value)"
            :class="filtroEstado === f.value ? 'bg-[#1d6bbf] text-white' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-lg text-xs border-none transition-colors cursor-pointer"
          >{{ f.label }}</button>
        </div>
        <span class="text-xs text-slate-400">{{ citasFiltradas.length }} registros</span>
      </div>

      <div v-if="cargando" class="flex justify-center py-14">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"></div>
      </div>

      <p v-else-if="citasFiltradas.length === 0" class="text-center text-sm text-slate-400 py-12">
        No hay citas registradas.
      </p>

      <table v-else class="w-full border-collapse">
        <thead>
        <tr class="border-b border-slate-100">
          <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Cliente</th>
          <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota / Servicio</th>
          <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
          <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Hora</th>
          <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
          <th class="text-xs text-slate-400 font-medium px-5 py-3"></th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="cita in citasFiltradas"
          :key="cita.id"
          class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
        >
          <td class="px-5 py-3 text-sm text-slate-800">{{ cita.client?.name }}</td>
          <td class="px-5 py-3">
            <p class="text-sm text-slate-800 m-0">{{ cita.pet?.name }}</p>
            <p class="text-xs text-slate-400 m-0">{{ cita.service?.name }}</p>
          </td>
          <td class="px-5 py-3 text-sm text-slate-500">{{ cita.time_slot?.date?.slice(0, 10) ?? '—' }}</td>
          <td class="px-5 py-3 text-sm text-slate-500">{{ cita.time_slot?.start_time?.slice(0, 5) ?? '—' }}</td>
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
              >{{ labelEstado(cita.status) }}</span>
          </td>
          <td class="px-5 py-3">
            <div class="flex items-center justify-end gap-1">
              <button
                v-if="cita.status === 'pending'"
                @click="cambiarEstado(cita.id, 'confirmed')"
                title="Confirmar"
                class="p-1.5 rounded-md text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                v-if="cita.status === 'confirmed'"
                @click="cambiarEstado(cita.id, 'completed')"
                title="Completar"
                class="p-1.5 rounded-md text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                v-if="cita.status === 'in_progress'"
                @click="cambiarEstado(cita.id, 'completed')"
                title="Completar"
                class="p-1.5 rounded-md text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </button>
              <button
                v-if="cita.status === 'pending' || cita.status === 'confirmed'"
                @click="abrirReagendar(cita.id)"
                title="Reagendar"
                class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12 7v5l4 2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                v-if="cita.status !== 'cancelled' && cita.status !== 'completed'"
                @click="confirmarCancelar(cita.id)"
                title="Cancelar"
                class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

  <ReagendarCitaModal
    v-if="mostrarReagendar && citaReagendarId"
    :citaId="citaReagendarId"
    @cerrar="cerrarReagendar"
    @guardado="cerrarReagendar"
  />
  <RCreateAppointmentView
    v-if="mostrarAgendar"
    @cerrar="mostrarAgendar = false"
    @guardado="cerrarAgendar"
  />

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="mostrarConfirmCancelar"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0,0,0,0.25)"
        @click.self="mostrarConfirmCancelar = false"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-xs w-11/12">
          <p class="text-sm font-semibold text-slate-800 m-0 mb-1">¿Cancelar esta cita?</p>
          <p class="text-sm text-slate-400 m-0 mb-5 leading-relaxed">
            Se cancelará la cita de
            <span class="text-slate-600">{{ citaACancelar?.client?.name }}</span>
            con <span class="text-slate-600">{{ citaACancelar?.pet?.name }}</span>.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="mostrarConfirmCancelar = false"
              class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-transparent text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarCancelar"
              class="text-sm px-3 py-1.5 rounded-lg border-none bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
            >
              Sí, cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
