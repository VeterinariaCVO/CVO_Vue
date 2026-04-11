<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import ClienteCreateAppointment from '@/views/client/CreateAppointmentView.vue'

const citas = ref<any[]>([])
const cargando = ref(false)
const filtroEstado = ref('')
const mensajeExito = ref('')
const mostrarAgendar = ref(false)

const mostrarConfirmCancelar = ref(false)
const citaACancelar = ref<any | null>(null)

const mostrarReagendar = ref(false)
const citaReagendar = ref<any | null>(null)
const slots = ref<any[]>([])
const fechaSeleccionada = ref('')
const slotId = ref<number | null>(null)
const cargandoSlots = ref(false)
const enviandoReagendar = ref(false)
const errorReagendar = ref('')

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

function cambiarFiltro(estado: string) {
  filtroEstado.value = estado
}

function cerrarAgendar() {
  mostrarAgendar.value = false
  mensajeExito.value = 'Cita agendada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerCitas()
}

function confirmarCancelar(cita: any) {
  citaACancelar.value = cita
  mostrarConfirmCancelar.value = true
}

async function ejecutarCancelar() {
  if (!citaACancelar.value) return
  const { execute } = ApiUseFetch(`/cliente/appointments/${citaACancelar.value.id}`).delete().json()
  await execute()
  mostrarConfirmCancelar.value = false
  citaACancelar.value = null
  mensajeExito.value = 'Cita cancelada'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerCitas()
}

function abrirReagendar(cita: any) {
  citaReagendar.value = cita
  fechaSeleccionada.value = ''
  slotId.value = null
  slots.value = []
  errorReagendar.value = ''
  mostrarReagendar.value = true
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null

  const fecha = fechaSeleccionada.value
  const year = Number(fecha.slice(0, 4))
  const month = Number(fecha.slice(5, 7))

  const { data, execute } = ApiUseFetch(`working-days?year=${year}&month=${month}`).get().json()

  await execute()

  const days = Array.isArray(data.value) ? data.value : (data.value?.data ?? [])
  const wd = days.find((d: any) => d.date === fecha)

  if (!wd || !wd.is_open) {
    cargandoSlots.value = false
    return
  }

  slots.value = (wd.time_slots ?? []).filter((s: any) => s.status === 'available' && s.is_open)

  cargandoSlots.value = false
}

async function ejecutarReagendar() {
  errorReagendar.value = ''
  if (!slotId.value) {
    errorReagendar.value = 'Selecciona un horario.'
    return
  }
  enviandoReagendar.value = true

  const { data, statusCode, execute } = ApiUseFetch(
    `/cliente/appointments/${citaReagendar.value.id}`,
  )
    .put({ time_slot_id: slotId.value })
    .json() // ← solo time_slot_id, sin status

  await execute()
  enviandoReagendar.value = false

  if (statusCode.value && statusCode.value >= 400) {
    errorReagendar.value = (data.value as any)?.message ?? 'Error al reagendar.'
    return
  }

  mostrarReagendar.value = false
  mensajeExito.value = 'Cita reagendada correctamente'
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
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Historial y gestión de tus citas</p>
      </div>
      <button
        @click="mostrarAgendar = true"
        class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Agendar cita
      </button>
    </div>

    <!-- Éxito -->
    <div
      v-if="mensajeExito"
      class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm"
    >
      {{ mensajeExito }}
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <!-- Filtros -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="f in filtros"
            :key="f.value"
            @click="cambiarFiltro(f.value)"
            :class="
              filtroEstado === f.value
                ? 'bg-[#1d6bbf] text-white'
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            "
            class="px-3 py-1.5 rounded-lg text-xs border-none transition-colors cursor-pointer"
          >
            {{ f.label }}
          </button>
        </div>
        <span class="text-xs text-slate-400">{{ citasFiltradas.length }} registros</span>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="flex justify-center py-14">
        <div
          class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"
        ></div>
      </div>

      <!-- Empty -->
      <p v-else-if="citasFiltradas.length === 0" class="text-center text-sm text-slate-400 py-12">
        No hay citas registradas.
      </p>

      <!-- Tabla -->
      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Servicio</th>
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
            <td class="px-5 py-3 text-sm text-slate-800">{{ cita.pet?.name }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ cita.service?.name }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">
              {{ cita.time_slot?.date?.slice(0, 10) ?? '—' }}
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">
              {{ cita.time_slot?.start_time?.slice(0, 5) ?? '—' }}
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
                >{{ labelEstado(cita.status) }}</span
              >
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <!-- Reagendar -->
                <button
                  v-if="cita.status === 'pending' || cita.status === 'confirmed'"
                  @click="abrirReagendar(cita)"
                  title="Reagendar"
                  class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M12 7v5l4 2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <!-- Cancelar -->
                <button
                  v-if="cita.status === 'pending' || cita.status === 'confirmed'"
                  @click="confirmarCancelar(cita)"
                  title="Cancelar"
                  class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
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

  <ClienteCreateAppointment
    v-if="mostrarAgendar"
    @cerrar="mostrarAgendar = false"
    @guardado="cerrarAgendar"
  />

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="mostrarConfirmCancelar"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0, 0, 0, 0.25)"
        @click.self="mostrarConfirmCancelar = false"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-xs w-11/12">
          <p class="text-sm font-semibold text-slate-800 m-0 mb-1">¿Cancelar esta cita?</p>
          <p class="text-sm text-slate-400 m-0 mb-5 leading-relaxed">
            Se cancelará la cita de
            <span class="text-slate-600">{{ citaACancelar?.pet?.name }}</span>
            — <span class="text-slate-600">{{ citaACancelar?.service?.name }}</span
            >.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="mostrarConfirmCancelar = false"
              class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-transparent text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Volver
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

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="mostrarReagendar"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0, 0, 0, 0.25)"
        @click.self="mostrarReagendar = false"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-11/12">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-slate-800 m-0">Reagendar cita</p>
            <button
              @click="mostrarReagendar = false"
              class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <p class="text-xs text-slate-400 mb-4">
            {{ citaReagendar?.pet?.name }} · {{ citaReagendar?.service?.name }}
          </p>

          <div class="flex flex-col gap-1 mb-3">
            <label class="text-xs text-slate-500">Nueva fecha</label>
            <input
              type="date"
              v-model="fechaSeleccionada"
              @change="cargarSlots"
              :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <!-- Slots -->
          <div v-if="fechaSeleccionada" class="mb-4">
            <label class="text-xs text-slate-500 block mb-2">Horario disponible</label>
            <div v-if="cargandoSlots" class="text-xs text-slate-400">Cargando horarios...</div>
            <div v-else-if="slots.length === 0" class="text-xs text-slate-400">
              No hay horarios disponibles para esta fecha.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="slot in slots"
                :key="slot.id"
                @click="slotId = slot.id"
                :class="
                  slotId === slot.id
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                "
                class="border rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer"
              >
                {{ slot.start_time.slice(0, 5) }}
              </button>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="errorReagendar"
            class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3"
          >
            {{ errorReagendar }}
          </div>

          <div class="flex gap-2">
            <button
              @click="mostrarReagendar = false"
              class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarReagendar"
              :disabled="enviandoReagendar || !slotId"
              class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors"
            >
              {{ enviandoReagendar ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  transition: opacity 0.15s ease;
}
.modal-leave-active {
  transition: opacity 0.1s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
