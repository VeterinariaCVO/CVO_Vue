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

// Lógica de colores: Morado para Walk-ins usando tu booleano is_walk_in
function getHoraClase(cita: Appointment): string {
  if (cita.is_walk_in || !cita.time_slot) {
    return 'text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-100'
  }
  return 'text-blue-600 font-semibold'
}

// Mapeo de estados basado en tu string de status
function estadoClase(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[status] ?? 'bg-slate-50 text-slate-500 border-slate-200'
}

const stats = computed(() => {
  const hoy = new Date().toISOString().slice(0, 10)
  // Usamos cita.time_slot.date de tu interfaz
  const citasHoyLista = citas.value.filter(c => c.time_slot?.date === hoy)

  return {
    hoy: citasHoyLista.length,
    espera: citasHoyLista.filter(c => c.status === 'confirmed' || c.status === 'in_progress').length,
    walkins: citas.value.filter(c => c.is_walk_in && c.status !== 'cancelled').length,
    pendientes: citas.value.filter(c => c.status === 'pending').length
  }
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
    // Casteamos los datos a tu interfaz específica
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
          <p class="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-3">Veterinaria del Oriente</p>
          <h1 class="text-4xl font-black mb-8 tracking-tight">{{ horaActual }}, {{ auth.user?.name }}</h1>
          <button @click="entrarAlPanel" class="bg-white text-[#1d6bbf] font-extrabold px-12 py-4 rounded-2xl hover:shadow-2xl transition-all active:scale-95">
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-8 max-w-[1600px] mx-auto space-y-8">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">{{ horaActual }}, {{ auth.user?.name }}</h1>
          <p class="text-slate-400 text-sm font-semibold uppercase tracking-widest">
            Recepcionista · {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>
        <div class="flex gap-4">
          <button @click="router.push('/recepcionista/agendar')" class="bg-blue-600 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Nueva Cita
          </button>
          <button @click="router.push('/recepcionista/walk-in')" class="bg-purple-600 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
            Atención Walk-in
          </button>
        </div>
      </header>

      <section class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(val, label) in { 'Citas de Hoy': stats.hoy, 'En Clínica': stats.espera, 'Total Walk-ins': stats.walkins, 'Pendientes': stats.pendientes }" :key="label" class="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{{ label }}</p>
          <p class="text-4xl font-black text-slate-800 tracking-tighter">{{ cargando ? '...' : val }}</p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <section class="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="font-black text-slate-800 uppercase tracking-tight">Flujo de Pacientes</h2>
            <button @click="router.push('/recepcionista/citas')" class="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors">VER TODO</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr class="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                  <th class="px-8 py-5">Horario / Tipo</th>
                  <th class="px-8 py-5">Mascota</th>
                  <th class="px-8 py-5">Propietario</th>
                  <th class="px-8 py-5">Estado</th>
                  <th class="px-8 py-5 text-center">Historial</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="cargando">
                  <td colspan="5" class="px-8 py-10 text-center text-slate-400 animate-pulse font-bold uppercase text-xs">Cargando pacientes...</td>
                </tr>
                <tr v-else-if="citas.length === 0">
                  <td colspan="5" class="px-8 py-10 text-center text-slate-400 italic">No hay citas registradas para hoy</td>
                </tr>
                <tr v-for="cita in citas.slice(0, 10)" :key="cita.id" class="group hover:bg-blue-50/20 transition-all">
                  <td class="px-8 py-5">
                    <span :class="getHoraClase(cita)">
                      {{ cita.time_slot?.start_time ?? 'SIN HORA' }}
                    </span>
                  </td>
                  <td class="px-8 py-5">
                    <div class="text-sm font-black text-slate-800">{{ cita.pet?.name || 'N/A' }}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ cita.service?.name ?? 'General' }}</div>
                  </td>
                  <td class="px-8 py-5">
                    <div class="text-sm font-bold text-slate-600">{{ cita.client?.name ?? 'Desconocido' }}</div>
                    <div class="text-[10px] text-slate-400 italic">{{ cita.client?.phone ?? 'Sin teléfono' }}</div>
                  </td>
                  <td class="px-8 py-5">
                    <span class="px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-wider" :class="estadoClase(cita.status)">
                      {{ cita.status }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-center">
                    <button v-if="cita.pet?.id" @click="router.push(`/recepcionista/mascotas/${cita.pet.id}/historial`)" class="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-width="2.5"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2.5"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="space-y-6">
          <div class="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Administración</h3>
            <div class="space-y-3">
              <button @click="router.push('/recepcionista/clientes')" class="w-full text-left p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                <p class="text-sm font-black text-slate-700 group-hover:text-blue-600">CLIENTES</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Gestión de base de datos</p>
              </button>
              <button @click="router.push('/recepcionista/notificaciones')" class="w-full text-left p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                <p class="text-sm font-black text-slate-700 group-hover:text-blue-600">AVISOS</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Notificaciones activas</p>
              </button>
            </div>
          </div>
          </aside>
      </div>
    </main>
  </div>
</template>
