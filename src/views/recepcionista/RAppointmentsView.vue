<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const router = useRouter()

// ── Estado principal ──────────────────────────────────────────────────────────
const citas = ref<any[]>([])
const cargando = ref(true)
const mensajeExito = ref('')
const mensajeError = ref('')
const filtroEstado = ref('all')
const busqueda = ref('')

// ── Modal confirmar ───────────────────────────────────────────────────────────
const mostrarConfirmar = ref(false)
const citaAConfirmar = ref<any>(null)

// ── Modal cancelar ────────────────────────────────────────────────────────────
const mostrarCancelar = ref(false)
const citaACancelar = ref<any>(null)
const cancelando = ref(false)

// ── Modal reagendar ───────────────────────────────────────────────────────────
const mostrarReagendar = ref(false)
const citaAReagendar = ref<any>(null)
const diasLaborales = ref<any[]>([])
const slotsDisponibles = ref<any[]>([])
const diaSeleccionado = ref<number | null>(null)
const slotSeleccionado = ref<number | null>(null)
const cargandoDias = ref(false)
const cargandoSlots = ref(false)
const reagendando = ref(false)
const confirmando = ref(false)

// ── Helpers visuales ─────────────────────────────────────────────────────────
function estadoLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function estadoClase(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
    in_progress: 'bg-purple-50 text-purple-600 border-purple-200',
    completed: 'bg-green-50 text-green-600 border-green-200',
    cancelled: 'bg-red-50 text-red-400 border-red-200',
  }
  return map[status] ?? 'bg-slate-50 text-slate-400 border-slate-200'
}

function formatearFecha(fecha: string) {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatearHora(hora: string) {
  if (!hora) return '—'
  return hora.slice(0, 5)
}

// ── Carga de citas ────────────────────────────────────────────────────────────
async function cargarCitas() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('appointments').get().json()
  await execute()
  citas.value = data.value?.data ?? []
  cargando.value = false
}

// ── Filtros ───────────────────────────────────────────────────────────────────
const filtros = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'En curso', value: 'in_progress' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
]

const citasFiltradas = computed(() => {
  let lista = citas.value
  if (filtroEstado.value !== 'all') {
    lista = lista.filter(c => c.status === filtroEstado.value)
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(c =>
      c.pet?.name?.toLowerCase().includes(q) ||
      c.pet?.owner?.name?.toLowerCase().includes(q) ||
      c.service?.name?.toLowerCase().includes(q)
    )
  }
  return lista
})

// ── Contadores por estado ─────────────────────────────────────────────────────
const contadores = computed(() => ({
  all: citas.value.length,
  pending: citas.value.filter(c => c.status === 'pending').length,
  confirmed: citas.value.filter(c => c.status === 'confirmed').length,
  in_progress: citas.value.filter(c => c.status === 'in_progress').length,
  completed: citas.value.filter(c => c.status === 'completed').length,
  cancelled: citas.value.filter(c => c.status === 'cancelled').length,
}))

// ── Confirmar cita ────────────────────────────────────────────────────────────
function abrirConfirmar(cita: any) {
  citaAConfirmar.value = cita
  mostrarConfirmar.value = true
}

async function confirmarCita() {
  if (!citaAConfirmar.value) return
  confirmando.value = true
  const { execute, error } = ApiUseFetch(`appointments/${citaAConfirmar.value.id}`)
    .put({ status: 'confirmed' }).json()
  await execute()
  confirmando.value = false
  mostrarConfirmar.value = false
  if (error.value) {
    mostrarError('Error al confirmar la cita')
  } else {
    mostrarExito('Cita confirmada correctamente')
    await cargarCitas()
  }
  citaAConfirmar.value = null
}

// ── Cancelar cita ─────────────────────────────────────────────────────────────
function abrirCancelar(cita: any) {
  citaACancelar.value = cita
  mostrarCancelar.value = true
}

async function cancelarCita() {
  if (!citaACancelar.value) return
  cancelando.value = true
  const { execute, error } = ApiUseFetch(`appointments/${citaACancelar.value.id}`)
    .delete().json()
  await execute()
  cancelando.value = false
  mostrarCancelar.value = false
  if (error.value) {
    mostrarError('Error al cancelar la cita')
  } else {
    mostrarExito('Cita cancelada correctamente')
    await cargarCitas()
  }
  citaACancelar.value = null
}

// ── Reagendar ─────────────────────────────────────────────────────────────────
async function abrirReagendar(cita: any) {
  citaAReagendar.value = cita
  diaSeleccionado.value = null
  slotSeleccionado.value = null
  slotsDisponibles.value = []
  mostrarReagendar.value = true
  await cargarDiasLaborales()
}

async function cargarDiasLaborales() {
  cargandoDias.value = true
  const { data, execute } = ApiUseFetch('working-days').get().json()
  await execute()
  // Solo días abiertos y con fecha futura o igual a hoy
  const hoy = new Date().toISOString().slice(0, 10)
  diasLaborales.value = (data.value?.data ?? []).filter(
    (d: any) => d.is_open && d.date >= hoy
  )
  cargandoDias.value = false
}

async function seleccionarDia(diaId: number) {
  diaSeleccionado.value = diaId
  slotSeleccionado.value = null
  slotsDisponibles.value = []
  cargandoSlots.value = true
  const { data, execute } = ApiUseFetch(`time-slots?working_day_id=${diaId}`).get().json()
  await execute()
  // Solo slots disponibles, excluyendo el slot actual de la cita
  slotsDisponibles.value = (data.value?.data ?? []).filter(
    (s: any) => s.status === 'available' || s.id === citaAReagendar.value?.time_slot_id
  )
  cargandoSlots.value = false
}

async function confirmarReagendar() {
  if (!citaAReagendar.value || !slotSeleccionado.value) return
  reagendando.value = true
  const { execute, error } = ApiUseFetch(`appointments/${citaAReagendar.value.id}`)
    .put({ time_slot_id: slotSeleccionado.value }).json()
  await execute()
  reagendando.value = false
  mostrarReagendar.value = false
  if (error.value) {
    mostrarError('Error al reagendar la cita')
  } else {
    mostrarExito('Cita reagendada correctamente')
    await cargarCitas()
  }
  citaAReagendar.value = null
}

// ── Notificaciones visuales ───────────────────────────────────────────────────
function mostrarExito(msg: string) {
  mensajeExito.value = msg
  setTimeout(() => (mensajeExito.value = ''), 3500)
}

function mostrarError(msg: string) {
  mensajeError.value = msg
  setTimeout(() => (mensajeError.value = ''), 3500)
}

onMounted(cargarCitas)
</script>

<template>
  <div class="p-8 space-y-5">

    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Gestión de Citas</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Confirma, reagenda o cancela citas de clientes</p>
      </div>
      <button
        @click="router.push('/recepcionista/agendar')"
        class="flex items-center gap-2 bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Nueva cita
      </button>
    </div>

    <!-- Alertas -->
    <div v-if="mensajeExito" class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-lg leading-none">×</button>
    </div>
    <div v-if="mensajeError" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeError }}
      <button @click="mensajeError = ''" class="bg-transparent border-none cursor-pointer text-red-400 text-lg leading-none">×</button>
    </div>

    <!-- Filtros por estado -->
    <div class="flex items-center gap-2 flex-wrap">
      <button
        v-for="f in filtros"
        :key="f.value"
        @click="filtroEstado = f.value"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
        :class="filtroEstado === f.value
          ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'"
      >
        {{ f.label }}
        <span
          class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          :class="filtroEstado === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
        >
          {{ contadores[f.value as keyof typeof contadores] }}
        </span>
      </button>

      <!-- Buscador -->
      <div class="ml-auto flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
        </svg>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar mascota, dueño o servicio..."
          class="text-sm text-slate-700 border-none outline-none bg-transparent w-52 placeholder-slate-400"
        />
      </div>
    </div>

    <!-- Tabla de citas -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">

      <p v-if="cargando" class="text-sm text-slate-400 text-center py-12">Cargando citas...</p>

      <p v-else-if="citasFiltradas.length === 0" class="text-sm text-slate-400 text-center py-12">
        No hay citas que coincidan con el filtro.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dueño</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Servicio</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Hora</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Tipo</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
              <th class="text-xs text-slate-400 font-medium px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cita in citasFiltradas"
              :key="cita.id"
              class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
            >
              <td class="px-5 py-3 text-sm font-medium text-slate-800">
                {{ cita.pet?.name ?? '—' }}
                <span class="text-xs text-slate-400 font-normal block">{{ cita.pet?.species ?? '' }}</span>
              </td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ cita.pet?.owner?.name ?? '—' }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ cita.service?.name ?? '—' }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">
                {{ formatearFecha(cita.time_slot?.working_day?.date ?? '') }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-500">
                {{ formatearHora(cita.time_slot?.start_time ?? '') }}
              </td>
              <td class="px-5 py-3">
                <span v-if="cita.is_walk_in" class="text-xs px-2 py-0.5 rounded border bg-purple-50 text-purple-600 border-purple-200 font-medium">
                  Walk-in
                </span>
                <span v-else class="text-xs px-2 py-0.5 rounded border bg-slate-50 text-slate-400 border-slate-200 font-medium">
                  Normal
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  class="text-xs px-2 py-0.5 rounded border font-medium"
                  :class="estadoClase(cita.status)"
                >
                  {{ estadoLabel(cita.status) }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">

                  <!-- Confirmar (solo pendientes) -->
                  <button
                    v-if="cita.status === 'pending'"
                    @click="abrirConfirmar(cita)"
                    title="Confirmar cita"
                    class="p-1.5 rounded-md text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </button>

                  <!-- Reagendar (pendiente o confirmada) -->
                  <button
                    v-if="['pending','confirmed'].includes(cita.status)"
                    @click="abrirReagendar(cita)"
                    title="Reagendar cita"
                    class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M23 4v6h-6M1 20v-6h6" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>

                  <!-- Cancelar (pendiente o confirmada) -->
                  <button
                    v-if="['pending','confirmed'].includes(cita.status)"
                    @click="abrirCancelar(cita)"
                    title="Cancelar cita"
                    class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>

                  <!-- Sin acciones disponibles -->
                  <span
                    v-if="!['pending','confirmed'].includes(cita.status)"
                    class="text-xs text-slate-300"
                  >—</span>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Confirmar cita ──────────────────────────────────────────────── -->
  <div
    v-if="mostrarConfirmar"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-semibold text-slate-800 m-0">Confirmar cita</h3>
          <p class="text-xs text-slate-400 m-0">Esta acción notificará al cliente</p>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-400">Mascota</span>
          <span class="font-medium text-slate-700">{{ citaAConfirmar?.pet?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Dueño</span>
          <span class="font-medium text-slate-700">{{ citaAConfirmar?.pet?.owner?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Servicio</span>
          <span class="font-medium text-slate-700">{{ citaAConfirmar?.service?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Fecha</span>
          <span class="font-medium text-slate-700">{{ formatearFecha(citaAConfirmar?.time_slot?.working_day?.date ?? '') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Hora</span>
          <span class="font-medium text-slate-700">{{ formatearHora(citaAConfirmar?.time_slot?.start_time ?? '') }}</span>
        </div>
      </div>

      <div class="flex gap-2 pt-1">
        <button
          @click="mostrarConfirmar = false; citaAConfirmar = null"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirmarCita"
          :disabled="confirmando"
          class="flex-1 py-2 rounded-lg bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {{ confirmando ? 'Confirmando...' : 'Sí, confirmar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Cancelar cita ───────────────────────────────────────────────── -->
  <div
    v-if="mostrarCancelar"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-semibold text-slate-800 m-0">Cancelar cita</h3>
          <p class="text-xs text-slate-400 m-0">Esta acción liberará el horario y notificará al cliente</p>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-400">Mascota</span>
          <span class="font-medium text-slate-700">{{ citaACancelar?.pet?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Dueño</span>
          <span class="font-medium text-slate-700">{{ citaACancelar?.pet?.owner?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Servicio</span>
          <span class="font-medium text-slate-700">{{ citaACancelar?.service?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Fecha</span>
          <span class="font-medium text-slate-700">{{ formatearFecha(citaACancelar?.time_slot?.working_day?.date ?? '') }}</span>
        </div>
      </div>

      <p class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
        ⚠️ Esta acción no se puede deshacer.
      </p>

      <div class="flex gap-2 pt-1">
        <button
          @click="mostrarCancelar = false; citaACancelar = null"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Volver
        </button>
        <button
          @click="cancelarCita"
          :disabled="cancelando"
          class="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {{ cancelando ? 'Cancelando...' : 'Sí, cancelar cita' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Reagendar cita ──────────────────────────────────────────────── -->
  <div
    v-if="mostrarReagendar"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M23 4v6h-6M1 20v-6h6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-800 m-0">Reagendar cita</h3>
            <p class="text-xs text-slate-400 m-0">
              {{ citaAReagendar?.pet?.name }} · {{ citaAReagendar?.service?.name }}
            </p>
          </div>
        </div>
        <button
          @click="mostrarReagendar = false; citaAReagendar = null"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer text-slate-500 text-lg transition-colors"
        >×</button>
      </div>

      <!-- Paso 1: Seleccionar día -->
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">1. Selecciona un día</p>
        <p v-if="cargandoDias" class="text-sm text-slate-400 py-3 text-center">Cargando días...</p>
        <p v-else-if="diasLaborales.length === 0" class="text-sm text-slate-400 py-3 text-center">No hay días laborales disponibles.</p>
        <div v-else class="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          <button
            v-for="dia in diasLaborales"
            :key="dia.id"
            @click="seleccionarDia(dia.id)"
            class="px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-left"
            :class="diaSeleccionado === dia.id
              ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf] hover:text-[#1d6bbf]'"
          >
            {{ formatearFecha(dia.date) }}
          </button>
        </div>
      </div>

      <!-- Paso 2: Seleccionar slot -->
      <div v-if="diaSeleccionado">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">2. Selecciona un horario</p>
        <p v-if="cargandoSlots" class="text-sm text-slate-400 py-3 text-center">Cargando horarios...</p>
        <p v-else-if="slotsDisponibles.length === 0" class="text-sm text-slate-400 py-3 text-center">No hay horarios disponibles para este día.</p>
        <div v-else class="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
          <button
            v-for="slot in slotsDisponibles"
            :key="slot.id"
            @click="slotSeleccionado = slot.id"
            class="px-2 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-center"
            :class="slotSeleccionado === slot.id
              ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf] hover:text-[#1d6bbf]'"
          >
            {{ formatearHora(slot.start_time) }}
          </button>
        </div>
      </div>

      <div class="flex gap-2 pt-1">
        <button
          @click="mostrarReagendar = false; citaAReagendar = null"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirmarReagendar"
          :disabled="!slotSeleccionado || reagendando"
          class="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ reagendando ? 'Guardando...' : 'Confirmar reagendo' }}
        </button>
      </div>
    </div>
  </div>
</template>
