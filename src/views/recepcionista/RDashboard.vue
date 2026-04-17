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

const WELCOME_KEY = 'cvo_welcome_shown_recep'
const mostrarBienvenida = ref(false)
const cargando = ref(true)
const citas = ref<Appointment[]>([])
const ahora = ref(new Date())
const notisExpandidas = ref(false)
const filtroActual = ref<string | null>(null)
const cambiandoEstado = ref<number | null>(null)

let relojTimer: ReturnType<typeof setInterval> | null = null

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatTime(timeString?: string | null, isWalkIn?: boolean | null) {
  if (isWalkIn || !timeString) return { time: 'WALK', period: 'IN' }
  const safeTime = String(timeString)
  const [hour, minute] = safeTime.split(':')
  const h = parseInt(hour || '0', 10)
  const period = h >= 12 ? 'pm' : 'am'
  const displayHour = h % 12 || 12
  return { time: `${displayHour}:${minute || '00'}`, period }
}

function getEspecieAvatar(especie?: string | null): string {
  if (!especie) return '🐾'
  const map: Record<string, string> = {
    'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Ave': '🦜', 'Roedor': '🐹'
  }
  return map[especie] ?? '🐾'
}

function estadoClase(status?: string | null): string {
  const map: Record<string, string> = {
    pending:     'bg-amber-100 text-amber-800 border-amber-200',
    confirmed:   'bg-blue-50 text-[#3f98ff] border-blue-100',
    arrived:     'bg-purple-50 text-purple-700 border-purple-200',
    in_progress: 'bg-[#22c55e]/20 text-emerald-800 border-[#22c55e]/30',
    completed:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelled:   'bg-red-50 text-red-600 border-red-100',
  }
  return map[status ?? ''] ?? 'bg-slate-50 text-slate-500 border-slate-200'
}

function estadoTexto(status?: string | null): string {
  const map: Record<string, string> = {
    pending:     'En espera',
    confirmed:   'Agendada',
    arrived:     'En sala',
    in_progress: 'En consulta',
    completed:   'Atendido',
    cancelled:   'Cancelado',
  }
  return map[status ?? ''] ?? (status ?? 'Desconocido')
}

// ─── COMPUTED ─────────────────────────────────────────────────────────────────

const hoy = computed(() => new Date().toISOString().slice(0, 10))

const citasHoy = computed(() => {
  return citas.value.filter(c => {
    const fechaCita = c.is_walk_in ? c.created_at : (c.time_slot?.date ?? c.created_at)
    if (!fechaCita) return false
    return String(fechaCita).slice(0, 10) === hoy.value
  }).sort((a, b) => {
    if (a.is_walk_in) return -1
    if (b.is_walk_in) return 1
    const timeA = a.time_slot?.start_time ?? ''
    const timeB = b.time_slot?.start_time ?? ''
    return timeA.localeCompare(timeB)
  })
})

const citasFiltradas = computed(() => {
  if (!filtroActual.value) return citasHoy.value
  return citasHoy.value.filter(c => c.status === filtroActual.value)
})

const pacienteActivo = computed(() => {
  return citasHoy.value.find(c => c.status === 'in_progress') ||
         citasHoy.value.find(c => c.status === 'arrived') ||
         citasHoy.value.find(c => c.status === 'pending') || null
})

const statsData = computed(() => [
  {
    label: 'Citas Hoy',
    val: citasHoy.value.length,
    sub: 'Total',
    icon: '📅',
    filterKey: null,
    textColor: 'text-slate-800',
    bgIcon: 'bg-slate-100',
  },
  {
    label: 'En Espera',
    val: citasHoy.value.filter(c => c.status === 'pending').length,
    sub: 'Por aprobar',
    icon: '⏳',
    filterKey: 'pending',
    textColor: 'text-amber-500',
    bgIcon: 'bg-amber-50',
  },
  {
    label: 'Agendadas',
    val: citasHoy.value.filter(c => c.status === 'confirmed').length,
    sub: 'Confirmadas',
    icon: '📋',
    filterKey: 'confirmed',
    textColor: 'text-[#3f98ff]',
    bgIcon: 'bg-blue-50',
  },
  {
    label: 'En Sala',
    val: citasHoy.value.filter(c => c.status === 'arrived').length,
    sub: 'Esperando',
    icon: '🔔',
    filterKey: 'arrived',
    textColor: 'text-purple-500',
    bgIcon: 'bg-purple-50',
  },
  {
    label: 'En Consulta',
    val: citasHoy.value.filter(c => c.status === 'in_progress').length,
    sub: 'Atendiéndose',
    icon: '🩺',
    filterKey: 'in_progress',
    textColor: 'text-[#22c55e]',
    bgIcon: 'bg-emerald-50',
  },
  {
    label: 'Atendidos',
    val: citasHoy.value.filter(c => c.status === 'completed').length,
    sub: 'Finalizadas',
    icon: '✅',
    filterKey: 'completed',
    textColor: 'text-slate-400',
    bgIcon: 'bg-slate-50',
  },
])

const horaActual = computed(() => {
  const h = ahora.value.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

// ─── ACCIONES ─────────────────────────────────────────────────────────────────

async function cargarDatos() {
  try {
    const { data, execute } = ApiUseFetch('appointments').get().json()
    await execute()
    citas.value = data.value?.data ?? []
  } catch (error) {
    console.error('Error al cargar citas:', error)
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(citaId: number, nuevoEstado: string) {
  if (cambiandoEstado.value === citaId) return
  cambiandoEstado.value = citaId
  try {
    const { execute } = ApiUseFetch(`/appointments/${citaId}`)
      .put({ status: nuevoEstado })
      .json()
    await execute()
    await cargarDatos()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  } finally {
    cambiandoEstado.value = null
  }
}

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  relojTimer = setInterval(() => { ahora.value = new Date() }, 1000)
  cargarDatos()
  notificationStore.fetchNotifications()

  // Notificaciones del usuario logueado
  if (auth.user?.id) {
    echo.private(`App.Models.User.${auth.user.id}`)
      .notification((notification: any) => {
        if (notification.type.includes('Appointment')) cargarDatos()
        notificationStore.fetchNotifications()
      })
  }

  // Canal público de citas — se activa con cualquier cambio de estado
  echo.channel('appointments')
    .listen('.status.updated', () => {
      cargarDatos()
    })
})

onUnmounted(() => {
  if (relojTimer) clearInterval(relojTimer)
  echo.leave(`App.Models.User.${auth.user?.id}`)
  echo.leave('appointments')
})
</script>

<template>
  <div class="h-full bg-[#f8fafc] font-sans italic selection:bg-blue-100 pb-12">

    <!-- ─── PANTALLA DE BIENVENIDA ──────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="mostrarBienvenida" class="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[300]">
        <div class="absolute inset-0 bg-[#3f98ff]/20 blur-[150px] rounded-full w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div class="text-center text-white relative z-10 animate-slide-up">
          <p class="text-[#3f98ff] text-[10px] uppercase tracking-[0.4em] mb-4 font-black">Veterinaria del Oriente</p>
          <h1 class="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-none">
            {{ horaActual }}, <br>
            <span class="text-[#3f98ff]">{{ auth.user?.name?.split(' ')[0] }}</span>
          </h1>
          <button @click="entrarAlPanel" class="bg-[#3f98ff] text-white font-black px-12 py-5 rounded-[2rem] hover:bg-white hover:text-[#3f98ff] transition-all duration-500 active:scale-95 uppercase text-xs tracking-widest shadow-[0_20px_40px_-10px_rgba(63,152,255,0.5)]">
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-6 md:p-10 max-w-[1600px] mx-auto flex flex-col gap-8">

      <!-- ─── HEADER ─────────────────────────────────────────────────────────── -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">{{ horaActual }}</h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="router.push('/recepcionista/walk-in')" class="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:border-[#3f98ff] hover:text-[#3f98ff] transition-all shadow-sm">
            + Sin Cita (Walk-In)
          </button>
          <button @click="router.push('/recepcionista/agendar')" class="bg-[#3f98ff] text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/30">
            + Nueva Cita
          </button>
        </div>
      </header>

      <!-- ─── TARJETAS DE STATS ───────────────────────────────────────────────
           6 tarjetas: Total / Pendiente / Confirmada / En Sala / En Consulta / Atendida
      -->
      <section class="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          v-for="(item, key) in statsData"
          :key="key"
          @click="filtroActual = item.filterKey"
          :class="[
            'relative p-5 rounded-[2rem] border-2 cursor-pointer overflow-hidden transition-all duration-300',
            filtroActual === item.filterKey
              ? 'bg-white border-[#3f98ff] shadow-[0_15px_30px_-10px_rgba(63,152,255,0.3)] scale-105 z-10'
              : 'bg-white border-transparent shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:border-slate-100'
          ]"
        >
          <div v-if="filtroActual === item.filterKey" class="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-[#3f98ff]/10 to-transparent rounded-full blur-2xl"></div>

          <div class="flex justify-between items-start mb-3 relative z-10">
            <div :class="['w-10 h-10 rounded-[1rem] flex items-center justify-center text-lg shadow-sm border border-white/50', item.bgIcon]">
              {{ item.icon }}
            </div>
            <p :class="['text-3xl font-black tracking-tighter leading-none', item.textColor]">
              {{ cargando ? '-' : item.val }}
            </p>
          </div>
          <div class="relative z-10">
            <p class="text-slate-800 text-[10px] font-black uppercase tracking-widest">{{ item.label }}</p>
            <p class="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">{{ item.sub }}</p>
          </div>
        </div>
      </section>

      <!-- ─── CUERPO PRINCIPAL ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">

        <!-- ─── AGENDA ───────────────────────────────────────────────────────── -->
        <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[600px]">
          <div class="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div class="flex items-center gap-3">
              <h2 class="font-black text-slate-800 text-sm uppercase tracking-tighter">
                Agenda del Día
                <span v-if="filtroActual" class="text-[#3f98ff] ml-1">
                  › {{ statsData.find(s => s.filterKey === filtroActual)?.label }}
                </span>
              </h2>
              <button
                v-if="filtroActual"
                @click="filtroActual = null"
                class="text-[8px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                ✕ Limpiar
              </button>
            </div>
            <button @click="router.push('/recepcionista/citas')" class="text-[9px] font-black text-[#3f98ff] hover:text-slate-900 tracking-widest uppercase transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              Ver Historial
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pr-2">

            <div v-if="cargando" class="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest animate-pulse">
              Sincronizando...
            </div>

            <div v-else-if="citasFiltradas.length === 0" class="py-24 text-center">
              <div class="text-4xl mb-4 opacity-50">📭</div>
              <p class="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                {{ filtroActual ? 'No hay pacientes en este estado' : 'No hay citas agendadas hoy' }}
              </p>
            </div>

            <!-- Fila de cada cita -->
            <div
              v-else
              v-for="cita in citasFiltradas"
              :key="cita.id"
              class="grid grid-cols-[70px_1fr_auto] gap-4 items-center p-4 rounded-[2rem] border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer group"
              :class="cita.status === 'in_progress' ? 'bg-[#22c55e]/5 border-[#22c55e]/20' : cita.status === 'arrived' ? 'bg-purple-50/40 border-purple-100' : ''"
            >
              <!-- Hora -->
              <div class="text-center bg-white border border-slate-100 rounded-2xl py-3 shadow-sm group-hover:border-[#3f98ff]/30 transition-colors">
                <p class="text-sm font-black text-slate-800 leading-none">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).time }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).period }}</p>
              </div>

              <!-- Mascota / Cliente -->
              <div class="flex items-center gap-4 pl-2">
                <div class="w-12 h-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shrink-0 shadow-sm">
                  {{ getEspecieAvatar(cita.pet?.species) }}
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1 group-hover:text-[#3f98ff] transition-colors">
                    {{ cita.pet?.name ?? 'Paciente Desconocido' }}
                  </h3>
                  <p class="text-[10px] font-bold text-slate-400 leading-tight">
                    {{ cita.client?.name ?? 'Walk-In' }}
                    <span v-if="cita.pet?.breed"> · {{ cita.pet.breed }}</span>
                  </p>
                  <p v-if="cita.service?.name" class="text-[9px] font-bold text-slate-300 mt-0.5 uppercase tracking-wider">
                    {{ cita.service.name }}
                  </p>
                </div>
              </div>

              <!-- Estado + Botones de acción rápida -->
              <div class="flex flex-col items-end gap-2 pr-2">
                <span :class="['px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm', estadoClase(cita.status)]">
                  {{ estadoTexto(cita.status) }}
                </span>

                <!-- pending → confirmar -->
                <button
                  v-if="cita.status === 'pending'"
                  @click.stop="cambiarEstado(cita.id, 'confirmed')"
                  :disabled="cambiandoEstado === cita.id"
                  class="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-blue-50 text-[#3f98ff] border border-blue-200 hover:bg-[#3f98ff] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {{ cambiandoEstado === cita.id ? '...' : '✓ Confirmar' }}
                </button>

                <!-- confirmed → llegó (paciente llegó físicamente) -->
                <button
                  v-if="cita.status === 'confirmed'"
                  @click.stop="cambiarEstado(cita.id, 'arrived')"
                  :disabled="cambiandoEstado === cita.id"
                  class="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {{ cambiandoEstado === cita.id ? '...' : '🔔 Llegó' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── COLUMNA DERECHA ───────────────────────────────────────────────── -->
        <div class="flex flex-col gap-6 h-[600px]">

          <!-- Check-In Rápido -->
          <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] flex-shrink-0">
            <div class="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest">Paciente Activo</h3>
              <div v-if="pacienteActivo" class="flex items-center gap-2">
                <span :class="[
                  'text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border',
                  pacienteActivo.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  pacienteActivo.status === 'arrived'     ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  'bg-amber-50 text-amber-600 border-amber-200'
                ]">
                  {{ estadoTexto(pacienteActivo.status) }}
                </span>
                <div :class="[
                  'w-2 h-2 rounded-full animate-pulse',
                  pacienteActivo.status === 'in_progress' ? 'bg-[#22c55e]' :
                  pacienteActivo.status === 'arrived'     ? 'bg-purple-500' : 'bg-amber-500'
                ]"></div>
              </div>
            </div>

            <div class="p-6">
              <div v-if="pacienteActivo" class="space-y-5">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-[#3f98ff]/10 flex items-center justify-center text-3xl border border-[#3f98ff]/20">
                    {{ getEspecieAvatar(pacienteActivo.pet?.species) }}
                  </div>
                  <div>
                    <h4 class="text-base font-black text-slate-800 uppercase leading-none mb-1">{{ pacienteActivo.pet?.name }}</h4>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Exp. #{{ pacienteActivo.pet?.id?.toString().padStart(4, '0') || 'N/A' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dueño</p>
                    <p class="text-[10px] font-bold text-slate-700 truncate">{{ pacienteActivo.client?.name }}</p>
                  </div>
                  <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo</p>
                    <p class="text-[10px] font-bold text-slate-700 truncate">{{ pacienteActivo.service?.name || 'Consulta' }}</p>
                  </div>
                </div>

                <!-- Botón de acción según el estado del paciente activo -->
                <button
                  v-if="pacienteActivo.status === 'arrived'"
                  @click="cambiarEstado(pacienteActivo.id, 'in_progress')"
                  :disabled="cambiandoEstado === pacienteActivo.id"
                  class="w-full bg-purple-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-500/30 disabled:opacity-40"
                >
                  {{ cambiandoEstado === pacienteActivo.id ? 'Procesando...' : '🩺 Pasar a Consulta' }}
                </button>

                <button
                  @click="router.push(pacienteActivo.pet?.id ? `/recepcionista/mascotas/${pacienteActivo.pet.id}` : '#')"
                  class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3f98ff] transition-all active:scale-95 shadow-lg"
                >
                  Ver Ficha Médica →
                </button>
              </div>

              <div v-else class="text-center py-6">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 border border-slate-100 opacity-50">☕</div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin pacientes en fila</p>
                <p class="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-wider">Buen momento para un café</p>
              </div>
            </div>
          </section>

          <!-- Notificaciones -->
          <section
            class="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 flex flex-col"
            :class="notisExpandidas ? 'flex-1 min-h-0' : 'flex-shrink-0'"
          >
            <div
              @click="notisExpandidas = !notisExpandidas"
              class="px-6 py-5 flex justify-between items-center cursor-pointer hover:bg-slate-50/80 transition-colors"
              :class="notisExpandidas ? 'border-b border-slate-50 bg-slate-50/50' : 'bg-white'"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-slate-100 rounded-xl">🔔</div>
                <h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest">Notificaciones</h3>
                <span v-if="notificationStore.unreadCount" class="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                  {{ notificationStore.unreadCount }}
                </span>
              </div>
              <svg :class="['w-5 h-5 text-slate-400 transition-transform duration-500', notisExpandidas ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <div v-show="notisExpandidas" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pr-2">
              <div v-if="notificationStore.notifications.length === 0" class="py-10 text-center">
                <div class="text-3xl mb-2 opacity-50">✨</div>
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Todo al día</p>
              </div>

              <div
                v-else
                v-for="n in notificationStore.notifications.slice(0, 10)"
                :key="n.id"
                class="p-4 rounded-2xl border transition-all cursor-pointer relative group"
                :class="!n.read ? 'bg-[#3f98ff]/5 border-[#3f98ff]/20' : 'bg-white border-slate-100 hover:border-slate-200'"
              >
                <div v-if="!n.read" class="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3f98ff] rounded-full shadow-[0_0_8px_#3f98ff]"></div>
                <div class="pl-3">
                  <p class="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1 truncate group-hover:text-[#3f98ff] transition-colors">{{ n.title }}</p>
                  <p class="text-[9px] font-medium text-slate-500 leading-snug line-clamp-2">{{ n.message }}</p>
                  <p class="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2">
                    {{ new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
</style>
