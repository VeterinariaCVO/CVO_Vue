<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const router = useRouter()
const auth = useAuthStore()

const WELCOME_KEY = 'cvo_welcome_shown_recep'
const mostrarBienvenida = ref(false)
const cargando = ref(true)

// Stats
const totalCitas = ref(0)
const citasPendientes = ref(0)
const citasConfirmadas = ref(0)
const citasHoy = ref(0)
const totalClientes = ref(0)
const totalWalkins = ref(0)

// Listas
const citasRecientes = ref<any[]>([])

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

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
  return new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const horaActual = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

async function cargarDatos() {
  cargando.value = true

  const { data: dataCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
  await execCitas()
  const todas: any[] = dataCitas.value?.data ?? []

  totalCitas.value = todas.length
  citasPendientes.value = todas.filter((c) => c.status === 'pending').length
  citasConfirmadas.value = todas.filter((c) => c.status === 'confirmed').length

  const hoy = new Date().toISOString().slice(0, 10)
  citasHoy.value = todas.filter((c) => {
    const fecha = c.time_slot?.working_day?.date ?? c.working_day?.date ?? ''
    return fecha === hoy
  }).length

  // Walkins: citas en curso sin time_slot (o con is_walk_in flag)
  totalWalkins.value = todas.filter((c) => c.status === 'in_progress' && !c.time_slot_id).length

  citasRecientes.value = [...todas]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const { data: dataClientes, execute: execClientes } = ApiUseFetch('admin/users').get().json()
  await execClientes()
  const usuarios: any[] = dataClientes.value?.data ?? []
  totalClientes.value = usuarios.filter((u) => u.role_id === 3).length

  cargando.value = false
}

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  cargarDatos()
})
</script>

<template>
  <div>
    <!-- Splash de bienvenida -->
    <transition name="fade">
      <div
        v-if="mostrarBienvenida"
        class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50"
      >
        <div class="flex flex-col items-center gap-5 text-center px-8">
          <div class="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center">
            <svg viewBox="0 0 60 60" fill="none" class="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 38c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <circle cx="30" cy="22" r="5" fill="white"/>
              <path d="M16 30c1.5-3.5 3.5-5 5-5M44 30c-1.5-3.5-3.5-5-5-5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="text-white/50 text-xs uppercase tracking-widest mb-2">Sistema CVO</p>
            <h1 class="text-3xl font-semibold text-white m-0">{{ horaActual }}, {{ auth.user?.name }}</h1>
            <p class="text-white/50 text-sm mt-1">Panel de Recepción</p>
          </div>
          <button
            @click="entrarAlPanel"
            class="mt-2 bg-white text-[#1d6bbf] font-semibold text-sm px-7 py-2.5 rounded-lg border-none cursor-pointer hover:bg-blue-50 transition-colors"
          >
            Entrar al panel →
          </button>
        </div>
      </div>
    </transition>

    <div class="p-8 space-y-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-slate-800 m-0">{{ horaActual }}, {{ auth.user?.name }}</h1>
          <p class="text-sm text-slate-400 mt-0.5 mb-0">Panel de recepción · {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="router.push('/recepcionista/agendar')"
            class="flex items-center gap-2 bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Nueva cita
          </button>
          <button
            @click="router.push('/recepcionista/walk-in')"
            class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Walk-in
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Citas hoy -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Citas hoy</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-[#1d6bbf]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div>
            <span class="text-3xl font-bold text-slate-800">{{ cargando ? '—' : citasHoy }}</span>
            <p class="text-xs text-slate-400 mt-0.5 m-0">programadas para hoy</p>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Pendientes</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div>
            <span class="text-3xl font-bold text-slate-800">{{ cargando ? '—' : citasPendientes }}</span>
            <p class="text-xs text-slate-400 mt-0.5 m-0">por confirmar</p>
          </div>
        </div>

        <!-- Confirmadas -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Confirmadas</span>
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
          </div>
          <div>
            <span class="text-3xl font-bold text-slate-800">{{ cargando ? '—' : citasConfirmadas }}</span>
            <p class="text-xs text-slate-400 mt-0.5 m-0">listas para atender</p>
          </div>
        </div>

        <!-- Clientes registrados -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Clientes</span>
            <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div>
            <span class="text-3xl font-bold text-slate-800">{{ cargando ? '—' : totalClientes }}</span>
            <p class="text-xs text-slate-400 mt-0.5 m-0">registrados en el sistema</p>
          </div>
        </div>

      </div>

      <!-- Accesos rápidos + tabla de citas recientes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Accesos rápidos -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <h2 class="text-sm font-semibold text-slate-700 m-0">Acciones rápidas</h2>

          <button
            @click="router.push('/recepcionista/citas')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-[#1d6bbf] flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Ver todas las citas</p>
              <p class="text-xs text-slate-400 m-0">Gestionar, confirmar, cancelar</p>
            </div>
          </button>

          <button
            @click="router.push('/recepcionista/agendar')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Nueva cita</p>
              <p class="text-xs text-slate-400 m-0">Agendar para un cliente</p>
            </div>
          </button>

          <button
            @click="router.push('/recepcionista/walk-in')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Registrar Walk-in</p>
              <p class="text-xs text-slate-400 m-0">Atención sin cita previa</p>
            </div>
          </button>

          <button
            @click="router.push('/empleado/registrar-cliente')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Registrar cliente</p>
              <p class="text-xs text-slate-400 m-0">Agregar nuevo propietario</p>
            </div>
          </button>

          <button
            @click="router.push('/recepcionista/clientes')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Gestionar clientes</p>
              <p class="text-xs text-slate-400 m-0">Ver, editar y eliminar</p>
            </div>
          </button>

          <button
            @click="router.push('/recepcionista/mascotas')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="9" cy="4" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="4" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="5" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="19" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 m-0">Mascotas</p>
              <p class="text-xs text-slate-400 m-0">Consultar y registrar mascotas</p>
            </div>
          </button>
        </div>

        <!-- Citas recientes -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 class="text-sm font-semibold text-slate-700 m-0">Citas recientes</h2>
            <button
              @click="router.push('/recepcionista/citas')"
              class="text-xs text-[#1d6bbf] hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Ver todas →
            </button>
          </div>

          <div v-if="cargando" class="flex-1 flex items-center justify-center py-12">
            <p class="text-sm text-slate-400">Cargando...</p>
          </div>

          <div v-else-if="citasRecientes.length === 0" class="flex-1 flex items-center justify-center py-12">
            <p class="text-sm text-slate-400">No hay citas registradas.</p>
          </div>

          <div v-else class="flex-1 overflow-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-100">
                  <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota</th>
                  <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Servicio</th>
                  <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
                  <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cita in citasRecientes"
                  :key="cita.id"
                  class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
                >
                  <td class="px-5 py-3 text-sm text-slate-800 font-medium">
                    {{ cita.pet?.name ?? '—' }}
                  </td>
                  <td class="px-5 py-3 text-sm text-slate-500">
                    {{ cita.service?.name ?? '—' }}
                  </td>
                  <td class="px-5 py-3 text-sm text-slate-500">
                    {{ formatearFecha(cita.time_slot?.working_day?.date ?? cita.working_day?.date ?? '') }}
                  </td>
                  <td class="px-5 py-3">
                    <span
                      class="text-xs px-2 py-0.5 rounded border font-medium"
                      :class="estadoClase(cita.status)"
                    >
                      {{ estadoLabel(cita.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
