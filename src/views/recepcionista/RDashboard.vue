<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import echo from '@/echo'
import type { Appointment } from '@/types/appointment'

const router = useRouter()
const auth = useAuthStore()

const WELCOME_KEY = 'cvo_welcome_shown_recep'
const mostrarBienvenida = ref(false)
const cargando = ref(true)
const citas = ref<Appointment[]>([])
const ahora = ref(new Date())

let relojTimer: ReturnType<typeof setInterval> | null = null

function getHoraClase(cita: Appointment): string {
  if (cita.is_walk_in || !cita.time_slot) {
    return 'text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-100'
  }
  return 'text-[#1d6bbf] font-bold'
}

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

const hoy = computed(() => new Date().toISOString().slice(0, 10))

// citas de hoy (robusto)
const citasHoy = computed(() =>
  citas.value.filter(c => {
    const fechaCita =
      c.is_walk_in
        ? c.created_at
        : c.time_slot?.date ?? c.created_at

    if (!fechaCita) return false

    return fechaCita.slice(0, 10) === hoy.value
  })
)

const statsData = computed(() => [
  {
    label: 'Citas de Hoy',
    val: citasHoy.value.length,
    color: 'bg-[#1d6bbf]'
  },
  {
    label: 'Walk-ins Hoy',
    val: citasHoy.value.filter(c =>
      c.is_walk_in && c.status !== 'cancelled'
    ).length,
    color: 'bg-purple-500'
  },
  {
    label: 'Pendientes (Global)',
    val: citas.value.filter(c => c.status === 'pending').length,
    color: 'bg-amber-500'
  },
])

const horaActual = computed(() => {
  const h = ahora.value.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const fechaHoyCorta = computed(() =>
  ahora.value.toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })
)

const fechaHoyLarga = computed(() =>
  ahora.value.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric' })
)

const horaEnVivo = computed(() =>
  ahora.value.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
)

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

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true

  relojTimer = setInterval(() => {
    ahora.value = new Date()
  }, 1000)

  cargarDatos()

  // ESCUCHAR NOTIFICACIONES
  if (auth.user?.id) {
    echo.private(`App.Models.User.${auth.user.id}`)
      .notification((notification: any) => {
        console.log(' Notificación recibida:', notification)

        //  IMPORTANTE: SOLO CUANDO SEA DE CITAS
        if (
          notification.type.includes('Appointment')
        ) {
          console.log('🔄 Actualizando dashboard...')
          cargarDatos()
        }
      })
  }
})

onUnmounted(() => {
  if (relojTimer) clearInterval(relojTimer)
  echo.leave(`App.Models.User.${auth.user?.id}`)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <!-- Bienvenida -->
    <transition name="fade">
      <div v-if="mostrarBienvenida" class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50">
        <div class="text-center text-white">
          <p class="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-3 font-bold">Veterinaria del Oriente</p>
          <h1 class="text-4xl font-black mb-8 tracking-tight">{{ horaActual }}, {{ auth.user?.name }}</h1>
          <button
            @click="entrarAlPanel"
            class="bg-white text-[#1d6bbf] font-extrabold px-12 py-4 rounded-2xl hover:shadow-2xl transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-8 max-w-[1600px] mx-auto space-y-8">

       <!-- Header -->
      <header>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">
          {{ horaActual }}, {{ auth.user?.name }}
        </h1>
        <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Panel de Recepción ·
          {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
        </p>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(item, key) in statsData"
          :key="key"
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
        >
          <div :class="`absolute top-0 left-0 w-1 h-full ${item.color}`"></div>
          <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
            {{ item.label }}
          </p>
          <p class="text-3xl font-black text-slate-800 tracking-tighter">
            {{ cargando ? '...' : item.val }}
          </p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <!-- Tabla de citas de hoy -->
        <section class="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 class="font-black text-slate-800 text-xs uppercase tracking-widest">Flujo de Pacientes</h2>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </p>
            </div>
            <button
              @click="router.push('/recepcionista/citas')"
              class="text-[9px] font-black text-[#1d6bbf] hover:underline tracking-widest uppercase"
            >
              Ver todo
            </button>
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

                <!-- Cargando -->
                <tr v-if="cargando">
                  <td colspan="5" class="px-8 py-20 text-center text-slate-300 text-[10px] font-black uppercase animate-pulse">
                    Sincronizando...
                  </td>
                </tr>

                <!-- Sin citas hoy -->
                <tr v-else-if="citasHoy.length === 0">
                  <td colspan="5" class="px-8 py-24 text-center">
                    <p class="text-2xl mb-2">📅</p>
                    <p class="text-slate-300 font-black uppercase text-[10px] tracking-[0.2em]">No hay citas para hoy</p>
                  </td>
                </tr>

                <!-- Filas -->
                <tr
                  v-else
                  v-for="cita in citasHoy.slice(0, 10)"
                  :key="cita.id"
                  class="group hover:bg-slate-50/50 transition-all"
                >
                  <td class="px-8 py-5 text-xs">
                    <span :class="getHoraClase(cita)">
                      {{ cita.is_walk_in ? 'WALK-IN' : (cita.time_slot?.start_time ?? '—') }}
                    </span>
                  </td>

                  <td class="px-8 py-5">
                    <div class="text-sm font-black text-slate-800 uppercase leading-none mb-1">
                      {{ cita.pet?.name ?? '—' }}
                    </div>
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      {{ cita.service?.name ?? 'General' }}
                    </div>
                  </td>

                  <td class="px-8 py-5">
                    <div class="text-sm font-bold text-slate-600 leading-none mb-1">
                      {{ cita.client?.name ?? '—' }}
                    </div>
                    <div class="text-[9px] text-slate-400 tracking-tighter font-medium">
                      {{ cita.client?.phone ?? '' }}
                    </div>
                  </td>

                  <td class="px-8 py-5">
                    <span
                      class="px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider"
                      :class="estadoClase(cita.status)"
                    >
                      {{ cita.status }}
                    </span>
                  </td>

                  <td class="px-8 py-5 text-center">
                    <div class="flex items-center justify-center gap-4">
                      <button
                        v-if="cita.pet?.id"
                        @click="router.push(`/recepcionista/mascotas/${cita.pet.id}`)"
                        class="inline-flex items-center gap-1.5 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        <span class="text-[9px] font-black uppercase tracking-widest">Ficha</span>
                      </button>

                      <button
                        v-if="cita.pet?.id"
                        @click="router.push(`/recepcionista/mascotas/${cita.pet.id}/historial`)"
                        class="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#1d6bbf] transition-colors"
                      >
                        <span class="text-[9px] font-black uppercase tracking-widest">Historial</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                          <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </button>

                      <span v-if="!cita.pet?.id" class="text-[9px] font-black text-slate-200 uppercase tracking-widest">—</span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="space-y-4">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acciones Rápidas</p>
            <div class="space-y-2">

              <button
                @click="router.push('/recepcionista/agendar')"
                class="w-full text-left p-5 rounded-xl bg-[#1d6bbf] hover:bg-[#16569a] transition-all"
              >
                <p class="text-xs font-black text-white uppercase tracking-widest">Nueva Cita</p>
                <p class="text-[9px] text-blue-200 font-bold uppercase tracking-tight">Agendar consulta</p>
              </button>

              <button
                @click="router.push('/recepcionista/walk-in')"
                class="w-full text-left p-5 rounded-xl bg-slate-50 border border-transparent hover:border-purple-200 hover:bg-purple-50 transition-all group"
              >
                <p class="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-purple-700">Atención Walk-in</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tight group-hover:text-purple-400">Sin cita previa</p>
              </button>

              <button
                @click="router.push('/recepcionista/clientes')"
                class="w-full text-left p-5 rounded-xl bg-slate-50 border border-transparent hover:border-[#1d6bbf]/20 hover:bg-white transition-all group"
              >
                <p class="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-[#1d6bbf]">Clientes</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Listado general</p>
              </button>

              <button
                @click="router.push('/recepcionista/clientes')"
                class="w-full text-left p-5 rounded-xl bg-slate-50 border border-transparent hover:border-[#1d6bbf]/20 hover:bg-white transition-all group"
              >
                <p class="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-[#1d6bbf]">Registrar Paciente</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Alta de nuevo propietario</p>
              </button>

            </div>
          </div>

          <div class="p-6 rounded-3xl border border-[#1d6bbf]/20 bg-gradient-to-br from-[#1d6bbf]/10 via-white to-slate-50 shadow-sm">
            <p class="text-[10px] font-black text-[#1d6bbf] uppercase tracking-widest mb-1">Hoy</p>
            <p class="text-lg font-black text-slate-800 leading-tight">
              {{ fechaHoyCorta }}
            </p>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">
              {{ fechaHoyLarga }}
            </p>
            <p class="mt-3 inline-flex items-center rounded-full bg-[#1d6bbf]/10 px-3 py-1 text-[10px] font-black tracking-wider text-[#1d6bbf]">
              {{ horaEnVivo }}
            </p>
          </div>
        </aside>

      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
main {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
