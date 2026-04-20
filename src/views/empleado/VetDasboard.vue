<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import echo from '@/echo'

import type { Appointment } from '@/types/appointment'

const router = useRouter()
const auth = useAuthStore()
const notificationStore = useNotificationStore()

const WELCOME_KEY = 'cvo_welcome_shown_vet'
const mostrarBienvenida = ref(false)
const cargando = ref(true)
const citas = ref<Appointment[]>([])
const ahora = ref(new Date())
const notisExpandidas = ref(false)
const filtroEstado = ref<string | null>(null)
const cambiandoEstado = ref<number | null>(null)
const busqueda = ref('')
const mostrarModalRegistro = ref(false)
const citaParaRegistro = ref<Appointment | null>(null)

const formRegistro = ref({
  appointment_id: null as number | null,
  weight: '',
  temperature: '',
  diagnosis: '',
  treatment: '',
  prescriptions: '',
  observations: ''
})

// FIX: Cargar en 'todas' por defecto para evitar pantallas vacías
const tabTiempo = ref<'hoy' | 'semana' | 'mes' | 'todas'>('todas')

let relojTimer: ReturnType<typeof setInterval> | null = null

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(timeString?: string | null, isWalkIn?: boolean | null) {
  if (isWalkIn || !timeString) return { time: 'WALK', period: 'IN' }
  const [hour, minute] = String(timeString).split(':')
  const h = parseInt(hour || '0', 10)
  return { time: `${h % 12 || 12}:${minute || '00'}`, period: h >= 12 ? 'pm' : 'am' }
}

function getEspecieAvatar(especie?: string | null): string {
  const map: Record<string, string> = {
    'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Ave': '🦜', 'Roedor': '🐹'
  }
  const clave = especie || 'Otro'
  return map[clave] ?? '🐾'
}

function estadoClase(status?: string | null): string {
  const map: Record<string, string> = {
    confirmed:   'bg-blue-50 text-[#3f98ff] border-blue-100',
    arrived:     'bg-purple-50 text-purple-700 border-purple-200',
    in_progress: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed:   'bg-slate-100 text-slate-500 border-slate-200',
    cancelled:   'bg-red-50 text-red-500 border-red-100',
  }
  return map[status ?? ''] ?? 'bg-slate-50 text-slate-400 border-slate-200'
}

function estadoTexto(status?: string | null): string {
  const map: Record<string, string> = {
    confirmed:   'Agendada',
    arrived:     'En Sala',
    in_progress: 'En Consulta',
    completed:   'Atendido',
    cancelled:   'Cancelado',
  }
  return map[status ?? ''] ?? (status ?? 'Desconocido')
}

// FIX: Función segura para fechas
function getFechaISO(cita: Appointment): string {
  if (cita.time_slot?.date) {
    return String(cita.time_slot.date).slice(0, 10)
  }
  if (cita.created_at) {
    return String(cita.created_at).slice(0, 10)
  }
  return ''
}

function formatFecha(cita: Appointment): string {
  const iso = getFechaISO(cita)
  if (!iso) return '—'
  const partes = iso.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return iso
}

// ─── COMPUTED ─────────────────────────────────────────────────────────────────

const hoy = computed(() => new Date().toISOString().slice(0, 10))

const inicioSemana = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})

const inicioMes = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
})

const finSemana = computed(() => {
  const d = new Date()
  const diaSemana = d.getDay()
  const diferencia = 6 - diaSemana
  d.setDate(d.getDate() + diferencia)
  return d.toISOString().slice(0, 10)
})

const finMes = computed(() => {
  const d = new Date()
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return ultimoDia.toISOString().slice(0, 10)
})

// Filtro por tab de tiempo
const citasPorTab = computed(() => {
  const fechaHoy = hoy.value

  if (tabTiempo.value === 'hoy') {
    return citas.value.filter(c => getFechaISO(c) === fechaHoy)
  }

  if (tabTiempo.value === 'semana') {
    return citas.value.filter(c => {
      const fechaCita = getFechaISO(c)
      return fechaCita >= inicioSemana.value && fechaCita <= finSemana.value
    })
  }

  if (tabTiempo.value === 'mes') {
    return citas.value.filter(c => {
      const fechaCita = getFechaISO(c)
      return fechaCita >= inicioMes.value && fechaCita <= finMes.value
    })
  }

  return citas.value
})

// Ordenadas: activas primero sin importar la fecha
const citasOrdenadas = computed(() => {
  const prioridad = (c: Appointment) => {
    const pEstado: Record<string, number> = {
      in_progress: 0, arrived: 1, confirmed: 2, completed: 3, cancelled: 4
    }
    return pEstado[c.status ?? ''] ?? 5
  }
  return [...citasPorTab.value].sort((a, b) => prioridad(a) - prioridad(b))
})

// Filtradas por estado y búsqueda
const citasFiltradas = computed(() => {
  const lista = filtroEstado.value
    ? citasOrdenadas.value.filter(c => c.status === filtroEstado.value)
    : citasOrdenadas.value

  const q = busqueda.value.toLowerCase().trim()
  if (!q) return lista

  return lista.filter(c =>
    (c.client?.name ?? '').toLowerCase().includes(q) ||
    (c.client?.phone ?? '').toLowerCase().includes(q) ||
    (c.pet?.name ?? '').toLowerCase().includes(q)
  )
})

// FIX: Consulta activa TOTALMENTE LIBRE de restricciones de fecha
const citaActiva = computed(() =>
  citas.value.find(c => c.status === 'in_progress') ||
  citas.value.find(c => c.status === 'arrived') || null
)

// FIX: Stats basadas en la vista actual (citasPorTab)
const statsData = computed(() => [
  {
    label: 'Total Listado', val: citasPorTab.value.length,
    sub: 'Mostradas', icon: '📋', filterKey: null,
    textColor: 'text-slate-800', bgIcon: 'bg-slate-100'
  },
  {
    label: 'En Sala', val: citasPorTab.value.filter(c => c.status === 'arrived').length,
    sub: 'Esperando', icon: '🔔', filterKey: 'arrived',
    textColor: 'text-purple-500', bgIcon: 'bg-purple-50'
  },
  {
    label: 'Atendidos', val: citasPorTab.value.filter(c => c.status === 'completed').length,
    sub: 'Finalizados', icon: '✅', filterKey: 'completed',
    textColor: 'text-slate-400', bgIcon: 'bg-slate-100'
  },
  {
    label: 'Cancelados', val: citasPorTab.value.filter(c => c.status === 'cancelled').length,
    sub: 'Rechazados', icon: '❌', filterKey: 'cancelled',
    textColor: 'text-red-400', bgIcon: 'bg-red-50'
  },
])

const horaActual = computed(() => {
  const h = ahora.value.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const progresoDia = computed(() => {
  const total = citasPorTab.value.length
  if (!total) return 0
  return Math.round((citasPorTab.value.filter(c => c.status === 'completed').length / total) * 100)
})

const tabs = [
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes',    label: 'Este mes' },
  { key: 'todas',  label: 'Todas' },
] as const

// ─── ACCIONES ─────────────────────────────────────────────────────────────────

async function cargarDatos() {
  try {
    const timestamp = new Date().getTime()
    // Aseguramos la barra inicial '/'
    const { data, execute } = ApiUseFetch(`/appointments?_t=${timestamp}`).get().json()
    await execute()
    citas.value = data.value?.data ?? []
  } catch (e) {
    console.error('Error al cargar citas:', e)
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(citaId: number, nuevoEstado: string) {
  if (cambiandoEstado.value === citaId) return
  cambiandoEstado.value = citaId

  // Actualización optimista (instantánea en UI)
  const idx = citas.value.findIndex(c => c.id === citaId)
  const citaActual = citas.value[idx]

  if (idx !== -1 && citaActual) {
    citas.value[idx] = {
      ...citaActual,
      status: nuevoEstado
    } as Appointment
  }

  try {
    const { execute } = ApiUseFetch(`/appointments/${citaId}`).put({ status: nuevoEstado }).json()
    await execute()
    await cargarDatos()
  } catch (e) {
    console.error('Error al cambiar estado:', e)
  } finally {
    cambiandoEstado.value = null
  }
}

function abrirModalRegistro(cita: Appointment) {
  citaParaRegistro.value = cita
  formRegistro.value.appointment_id = cita.id
  mostrarModalRegistro.value = true
}

async function guardarRegistroMedico() {
  if (!formRegistro.value.diagnosis || !formRegistro.value.treatment) {
    alert('Por favor completa el diagnostico y tratamiento.')
    return
  }

  try {
    const { data, execute } = ApiUseFetch('/medical-records').post(formRegistro.value).json()
    await execute()

    if ((data.value as any)?.success) {
      mostrarModalRegistro.value = false
      formRegistro.value = {
        appointment_id: null,
        weight: '',
        temperature: '',
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        observations: ''
      }
      await cargarDatos()
    }
  } catch (e) {
    console.error('Error al guardar el expediente:', e)
  }
}

function cerrarBienvenida() {
  mostrarBienvenida.value = false
  window.sessionStorage.setItem(WELCOME_KEY, 'true')
}

function limpiarFiltros() {
  filtroEstado.value = null
  busqueda.value = ''
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!window.sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  relojTimer = setInterval(() => { ahora.value = new Date() }, 1000)
  cargarDatos()
  notificationStore.fetchNotifications()

  if (auth.user?.id) {
    echo.private(`App.Models.User.${auth.user.id}`)
      .notification(() => { cargarDatos(); notificationStore.fetchNotifications() })
  }

  echo.channel('appointments').listen('.status.updated', () => cargarDatos())
})

onUnmounted(() => {
  if (relojTimer) clearInterval(relojTimer)
  echo.leave(`App.Models.User.${auth.user?.id}`)
  echo.leave('appointments')
})
</script>

<template>
  <div class="h-full bg-[#f8fafc] font-sans italic selection:bg-emerald-100 pb-12">

    <transition name="fade">
      <div v-if="mostrarBienvenida" class="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[300]">
        <div class="text-center text-white relative z-10 animate-slide-up">
          <p class="text-[#22c55e] text-[10px] uppercase tracking-[0.4em] mb-4 font-black">Veterinaria del Oriente</p>
          <h1 class="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-none">
            {{ horaActual }},<br>
            <span class="text-[#22c55e]">Dr. {{ auth.user?.name ? auth.user.name.split(' ')[0] : 'Doctor' }}</span>
          </h1>
          <button @click="cerrarBienvenida" class="bg-[#22c55e] text-white font-black px-12 py-5 rounded-[2rem] hover:bg-white hover:text-[#22c55e] transition-all duration-500 uppercase text-xs tracking-widest shadow-xl">
            Iniciar Jornada Médica
          </button>
        </div>
      </div>
    </transition>

    <main class="p-6 md:p-10 max-w-[1600px] mx-auto flex flex-col gap-8">

      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p class="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Consultorio</p>
          <h1 class="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Dr. {{ auth.user?.name ? auth.user.name.split(' ')[0] : 'Doctor' }}
          </h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden md:flex flex-col gap-2 items-end">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progreso Mostrado · {{ progresoDia }}%</p>
            <div class="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-[#22c55e] rounded-full transition-all duration-700" :style="{ width: `${progresoDia}%` }"></div>
            </div>
          </div>
          <button @click="router.push('/veterinario/mascotas')" class="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:border-[#22c55e] hover:text-[#22c55e] transition-all shadow-sm">
            📁 Expedientes
          </button>
          <button @click="router.push('/veterinario/agenda')" class="bg-[#22c55e] text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-500/30">
            📅 Ver Agenda
          </button>
        </div>
      </header>

      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, key) in statsData" :key="key"
          @click="filtroEstado = item.filterKey; busqueda = ''"
          :class="[
            'relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 bg-white',
            filtroEstado === item.filterKey
              ? 'border-[#22c55e] shadow-xl scale-105 z-10'
              : 'border-transparent shadow-sm hover:border-slate-100'
          ]"
        >
          <div class="flex justify-between items-start mb-3 relative z-10">
            <div :class="['w-10 h-10 rounded-[1rem] flex items-center justify-center text-lg shadow-sm border border-white/50', item.bgIcon]">{{ item.icon }}</div>
            <p :class="['text-3xl font-black tracking-tighter leading-none', item.textColor]">{{ cargando ? '—' : item.val }}</p>
          </div>
          <p class="text-slate-800 text-[10px] font-black uppercase tracking-widest">{{ item.label }}</p>
          <p class="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">{{ item.sub }}</p>
        </div>
      </section>

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">

        <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[640px]">

          <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-3">

            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h2 class="font-black text-slate-800 text-sm uppercase tracking-tighter">
                  Mis Pacientes
                  <span v-if="filtroEstado" class="text-[#22c55e] ml-1">
                    › {{ statsData.find(s => s.filterKey === filtroEstado)?.label }}
                  </span>
                </h2>
                <button v-if="filtroEstado || busqueda" @click="limpiarFiltros"
                  class="text-[8px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-100 hover:text-red-600 transition-colors">
                  ✕ Limpiar
                </button>
              </div>
            </div>

            <div class="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
              <button
                v-for="tab in tabs" :key="tab.key"
                @click="tabTiempo = tab.key; filtroEstado = null; busqueda = ''"
                :class="[
                  'px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200',
                  tabTiempo === tab.key
                    ? 'bg-white text-[#22c55e] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
              <input
                v-model="busqueda" type="text"
                placeholder="Buscar por cliente o mascota..."
                class="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all"
              />
              <button v-if="busqueda" @click="busqueda = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black">✕</button>
            </div>

            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ citasFiltradas.length }} resultado{{ citasFiltradas.length !== 1 ? 's' : '' }}
              <span v-if="busqueda"> para "{{ busqueda }}"</span>
            </p>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pr-2">
            <div v-if="cargando" class="py-20 text-center text-slate-300 font-black uppercase text-[10px] animate-pulse">Cargando pacientes...</div>

            <div v-else-if="citasFiltradas.length === 0" class="py-24 text-center">
              <div class="text-4xl mb-4 opacity-50">🐾</div>
              <p class="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                {{ busqueda ? 'Sin resultados' : 'Sin pacientes en esta vista' }}
              </p>
            </div>

            <div
              v-else v-for="cita in citasFiltradas" :key="cita.id"
              class="grid grid-cols-[70px_1fr_auto] gap-4 items-center p-4 rounded-[2rem] border border-transparent hover:bg-slate-50 group transition-all"
              :class="{
                'bg-[#22c55e]/5 border-[#22c55e]/20': cita.status === 'in_progress',
                'bg-purple-50/40 border-purple-100':  cita.status === 'arrived',
              }"
            >
              <div class="text-center bg-white border border-slate-100 rounded-2xl py-3 shadow-sm group-hover:border-[#22c55e]/30 transition-colors">
                <p class="text-sm font-black text-slate-800 leading-none">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).time }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).period }}</p>
                <p class="text-[7px] font-bold text-slate-300 mt-1 leading-none px-1 truncate">{{ formatFecha(cita) }}</p>
              </div>

              <div class="flex items-center gap-4 pl-2 min-w-0 cursor-pointer"
                @click="cita.pet?.id && router.push(`/veterinario/mascotas/${cita.pet.id}/historial`)">
                <div class="w-12 h-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm shrink-0">
                  {{ getEspecieAvatar(cita.pet?.species) }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#22c55e] transition-colors truncate">
                    {{ cita.pet?.name ?? 'Paciente' }}
                  </h3>
                  <p class="text-[10px] font-bold text-slate-400 truncate">
                    {{ cita.client?.name ?? '—' }}<span v-if="cita.pet?.breed"> · {{ cita.pet.breed }}</span>
                  </p>
                  <p v-if="cita.service?.name" class="text-[9px] font-bold text-slate-300 mt-0.5 uppercase tracking-wider truncate">{{ cita.service.name }}</p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2 pr-2 shrink-0">
                <span :class="['px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm', estadoClase(cita.status)]">
                  {{ estadoTexto(cita.status) }}
                </span>
                <div class="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                  <button v-if="cita.status === 'arrived'" @click.stop="cambiarEstado(cita.id, 'in_progress')" :disabled="cambiandoEstado === cita.id"
                    class="bg-[#22c55e] text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-40">
                    {{ cambiandoEstado === cita.id ? '...' : '🩺 Iniciar' }}
                  </button>
                  <button v-if="cita.status === 'in_progress'" @click.stop="cambiarEstado(cita.id, 'completed')" :disabled="cambiandoEstado === cita.id"
                    class="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase shadow-lg hover:bg-slate-700 transition-all disabled:opacity-40">
                    {{ cambiandoEstado === cita.id ? '...' : '✓ Finalizar' }}
                  </button>
                  <button v-if="cita.pet?.id" @click.stop="router.push(`/veterinario/mascotas/${cita.pet.id}/historial`)"
                    class="bg-blue-50 text-[#3f98ff] border border-blue-100 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase hover:bg-[#3f98ff] hover:text-white transition-all">
                    📁 Exp.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="flex flex-col gap-6 h-[640px]">

          <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex-shrink-0">
            <div class="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest">Consulta Actual</h3>
              <div v-if="citaActiva" class="flex items-center gap-2">
                <span :class="['text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border',
                  citaActiva.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-purple-50 text-purple-600 border-purple-200']">
                  {{ estadoTexto(citaActiva.status) }}
                </span>
                <div :class="['w-2 h-2 rounded-full animate-pulse', citaActiva.status === 'in_progress' ? 'bg-[#22c55e]' : 'bg-purple-500']"></div>
              </div>
            </div>
            <div class="p-6">
              <div v-if="citaActiva" class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center text-3xl border border-[#22c55e]/20">
                    {{ getEspecieAvatar(citaActiva.pet?.species) }}
                  </div>
                  <div>
                    <h4 class="text-lg font-black text-slate-800 uppercase leading-none mb-1">{{ citaActiva.pet?.name }}</h4>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ citaActiva.pet?.species }} · {{ citaActiva.pet?.breed ?? '—' }}</p>
                    <p class="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Exp. #{{ String(citaActiva.pet?.id ?? 0).padStart(4, '0') }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dueño</p>
                    <p class="text-[10px] font-bold text-slate-700 truncate">{{ citaActiva.client?.name }}</p>
                  </div>
                  <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo</p>
                    <p class="text-[10px] font-bold text-slate-700 truncate">{{ citaActiva.service?.name || 'Consulta' }}</p>
                  </div>
                </div>
                <div v-if="citaActiva.notes" class="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                  <p class="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Notas</p>
                  <p class="text-[10px] font-medium text-amber-800 leading-snug">{{ citaActiva.notes }}</p>
                </div>
                <button v-if="citaActiva.status === 'arrived'" @click="cambiarEstado(citaActiva.id, 'in_progress')" :disabled="cambiandoEstado === citaActiva.id"
                  class="w-full bg-[#22c55e] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/30 disabled:opacity-40">
                  {{ cambiandoEstado === citaActiva.id ? 'Procesando...' : '🩺 Iniciar Consulta' }}
                </button>
                <div v-if="citaActiva.status === 'in_progress'" class="flex gap-2">
                  <button @click="abrirModalRegistro(citaActiva)"
                    class="flex-1 bg-[#3f98ff] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    📁 Expediente
                  </button>
                  <button @click="cambiarEstado(citaActiva.id, 'completed')" :disabled="cambiandoEstado === citaActiva.id"
                    class="flex-1 bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-40">
                    {{ cambiandoEstado === citaActiva.id ? '...' : '✓ Finalizar' }}
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 border border-slate-100 opacity-50">😴</div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin consulta activa</p>
                <p class="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-wider">En espera de pacientes</p>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-500"
            :class="notisExpandidas ? 'flex-1' : 'h-[75px]'">
            <div @click="notisExpandidas = !notisExpandidas"
              class="px-6 py-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-3">
                <span class="p-2 bg-slate-100 rounded-xl text-lg">🔔</span>
                <h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest">Alertas</h3>
                <span v-if="notificationStore.unreadCount" class="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {{ notificationStore.unreadCount }}
                </span>
              </div>
              <span class="text-slate-400 transition-transform duration-300" :class="notisExpandidas ? 'rotate-180' : ''">▼</span>
            </div>
            <div v-show="notisExpandidas" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <div v-if="notificationStore.notifications.length === 0" class="py-10 text-center">
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Todo al día ✨</p>
              </div>
              <div v-else v-for="n in notificationStore.notifications.slice(0, 10)" :key="n.id"
                class="p-4 rounded-2xl border border-slate-100 bg-white"
                :class="!n.read ? 'bg-[#22c55e]/5 border-[#22c55e]/20' : ''">
                <p class="text-[10px] font-black text-slate-800 uppercase mb-1 truncate">{{ n.title }}</p>
                <p class="text-[9px] font-medium text-slate-500 leading-snug line-clamp-2">{{ n.message }}</p>
                <p class="text-[8px] font-bold text-slate-300 uppercase mt-2">
                  {{ new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <transition name="fade">
      <div v-if="mostrarModalRegistro" class="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">

          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-xl font-black text-slate-800 uppercase tracking-tighter italic">🩺 Nueva Nota Medica</h3>
              <p class="text-[10px] font-bold text-[#3f98ff] uppercase tracking-widest">
                Mascota: {{ citaParaRegistro?.pet?.name }} · Dueño: {{ citaParaRegistro?.client?.name }}
              </p>
            </div>
            <button @click="mostrarModalRegistro = false" class="text-slate-300 hover:text-red-500 transition-colors text-2xl font-black">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label class="block text-[9px] font-black text-slate-400 uppercase mb-1">Peso (kg)</label>
              <input v-model="formRegistro.weight" type="number" placeholder="0.00" class="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700">
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label class="block text-[9px] font-black text-slate-400 uppercase mb-1">Temp (°C)</label>
              <input v-model="formRegistro.temperature" type="number" placeholder="38.5" class="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700">
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label class="block text-[9px] font-black text-slate-400 uppercase mb-1">Diagnostico *</label>
              <textarea v-model="formRegistro.diagnosis" rows="2" placeholder="¿Que tiene el paciente?" class="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-600 resize-none"></textarea>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label class="block text-[9px] font-black text-slate-400 uppercase mb-1">Tratamiento *</label>
              <textarea v-model="formRegistro.treatment" rows="2" placeholder="Procedimiento realizado..." class="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-600 resize-none"></textarea>
            </div>
            <div class="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
              <label class="block text-[9px] font-black text-[#3f98ff] uppercase mb-1">Receta / Prescripciones</label>
              <textarea v-model="formRegistro.prescriptions" rows="3" placeholder="Medicamentos y dosis..." class="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 resize-none"></textarea>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button @click="mostrarModalRegistro = false" class="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors">Cancelar</button>
            <button @click="guardarRegistroMedico" class="flex-[2] bg-[#22c55e] text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
              ✓ Guardar y Finalizar Cita
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
</style>
