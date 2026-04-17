<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import ClienteCreateAppointment from '@/views/client/CreateAppointmentView.vue'

// --- ESTADOS ---
const citas = ref<any[]>([])
const cargando = ref(false)
const filtroEstado = ref('')
const mensajeExito = ref('')
const mostrarAgendar = ref(false)

// Modales
const mostrarConfirmCancelar = ref(false)
const citaACancelar = ref<any | null>(null)
const cancelando = ref(false)

const mostrarReagendar = ref(false)
const citaReagendar = ref<any | null>(null)
const slots = ref<any[]>([])
const fechaSeleccionada = ref('')
const slotId = ref<number | null>(null)
const cargandoSlots = ref(false)
const enviandoReagendar = ref(false)
const errorReagendar = ref('')

// --- LÓGICA ---
const citasFiltradas = computed(() => {
  if (!filtroEstado.value) return citas.value
  return citas.value.filter((c: any) => c.status === filtroEstado.value)
})

async function obtenerCitas() {
  cargando.value = true
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
  mensajeExito.value = '¡Cita agendada! Te esperamos.'
  setTimeout(() => (mensajeExito.value = ''), 4000)
  obtenerCitas()
}

// Cancelar
function confirmarCancelar(cita: any) {
  citaACancelar.value = cita
  mostrarConfirmCancelar.value = true
}

async function ejecutarCancelar() {
  if (!citaACancelar.value || cancelando.value) return
  cancelando.value = true
  try {
    const { statusCode, execute } = ApiUseFetch(`/cliente/appointments/${citaACancelar.value.id}`)
      .delete()
      .json()
    await execute()
    if (statusCode.value && statusCode.value < 400) {
      mostrarConfirmCancelar.value = false
      mensajeExito.value = 'Cita cancelada correctamente.'
      setTimeout(() => (mensajeExito.value = ''), 3000)
      obtenerCitas()
    }
  } finally {
    cancelando.value = false
  }
}

// Reagendar
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
  const [year, month] = fechaSeleccionada.value.split('-')
  const { data, execute } = ApiUseFetch(`working-days?year=${year}&month=${month}`).get().json()
  await execute()
  const days = data.value?.data ?? data.value ?? []
  const wd = days.find((d: any) => d.date === fechaSeleccionada.value)
  slots.value = wd?.time_slots?.filter((s: any) => s.status === 'available' && s.is_open) ?? []
  cargandoSlots.value = false
}

async function ejecutarReagendar() {
  if (enviandoReagendar.value || !slotId.value) return
  enviandoReagendar.value = true
  try {
    const { statusCode, execute } = ApiUseFetch(`/cliente/appointments/${citaReagendar.value.id}`)
      .put({ time_slot_id: slotId.value })
      .json()
    await execute()
    if (statusCode.value && statusCode.value < 400) {
      mostrarReagendar.value = false
      mensajeExito.value = 'Cita movida con éxito.'
      obtenerCitas()
    }
  } finally {
    enviandoReagendar.value = false
  }
}

// Helpers Visuales
const configEstado = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'En progreso', color: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
  }
  return map[status] ?? { label: status, color: 'bg-slate-100' }
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
  <div class="max-w-6xl mx-auto p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight m-0 uppercase italic">
          Mis Citas
        </h1>
        <p class="text-slate-500 font-medium">Gestiona el bienestar de tus consentidos.</p>
      </div>
      <button
        @click="mostrarAgendar = true"
        class="bg-[#0056c2] hover:bg-[#004299] text-white font-bold px-6 py-3 rounded-2xl border-none cursor-pointer transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        NUEVA CITA
      </button>
    </header>

    <Transition name="fade">
      <div
        v-if="mensajeExito"
        class="mb-6 bg-emerald-500 text-white font-bold rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          />
        </svg>
        {{ mensajeExito }}
      </div>
    </Transition>

    <div class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="f in filtros"
        :key="f.value"
        @click="cambiarFiltro(f.value)"
        :class="
          filtroEstado === f.value
            ? 'bg-slate-900 text-white shadow-md'
            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
        "
        class="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-none italic"
      >
        {{ f.label }}
      </button>
    </div>

    <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#0056c2] mb-4"
      ></div>
      <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
        Cargando agenda...
      </p>
    </div>

    <div
      v-else-if="citasFiltradas.length === 0"
      class="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center"
    >
      <p class="text-slate-400 font-bold italic">No encontramos ninguna cita con este filtro.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cita in citasFiltradas"
        :key="cita.id"
        class="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border-none"
      >
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0056c2] font-black text-xl shadow-inner"
            >
              {{ cita.pet?.name?.charAt(0) }}
            </div>
            <div>
              <h3 class="m-0 text-slate-900 font-black italic uppercase tracking-tight">
                {{ cita.pet?.name }}
              </h3>
              <p class="m-0 text-xs font-bold text-[#0056c2] opacity-70 uppercase tracking-widest">
                {{ cita.service?.name }}
              </p>
            </div>
          </div>

          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <svg
                class="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm font-bold">
                {{ cita.is_walk_in ? 'Hoy' : (cita.time_slot?.date?.slice(0, 10) ?? '—') }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <svg
                class="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-sm font-bold">
                {{
                  cita.is_walk_in ? 'Inmediato' : (cita.time_slot?.start_time?.slice(0, 5) ?? '—')
                }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span
              :class="configEstado(cita.status).color"
              class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic"
            >
              {{ configEstado(cita.status).label }}
            </span>

            <div v-if="['pending', 'confirmed'].includes(cita.status)" class="flex gap-2">
              <button
                @click="abrirReagendar(cita)"
                title="Mover fecha"
                class="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#0056c2] hover:text-white transition-all border-none cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                @click="confirmarCancelar(cita)"
                title="Cancelar"
                class="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
            <div
              class="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-black italic uppercase m-0 mb-2">
              ¿Seguro que quieres cancelar?
            </h3>
            <p class="text-slate-500 mb-8 font-medium">
              La cita para <b>{{ citaACancelar?.pet?.name }}</b> será eliminada del calendario.
            </p>
            <div class="flex gap-3">
              <button
                @click="mostrarConfirmCancelar = false"
                class="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 border-none cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Volver
              </button>
              <button
                @click="ejecutarCancelar"
                class="flex-1 px-6 py-4 rounded-2xl font-bold bg-red-500 text-white border-none cursor-pointer hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="modal">
        <div
          v-if="mostrarReagendar"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div class="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-black italic uppercase m-0">Cambiar fecha</h3>
              <button
                @click="mostrarReagendar = false"
                class="bg-transparent border-none text-slate-300 hover:text-slate-900 cursor-pointer text-2xl"
              >
                ✕
              </button>
            </div>

            <div class="space-y-6">
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >Selecciona el día</label
                >
                <input
                  type="date"
                  v-model="fechaSeleccionada"
                  @change="cargarSlots"
                  :min="new Date().toISOString().split('T')[0]"
                  class="p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-[#0056c2] transition-all bg-slate-50"
                />
              </div>

              <div v-if="fechaSeleccionada">
                <label
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3"
                  >Horarios disponibles</label
                >
                <div v-if="cargandoSlots" class="animate-pulse flex gap-2">
                  <div v-for="i in 3" :key="i" class="h-10 w-20 bg-slate-100 rounded-xl"></div>
                </div>
                <div v-else-if="slots.length === 0" class="text-amber-600 font-bold italic text-sm">
                  No hay espacios para este día.
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <button
                    v-for="slot in slots"
                    :key="slot.id"
                    @click="slotId = slot.id"
                    :class="
                      slotId === slot.id
                        ? 'bg-[#0056c2] text-white'
                        : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-300'
                    "
                    class="px-4 py-2 rounded-xl text-xs font-black border-none cursor-pointer transition-all italic"
                  >
                    {{ slot.start_time.slice(0, 5) }}
                  </button>
                </div>
              </div>

              <button
                @click="ejecutarReagendar"
                :disabled="!slotId || enviandoReagendar"
                class="w-full py-4 rounded-2xl font-black bg-[#0056c2] text-white border-none cursor-pointer disabled:opacity-30 shadow-xl shadow-blue-100 hover:bg-[#004299] transition-all"
              >
                {{ enviandoReagendar ? 'GUARDANDO...' : 'CONFIRMAR CAMBIO' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s,
    transform 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Personalización del input date */
input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}
</style>
