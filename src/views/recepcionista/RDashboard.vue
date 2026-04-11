<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { Appointment } from '@/types/appointment'

const router = useRouter()
const auth = useAuthStore()

const WELCOME_KEY = 'cvo_welcome_shown_recep'
const mostrarBienvenida = ref<boolean>(false)
const cargando = ref<boolean>(true)
const citas = ref<Appointment[]>([])

// Lógica de colores para Horario
function getHoraClase(cita: Appointment): string {
  if (cita.is_walk_in || !cita.time_slot) {
    return 'text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-100'
  }
  return 'text-blue-600 font-bold'
}

// Mapeo de estados (Minimalista)
function estadoClase(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
  }
  return map[status] ?? 'bg-slate-50 text-slate-500 border-slate-200'
}

// Estadísticas Computadas con Acento de Color Lateral
const statsData = computed(() => {
  const hoy = new Date().toISOString().slice(0, 10)
  const citasHoyLista = citas.value.filter(c => c.time_slot?.date === hoy)

  return [
    { label: 'Citas de Hoy', val: citasHoyLista.length, color: 'bg-blue-500' },
    { label: 'En Clínica', val: citasHoyLista.filter(c => c.status === 'confirmed' || c.status === 'in_progress').length, color: 'bg-emerald-500' },
    { label: 'Total Walk-ins', val: citas.value.filter(c => c.is_walk_in && c.status !== 'cancelled').length, color: 'bg-purple-500' },
    { label: 'Pendientes', val: citas.value.filter(c => c.status === 'pending').length, color: 'bg-amber-500' }
  ]
})

const horaActual = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

async function cargarDatos() {
  cargando.value = true
  try {
    const { data } = await ApiUseFetch('appointments').get().json()
    citas.value = data.value?.data as Appointment[] ?? []
  } catch (error) {
    console.error("Error en CVO Dashboard:", error)
  } finally {
    cargando.value = false
  }
}

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  cargarDatos()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <transition name="fade">
      <div v-if="mostrarBienvenida" class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50">
        <div class="text-center text-white">
          <p class="text-white/40 text-[10px] uppercase font-bold tracking-[0.4em] mb-4">Veterinaria del Oriente</p>
          <h1 class="text-5xl font-light mb-10 tracking-tight">{{ horaActual }}, <span class="font-black">{{ auth.user?.name }}</span></h1>
          <button @click="entrarAlPanel" class="border border-white/30 text-white hover:bg-white hover:text-[#1d6bbf] font-bold px-16 py-4 rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest">
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-8 max-w-[1600px] mx-auto space-y-8">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">{{ horaActual }}, {{ auth.user?.name }}</h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Recepción · {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="router.push('/recepcionista/agendar')" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
            Nueva Cita
          </button>
          <button @click="router.push('/recepcionista/walk-in')" class="bg-white text-slate-900 border border-slate-200 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            Atención Walk-in
          </button>
        </div>
      </header>

      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="(item, key) in statsData" :key="key" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div :class="`absolute top-0 left-0 w-1 h-full ${item.color}`"></div>
          <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{{ item.label }}</p>
          <p class="text-3xl font-black text-slate-800 tracking-tighter">{{ cargando ? '...' : item.val }}</p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <section class="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h2 class="font-black text-slate-800 text-xs uppercase tracking-widest">Flujo de Pacientes</h2>
            <button @click="router.push('/recepcionista/citas')" class="text-[9px] font-black text-blue-600 hover:underline tracking-widest uppercase">Ver todo</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr class="text-slate-400 text-[9px] uppercase font-black tracking-widest">
                  <th class="px-8 py-4 border-b">Horario</th>
                  <th class="px-8 py-4 border-b">Paciente</th>
                  <th class="px-8 py-4 border-b">Propietario</th>
                  <th class="px-8 py-4 border-b">Estado</th>
                  <th class="px-8 py-4 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="cargando">
                  <td colspan="5" class="px-8 py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando...</td>
                </tr>
                <tr v-else-if="citas.length === 0">
                  <td colspan="5" class="px-8 py-24 text-center">
                    <p class="text-slate-300 font-black uppercase text-[10px] tracking-[0.2em]">No hay citas registradas para hoy</p>
                  </td>
                </tr>
                <tr v-for="cita in citas.slice(0, 10)" :key="cita.id" v-else class="group hover:bg-slate-50/50 transition-all">
                  <td class="px-8 py-5 text-xs">
                    <span :class="getHoraClase(cita)" class="uppercase tracking-tighter">
                      {{ cita.time_slot?.start_time ?? 'Sin Hora' }}
                    </span>
                  </td>
                  <td class="px-8 py-5">
                    <div class="text-sm font-black text-slate-800 uppercase leading-none mb-1">{{ cita.pet?.name }}</div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{{ cita.service?.name ?? 'General' }}</div>
                  </td>
                  <td class="px-8 py-5">
                    <div class="text-sm font-bold text-slate-600 leading-none mb-1">{{ cita.client?.name }}</div>
                    <div class="text-[9px] text-slate-400 font-medium tracking-tight">{{ cita.client?.phone }}</div>
                  </td>
                  <td class="px-8 py-5">
                    <span class="px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider" :class="estadoClase(cita.status)">
                      {{ cita.status }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-center">
                    <button @click="router.push(`/recepcionista/mascotas/${cita.pet?.id}/historial`)"
                            class="inline-flex items-center gap-2 text-slate-300 hover:text-blue-600 transition-colors">
                      <span class="text-[9px] font-black uppercase tracking-widest">Historial</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="space-y-4">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Administración</p>
            <div class="space-y-2">
              <button @click="router.push('/recepcionista/clientes')" class="w-full text-left p-4 rounded-xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                <p class="text-xs font-black text-slate-700 uppercase tracking-widest">Base de Datos</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase">Gestión de Clientes</p>
              </button>
              <button @click="router.push('/recepcionista/registrar-cliente')" class="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <p class="text-xs font-black text-slate-700 uppercase tracking-widest">Nuevo Registro</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase">Alta de Pacientes</p>
              </button>
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
            <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Información</p>
            <p class="text-[11px] leading-relaxed font-medium text-white/80">
              Para ver el expediente médico, utiliza el enlace lateral en la tabla de pacientes.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.98); }

main { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
</style>
