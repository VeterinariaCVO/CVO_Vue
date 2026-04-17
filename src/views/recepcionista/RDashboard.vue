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

// --- ESTADOS PARA EL MODAL DE DOCTORES ---
const veterinarios = ref<any[]>([])
const mostrarModalAsignacion = ref(false)
const citaSeleccionadaId = ref<number | null>(null)
const idVeterinarioElegido = ref<number | null>(null)

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

/**
 * Corregido: Separamos la lógica para evitar error de TypeScript
 * '??' and '||' operations cannot be mixed without parentheses.
 */
function getEspecieAvatar(especie?: string | null): string {
  const map: Record<string, string> = {
    'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Ave': '🦜', 'Roedor': '🐹'
  }
  const clave = especie || 'Otro'
  return map[clave] ?? '🐾'
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
    return (a.time_slot?.start_time ?? '').localeCompare(b.time_slot?.start_time ?? '')
  })
})

const citasFiltradas = computed(() => {
  if (!filtroActual.value) return citasHoy.value

  // Si filtramos por estos estados, mostramos TODO (Global) para que aparezcan Luna y Rocky
  if (['pending', 'confirmed', 'arrived', 'in_progress'].includes(filtroActual.value)) {
    return citas.value.filter(c => c.status === filtroActual.value)
      .sort((a, b) => String(a.time_slot?.date || a.created_at).localeCompare(String(b.time_slot?.date || b.created_at)))
  }

  return citasHoy.value.filter(c => c.status === filtroActual.value)
})

const pacienteActivo = computed(() => {
  return citasHoy.value.find(c => c.status === 'in_progress') ||
         citasHoy.value.find(c => c.status === 'arrived') || null
})

const statsData = computed(() => [
  { label: 'Citas Hoy', val: citasHoy.value.length, sub: 'Total hoy', icon: '📅', filterKey: null, textColor: 'text-slate-800', bgIcon: 'bg-slate-100' },
  { label: 'En Espera', val: citas.value.filter(c => c.status === 'pending').length, sub: 'Global', icon: '⏳', filterKey: 'pending', textColor: 'text-amber-500', bgIcon: 'bg-amber-50' },
  { label: 'Agendadas', val: citas.value.filter(c => c.status === 'confirmed').length, sub: 'Próximas', icon: '📋', filterKey: 'confirmed', textColor: 'text-[#3f98ff]', bgIcon: 'bg-blue-50' },
  { label: 'En Sala', val: citas.value.filter(c => c.status === 'arrived').length, sub: 'Esperando', icon: '🔔', filterKey: 'arrived', textColor: 'text-purple-500', bgIcon: 'bg-purple-50' },
  { label: 'En Consulta', val: citas.value.filter(c => c.status === 'in_progress').length, sub: 'Atendiéndose', icon: '🩺', filterKey: 'in_progress', textColor: 'text-[#22c55e]', bgIcon: 'bg-emerald-50' },
  { label: 'Atendidos', val: citasHoy.value.filter(c => c.status === 'completed').length, sub: 'Finalizadas hoy', icon: '✅', filterKey: 'completed', textColor: 'text-slate-400', bgIcon: 'bg-slate-50' },
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
    const timestamp = new Date().getTime()
    const { data, execute } = ApiUseFetch(`appointments?_t=${timestamp}`).get().json()
    await execute()
    citas.value = data.value?.data ?? []
  } catch (error) { console.error(error) } finally { cargando.value = false }
}

async function cargarVeterinarios() {
  try {
    const { data, execute } = ApiUseFetch('empleado/veterinarios').get().json()
    await execute()
    const res = data.value
    // Desempaquetado inteligente de capas de Laravel
    if (Array.isArray(res)) { veterinarios.value = res }
    else if (Array.isArray(res?.data)) { veterinarios.value = res.data }
    else if (Array.isArray(res?.data?.data)) { veterinarios.value = res.data.data }
    else { veterinarios.value = [] }
  } catch (error) { console.error(error) }
}

function prepararAprobacion(id: number) {
  citaSeleccionadaId.value = id
  mostrarModalAsignacion.value = true
}

async function confirmarCitaConDoctor() {
  if (!idVeterinarioElegido.value) return
  await cambiarEstado(citaSeleccionadaId.value!, 'confirmed', idVeterinarioElegido.value)
  mostrarModalAsignacion.value = false
  idVeterinarioElegido.value = null
}

async function cambiarEstado(citaId: number, nuevoEstado: string, vetId: number | null = null) {
  if (cambiandoEstado.value === citaId) return
  cambiandoEstado.value = citaId
  try {
    const payload: any = { status: nuevoEstado }
    if (vetId) payload.vet_id = vetId
    const { execute } = ApiUseFetch(`appointments/${citaId}`).put(payload).json()
    await execute()
    await cargarDatos()
  } catch (error) { console.error(error) } finally { cambiandoEstado.value = null }
}

/**
 * Corregido: Función para manejar el cierre y sessionStorage fuera del template
 */
function cerrarBienvenida() {
  mostrarBienvenida.value = false
  window.sessionStorage.setItem(WELCOME_KEY, 'true')
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────────

onMounted(() => {
  if (!window.sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  relojTimer = setInterval(() => { ahora.value = new Date() }, 1000)
  cargarDatos()
  cargarVeterinarios()
  notificationStore.fetchNotifications()

  if (auth.user?.id) {
    echo.private(`App.Models.User.${auth.user.id}`)
      .notification(() => { cargarDatos(); notificationStore.fetchNotifications() })
  }
})

onUnmounted(() => {
  if (relojTimer) clearInterval(relojTimer)
  echo.leave(`App.Models.User.${auth.user?.id}`)
})
</script>

<template>
  <div class="h-full bg-[#f8fafc] font-sans italic selection:bg-blue-100 pb-12">

    <transition name="fade">
      <div v-if="mostrarBienvenida" class="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[300]">
        <div class="text-center text-white relative z-10 animate-slide-up">
          <p class="text-[#3f98ff] text-[10px] uppercase tracking-[0.4em] mb-4 font-black">Veterinaria del Oriente</p>
          <h1 class="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-none">
            {{ horaActual }}, <br>
            <span class="text-[#3f98ff]">{{ auth.user?.name ? auth.user.name.split(' ')[0] : 'Recepción' }}</span>
          </h1>
          <button @click="cerrarBienvenida" class="bg-[#3f98ff] text-white font-black px-12 py-5 rounded-[2rem] hover:bg-white hover:text-[#3f98ff] transition-all duration-500 uppercase text-xs tracking-widest shadow-xl">
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-6 md:p-10 max-w-[1600px] mx-auto flex flex-col gap-8">

      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">{{ horaActual }}</h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="router.push('/recepcionista/walk-in')" class="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:border-[#3f98ff] transition-all shadow-sm">
            + Sin Cita (Walk-In)
          </button>
          <button @click="router.push('/recepcionista/agendar')" class="bg-[#3f98ff] text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/30">
            + Nueva Cita
          </button>
        </div>
      </header>

      <section class="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="(item, key) in statsData" :key="key" @click="filtroActual = item.filterKey"
             :class="['relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 bg-white',
                      filtroActual === item.filterKey ? 'border-[#3f98ff] shadow-xl scale-105 z-10' : 'border-transparent shadow-sm hover:border-slate-100']">
          <div class="flex justify-between items-start mb-3 relative z-10">
            <div :class="['w-10 h-10 rounded-[1rem] flex items-center justify-center text-lg shadow-sm border border-white/50', item.bgIcon]">{{ item.icon }}</div>
            <p :class="['text-3xl font-black tracking-tighter leading-none', item.textColor]">{{ cargando ? '-' : item.val }}</p>
          </div>
          <p class="text-slate-800 text-[10px] font-black uppercase tracking-widest">{{ item.label }}</p>
          <p class="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">{{ item.sub }}</p>
        </div>
      </section>

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div class="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 class="font-black text-slate-800 text-sm uppercase tracking-tighter">Agenda <span v-if="filtroActual" class="text-[#3f98ff]"> › {{ filtroActual }}</span></h2>
            <button v-if="filtroActual" @click="filtroActual = null" class="text-[8px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">✕ Limpiar</button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pr-2">
            <div v-if="cargando" class="py-20 text-center text-slate-300 font-black uppercase text-[10px] animate-pulse">Sincronizando...</div>
            <div v-else-if="citasFiltradas.length === 0" class="py-24 text-center text-slate-400 font-black uppercase text-[10px]">No hay citas aquí</div>

            <div v-else v-for="cita in citasFiltradas" :key="cita.id"
                 class="grid grid-cols-[70px_1fr_auto] gap-4 items-center p-4 rounded-[2rem] border border-transparent hover:bg-slate-50 group transition-all">
              <div class="text-center bg-white border border-slate-100 rounded-2xl py-3 shadow-sm group-hover:border-[#3f98ff]/30">
                <p class="text-sm font-black text-slate-800">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).time }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ formatTime(cita.time_slot?.start_time, cita.is_walk_in).period }}</p>
              </div>
              <div class="flex items-center gap-4 pl-2">
                <div class="w-12 h-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm">{{ getEspecieAvatar(cita.pet?.species) }}</div>
                <div>
                  <h3 class="text-sm font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#3f98ff]">{{ cita.pet?.name }}</h3>
                  <p class="text-[10px] font-bold text-slate-400">
                    {{ cita.client?.name }} <span v-if="cita.vet" class="text-[#3f98ff]"> · Dr. {{ cita.vet.name }}</span>
                  </p>
                  <p v-if="cita.time_slot?.date" class="text-[8px] mt-0.5 text-slate-300 uppercase font-bold">{{ cita.time_slot.date }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 pr-2 relative">
                <span :class="['px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm', estadoClase(cita.status)]">{{ estadoTexto(cita.status) }}</span>
                <div class="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button v-if="cita.status === 'pending'" @click.stop="prepararAprobacion(cita.id)" class="bg-[#3f98ff] text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase shadow-lg">Asignar Doctor</button>
                  <button v-if="cita.status === 'confirmed'" @click.stop="cambiarEstado(cita.id, 'arrived')" :disabled="cambiandoEstado === cita.id" class="bg-purple-500 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase shadow-lg">🔔 Llegó</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="flex flex-col gap-6 h-[600px]">
          <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
            <h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest mb-4">Paciente Activo</h3>
            <div v-if="pacienteActivo" class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-[#3f98ff]/10 flex items-center justify-center text-3xl">{{ getEspecieAvatar(pacienteActivo.pet?.species) }}</div>
                <div>
                  <h4 class="text-base font-black text-slate-800 uppercase leading-none">{{ pacienteActivo.pet?.name }}</h4>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ estadoTexto(pacienteActivo.status) }}</p>
                </div>
              </div>
              <button v-if="pacienteActivo.status === 'arrived'" @click="cambiarEstado(pacienteActivo.id, 'in_progress')" class="w-full bg-purple-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-purple-500/30">Pasar a Consulta</button>
              <button @click="router.push(`/recepcionista/mascotas/${pacienteActivo.pet?.id}`)" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Ver Ficha Médica</button>
            </div>
            <p v-else class="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-6">Sin pacientes activos</p>
          </section>

          <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-500" :class="notisExpandidas ? 'flex-1' : 'h-[75px]'">
            <div @click="notisExpandidas = !notisExpandidas" class="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50">
              <div class="flex items-center gap-3"><span class="p-2 bg-slate-100 rounded-xl text-lg">🔔</span><h3 class="font-black text-slate-800 text-[11px] uppercase tracking-widest">Notificaciones</h3></div>
              <span class="text-slate-400 transition-transform" :class="notisExpandidas ? 'rotate-180' : ''">▼</span>
            </div>
            <div v-show="notisExpandidas" class="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              <div v-for="n in notificationStore.notifications.slice(0, 10)" :key="n.id" class="p-4 rounded-2xl border border-slate-100 bg-white">
                <p class="text-[10px] font-black text-slate-800 uppercase mb-1">{{ n.title }}</p>
                <p class="text-[9px] font-medium text-slate-500 leading-snug">{{ n.message }}</p>
                <p class="text-[8px] font-bold text-slate-300 uppercase mt-2">{{ new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <transition name="fade">
      <div v-if="mostrarModalAsignacion" class="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-slide-up">
          <h3 class="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Asignar Doctor</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Selecciona al veterinario encargado</p>
          <div class="space-y-3 max-h-[300px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
            <div v-for="vet in veterinarios" :key="vet.id" @click="idVeterinarioElegido = vet.id"
                 :class="['p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4', idVeterinarioElegido === vet.id ? 'border-[#3f98ff] bg-blue-50 scale-[1.02]' : 'border-slate-100 hover:border-slate-200']">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">👨‍⚕️</div>
              <p class="text-xs font-black text-slate-800 uppercase leading-none">{{ vet.name }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="mostrarModalAsignacion = false" class="flex-1 text-[10px] font-black text-slate-400 uppercase">Cancelar</button>
            <button @click="confirmarCitaConDoctor" class="flex-[2] bg-[#3f98ff] text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all">Confirmar Cita</button>
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
