<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const router = useRouter()
const auth = useAuthStore()

const WELCOME_KEY = 'cvo_welcome_shown_vet'
const SERVICIOS_SIN_EXPEDIENTE = ['Baño y estética', 'Desparasitación']

const mostrarBienvenida = ref(false)
const cargando = ref(true)
const appointments = ref<any[]>([])
const filterStatus = ref('all')
const filterPeriodo = ref('hoy')
const showModal = ref(false)
const showPerfil = ref(false)
const showNotis = ref(false)
const selectedApp = ref<any>(null)
const ahora = ref(new Date())
const notificaciones = ref<any[]>([])
let relojTimer: ReturnType<typeof setInterval> | null = null

const perfilForm = ref({
  name: '',
  phone: '',
  address: '',
  password: '',
})

const form = ref({
  appointment_id: null as number | null,
  weight: '', temperature: '', symptoms: '',
  diagnosis: '', treatment: '', prescriptions: '', observations: '',
})

const horaActual = computed(() => {
  const h = ahora.value.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const horaEnVivo = computed(() =>
  ahora.value.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
)

const hoy = computed(() => new Date().toISOString().slice(0, 10))

const unreadCount = computed(() => notificaciones.value.filter(n => !n.read).length)

const appointmentsFiltradosPeriodo = computed(() => {
  if (filterPeriodo.value === 'hoy') {
    return appointments.value.filter(a => {
      if (a.is_walk_in) return a.created_at?.slice(0, 10) === hoy.value
      return a.time_slot?.date === hoy.value
    })
  }
  if (filterPeriodo.value === 'semana') {
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - inicio.getDay() + 1)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    return appointments.value.filter(a => {
      const fecha = new Date(a.time_slot?.date ?? a.created_at?.slice(0, 10))
      return fecha >= inicio && fecha <= fin
    })
  }
  return appointments.value
})

const filtered = computed(() => {
  if (filterStatus.value === 'all') return appointmentsFiltradosPeriodo.value
  return appointmentsFiltradosPeriodo.value.filter(a => a.status === filterStatus.value)
})

const statsData = computed(() => [
  { label: 'Total citas',  val: appointmentsFiltradosPeriodo.value.length,                                                color: '#185FA5' },
  { label: 'Confirmadas',  val: appointmentsFiltradosPeriodo.value.filter(a => a.status === 'confirmed').length,          color: '#1D9E75' },
  { label: 'En progreso',  val: appointmentsFiltradosPeriodo.value.filter(a => a.status === 'in_progress').length,        color: '#BA7517' },
  { label: 'Completadas',  val: appointmentsFiltradosPeriodo.value.filter(a => a.status === 'completed').length,          color: '#639922' },
])

const filters = [
  { value: 'all',         label: 'Todas' },
  { value: 'confirmed',   label: 'Confirmadas' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed',   label: 'Completadas' },
]

const periodos = [
  { value: 'hoy',    label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'todas',  label: 'Todas' },
]

function requiereExpediente(apt: any): boolean {
  return !SERVICIOS_SIN_EXPEDIENTE.includes(apt.service?.name)
}

function estadoBadge(status: string) {
  const map: Record<string, string> = {
    confirmed:   'background:#E6F1FB;color:#0C447C;border:0.5px solid #B5D4F4',
    in_progress: 'background:#FAEEDA;color:#633806;border:0.5px solid #FAC775',
    completed:   'background:#EAF3DE;color:#27500A;border:0.5px solid #C0DD97',
    cancelled:   'background:#FCEBEB;color:#501313;border:0.5px solid #F7C1C1',
  }
  return map[status] ?? 'background:#F1EFE8;color:#5F5E5A'
}

function estadoLabel(status: string) {
  const map: Record<string, string> = {
    confirmed:   'Confirmada',
    in_progress: 'En progreso',
    completed:   'Completada',
    cancelled:   'Cancelada',
  }
  return map[status] ?? status
}

async function cargarDatos() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('/appointments').get().json()
  await execute()
  appointments.value = data.value?.data ?? []
  cargando.value = false
}

async function cargarNotificaciones() {
  const { data, execute } = ApiUseFetch('/notifications').get().json()
  await execute()
  notificaciones.value = data.value?.data?.notifications ?? []
}

async function marcarTodasLeidas() {
  const { execute } = ApiUseFetch('/notifications/read-all').patch().json()
  await execute()
  notificaciones.value.forEach(n => n.read = true)
}

function openModal(apt: any) {
  selectedApp.value = apt
  form.value = {
    appointment_id: apt.id,
    weight: '', temperature: '', symptoms: '',
    diagnosis: '', treatment: '', prescriptions: '', observations: '',
  }
  showModal.value = true
}

async function saveRecord() {
  if (!form.value.diagnosis.trim()) return

  const body: Record<string, any> = {
    appointment_id: form.value.appointment_id,
    diagnosis: form.value.diagnosis,
  }
  if (form.value.weight)        body.weight        = form.value.weight
  if (form.value.temperature)   body.temperature   = form.value.temperature
  if (form.value.symptoms)      body.symptoms      = form.value.symptoms
  if (form.value.treatment)     body.treatment     = form.value.treatment
  if (form.value.prescriptions) body.prescriptions = form.value.prescriptions
  if (form.value.observations)  body.observations  = form.value.observations

  const { execute } = ApiUseFetch('/medical-records').post(body).json()
  await execute()
  showModal.value = false
  cargarDatos()
}

async function finalizarCita(id: number) {
  if (!confirm('¿Finalizar esta atención?')) return
  const apt = appointments.value.find(a => a.id === id)
  const { execute } = ApiUseFetch(`/appointments/${id}`).put({
    time_slot_id: apt?.time_slot?.id,
    status: 'completed',
  }).json()
  await execute()
  cargarDatos()
}

async function guardarPerfil() {
  const datos: any = {
    name: perfilForm.value.name,
    phone: perfilForm.value.phone,
    address: perfilForm.value.address,
  }
  if (perfilForm.value.password) datos.password = perfilForm.value.password

  const { execute } = ApiUseFetch(`/admin/users/${auth.user?.id}`).put(datos).json()
  await execute()
  showPerfil.value = false
}

function abrirPerfil() {
  perfilForm.value.name     = auth.user?.name    ?? ''
  perfilForm.value.phone    = auth.user?.phone   ?? ''
  perfilForm.value.address  = auth.user?.address ?? ''
  perfilForm.value.password = ''
  showPerfil.value = true
}

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  relojTimer = setInterval(() => { ahora.value = new Date() }, 1000)
  cargarDatos()
  cargarNotificaciones()
})

onUnmounted(() => { if (relojTimer) clearInterval(relojTimer) })

defineOptions({ name: 'VetAgenda' })
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <!-- Bienvenida -->
    <transition name="fade">
      <div v-if="mostrarBienvenida"
           class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50">
        <div class="text-center text-white">
          <p class="text-white/50 text-xs uppercase tracking-[0.3em] mb-3 font-bold">
            Veterinaria del Oriente
          </p>
          <h1 class="text-5xl font-black mb-8 tracking-tight">
            {{ horaActual }}, Dr. {{ auth.user?.name }}
          </h1>
          <button @click="entrarAlPanel"
                  class="bg-white text-[#1d6bbf] font-extrabold px-12 py-4 rounded-2xl hover:shadow-2xl transition-all active:scale-95 uppercase text-sm tracking-widest">
            Comenzar Jornada
          </button>
        </div>
      </div>
    </transition>

    <main class="p-8 max-w-[1600px] mx-auto space-y-8">

      <!-- Header con campana y perfil -->
      <header class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">
            {{ horaActual }}, Dr. {{ auth.user?.name }}
          </h1>
          <p class="text-slate-500 text-sm font-bold uppercase tracking-[0.15em] mt-1">
            Panel Veterinario · {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
        </div>

        <!-- Campana + Perfil -->
        <div class="flex items-center gap-3">

          <!-- Campana -->
          <div class="relative">
            <button @click="showNotis = !showNotis"
                    class="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span v-if="unreadCount > 0"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {{ unreadCount }}
              </span>
            </button>

            <!-- Dropdown notificaciones -->
            <div v-if="showNotis"
                 class="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p class="text-sm font-black text-slate-800 uppercase tracking-widest">Notificaciones</p>
                <button @click="marcarTodasLeidas"
                        class="text-[10px] font-bold text-[#1d6bbf] hover:underline uppercase tracking-widest">
                  Marcar leídas
                </button>
              </div>
              <div class="max-h-72 overflow-y-auto">
                <div v-if="notificaciones.length === 0" class="px-4 py-8 text-center text-slate-400 text-sm">
                  Sin notificaciones
                </div>
                <div v-for="n in notificaciones" :key="n.id"
                     class="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                     :class="!n.read ? 'bg-blue-50/50' : ''">
                  <div class="flex items-start gap-3">
                    <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                         :class="!n.read ? 'bg-[#1d6bbf]' : 'bg-slate-300'"></div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ n.title }}</p>
                      <p class="text-xs text-slate-500 mt-0.5">{{ n.message }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón perfil -->
          <button @click="abrirPerfil"
                  class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <div class="w-7 h-7 rounded-full bg-[#1d6bbf] flex items-center justify-center text-white text-xs font-black">
              {{ auth.user?.name?.charAt(0) ?? 'V' }}
            </div>
            <span class="text-sm font-bold text-slate-700">Mi perfil</span>
          </button>

        </div>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="(item, i) in statsData" :key="i"
             class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full" :style="`background:${item.color}`"></div>
          <p class="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
            {{ item.label }}
          </p>
          <p class="text-4xl font-black text-slate-800 tracking-tighter">
            {{ cargando ? '...' : item.val }}
          </p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <!-- Tabla -->
        <section class="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <!-- Filtros periodo + estado -->
          <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/30 space-y-3">

            <!-- Filtro periodo -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">Período:</span>
              <button v-for="p in periodos" :key="p.value" @click="filterPeriodo = p.value"
                      class="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all"
                      :class="filterPeriodo === p.value
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'">
                {{ p.label }}
              </button>
            </div>

            <!-- Filtro estado -->
            <div class="flex flex-wrap gap-2 items-center justify-between">
              <div class="flex gap-2 flex-wrap">
                <button v-for="f in filters" :key="f.value" @click="filterStatus = f.value"
                        class="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                        :class="filterStatus === f.value
                          ? 'bg-[#1d6bbf] text-white'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-[#1d6bbf]/30'">
                  {{ f.label }}
                  <span class="ml-1 opacity-70">
                    {{ f.value === 'all'
                    ? appointmentsFiltradosPeriodo.length
                    : appointmentsFiltradosPeriodo.filter(a => a.status === f.value).length }}
                  </span>
                </button>
              </div>
              <span class="text-xs font-black text-slate-400 uppercase tracking-widest">
                {{ horaEnVivo }}
              </span>
            </div>

          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead>
              <tr class="text-slate-500 text-xs uppercase font-black tracking-widest">
                <th class="px-8 py-4 border-b border-slate-100">Horario</th>
                <th class="px-8 py-4 border-b border-slate-100">Paciente</th>
                <th class="px-8 py-4 border-b border-slate-100">Propietario</th>
                <th class="px-8 py-4 border-b border-slate-100">Estado</th>
                <th class="px-8 py-4 border-b border-slate-100 text-center">Acción</th>
              </tr>
              </thead>
              <tbody>

              <tr v-if="cargando">
                <td colspan="5" class="px-8 py-20 text-center text-slate-400 text-sm font-black uppercase animate-pulse">
                  Sincronizando...
                </td>
              </tr>

              <tr v-else-if="filtered.length === 0">
                <td colspan="5" class="px-8 py-24 text-center">
                  <p class="text-3xl mb-3">📅</p>
                  <p class="text-slate-400 font-black uppercase text-sm tracking-[0.2em]">
                    Sin citas en esta categoría
                  </p>
                </td>
              </tr>

              <tr v-else v-for="apt in filtered" :key="apt.id"
                  class="border-b border-slate-100 hover:bg-slate-50/50 transition-all">

                <!-- Horario -->
                <td class="px-8 py-5">
                  <span v-if="apt.is_walk_in"
                        class="text-purple-700 font-black bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 text-xs uppercase tracking-wider">
                    Walk-in
                  </span>
                  <span v-else class="text-[#1d6bbf] font-bold text-sm">
                    {{ apt.time_slot?.start_time?.slice(0, 5) ?? '—' }}
                  </span>
                </td>

                <!-- Paciente -->
                <td class="px-8 py-5">
                  <div class="text-base font-black text-slate-800 uppercase leading-none mb-1">
                    {{ apt.pet?.name ?? '—' }}
                  </div>
                  <div class="text-xs text-slate-500 font-bold uppercase tracking-tight">
                    {{ apt.service?.name ?? '—' }}
                  </div>
                </td>

                <!-- Propietario -->
                <td class="px-8 py-5">
                  <div class="text-base font-bold text-slate-700 leading-none mb-1">
                    {{ apt.client?.name ?? '—' }}
                  </div>
                  <div class="text-xs text-slate-500 tracking-tighter">
                    {{ apt.client?.phone ?? '' }}
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-8 py-5">
                  <span class="px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider"
                        :style="estadoBadge(apt.status)">
                    {{ estadoLabel(apt.status) }}
                  </span>
                </td>

                <!-- Acción -->
                <td class="px-8 py-5 text-center">
                  <span v-if="apt.status === 'completed'"
                        class="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Registrado
                  </span>
                  <button v-else-if="!requiereExpediente(apt)"
                          @click="finalizarCita(apt.id)"
                          class="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    Finalizar ✓
                  </button>
                  <button v-else @click="openModal(apt)"
                          class="text-xs font-black uppercase tracking-widest text-[#1d6bbf] hover:underline">
                    Expediente →
                  </button>
                </td>
              </tr>

              </tbody>
            </table>
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="space-y-4">
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
              Acciones Rápidas
            </p>
            <div class="space-y-2">
              <button @click="router.push('/veterinario/expedientes')"
                      class="w-full text-left p-5 rounded-xl bg-[#1d6bbf] hover:bg-[#16569a] transition-all">
                <p class="text-sm font-black text-white uppercase tracking-widest">Ver Expedientes</p>
                <p class="text-xs text-blue-200 font-bold uppercase tracking-tight mt-1">Historial completo</p>
              </button>
              <button @click="router.push('/veterinario/mascotas')"
                      class="w-full text-left p-5 rounded-xl bg-slate-50 border border-transparent hover:border-[#1d6bbf]/20 hover:bg-white transition-all group">
                <p class="text-sm font-black text-slate-700 uppercase tracking-widest group-hover:text-[#1d6bbf]">
                  Mis Mascotas
                </p>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-tight mt-1">Pacientes registrados</p>
              </button>
              <button @click="abrirPerfil"
                      class="w-full text-left p-5 rounded-xl bg-slate-50 border border-transparent hover:border-[#1d6bbf]/20 hover:bg-white transition-all group">
                <p class="text-sm font-black text-slate-700 uppercase tracking-widest group-hover:text-[#1d6bbf]">
                  Mi Perfil
                </p>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-tight mt-1">Editar información</p>
              </button>
            </div>
          </div>

          <div class="p-6 rounded-3xl border border-[#1d6bbf]/20 bg-gradient-to-br from-[#1d6bbf]/10 via-white to-slate-50 shadow-sm">
            <p class="text-xs font-black text-[#1d6bbf] uppercase tracking-widest mb-1">Hoy</p>
            <p class="text-xl font-black text-slate-800 leading-tight">
              {{ new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long' }) }}
            </p>
            <p class="mt-3 inline-flex items-center rounded-full bg-[#1d6bbf]/10 px-3 py-1 text-xs font-black tracking-wider text-[#1d6bbf]">
              {{ horaEnVivo }}
            </p>
          </div>
        </aside>

      </div>
    </main>

    <!-- Overlay campana -->
    <div v-if="showNotis" @click="showNotis = false" class="fixed inset-0 z-40"></div>

    <!-- Modal expediente -->
    <div v-if="showModal && selectedApp"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button @click="showModal = false"
                class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl">✕</button>

        <h2 class="text-xl font-bold text-[#1d6bbf] mb-1">Nuevo Expediente Médico</h2>
        <p class="text-sm text-slate-500 mb-5">
          Cita #{{ selectedApp.id }} · {{ selectedApp.pet?.name }} · {{ selectedApp.service?.name }}
        </p>

        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500">Mascota</p>
            <p class="font-bold text-slate-800 text-sm mt-0.5">{{ selectedApp.pet?.name }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500">Dueño</p>
            <p class="font-bold text-slate-800 text-sm mt-0.5">{{ selectedApp.client?.name }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500">Servicio</p>
            <p class="font-bold text-slate-800 text-sm mt-0.5">{{ selectedApp.service?.name }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Peso (kg)</label>
              <input v-model="form.weight" type="number" step="0.1" placeholder="Ej: 4.5"
                     class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Temperatura (°C)</label>
              <input v-model="form.temperature" type="number" step="0.1" placeholder="Ej: 38.5"
                     class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Síntomas</label>
            <textarea v-model="form.symptoms" rows="2" placeholder="Describe los síntomas..."
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf] resize-none" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              Diagnóstico <span class="text-red-400">*</span>
            </label>
            <textarea v-model="form.diagnosis" rows="2" placeholder="Diagnóstico del paciente..."
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf] resize-none" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Tratamiento</label>
            <textarea v-model="form.treatment" rows="2" placeholder="Tratamiento indicado..."
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf] resize-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Prescripciones</label>
              <textarea v-model="form.prescriptions" rows="2" placeholder="Medicamentos..."
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf] resize-none" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones</label>
              <textarea v-model="form.observations" rows="2" placeholder="Observaciones..."
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf] resize-none" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showModal = false"
                  class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button @click="saveRecord"
                  class="flex-1 py-2.5 rounded-xl bg-[#1d6bbf] text-white font-semibold text-sm hover:bg-[#16569a] transition-colors">
            Guardar expediente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal perfil -->
    <div v-if="showPerfil"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button @click="showPerfil = false"
                class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl">✕</button>

        <h2 class="text-xl font-bold text-[#1d6bbf] mb-1">Mi Perfil</h2>
        <p class="text-sm text-slate-500 mb-6">Edita tu información personal</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
            <input v-model="perfilForm.name" type="text" placeholder="Tu nombre"
                   class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
            <input v-model="perfilForm.phone" type="tel" placeholder="10 dígitos"
                   class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Domicilio</label>
            <input v-model="perfilForm.address" type="text" placeholder="Tu dirección"
                   class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              Nueva contraseña
              <span class="text-slate-400 font-normal text-xs">(dejar vacío para no cambiar)</span>
            </label>
            <input v-model="perfilForm.password" type="password" placeholder="••••••••"
                   class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1d6bbf]" />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showPerfil = false"
                  class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button @click="guardarPerfil"
                  class="flex-1 py-2.5 rounded-xl bg-[#1d6bbf] text-white font-semibold text-sm hover:bg-[#16569a] transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.7s cubic-bezier(0.4,0,0.2,1); }
.fade-enter-from, .fade-leave-to { opacity:0; transform:translateY(-20px) scale(0.95); }
</style>
