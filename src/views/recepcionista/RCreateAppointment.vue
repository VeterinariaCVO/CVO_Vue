<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const router = useRouter()

// ── Datos del formulario ──────────────────────────────────────────────────────
const clienteId = ref<number | null>(null)
const mascotaId = ref<number | null>(null)
const servicioId = ref<number | null>(null)
const diaId = ref<number | null>(null)
const slotId = ref<number | null>(null)
const notas = ref('')

// ── Listas ────────────────────────────────────────────────────────────────────
const clientes = ref<any[]>([])
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const diasLaborales = ref<any[]>([])
const slots = ref<any[]>([])

// ── Estados de carga ──────────────────────────────────────────────────────────
const cargandoClientes = ref(true)
const cargandoMascotas = ref(false)
const cargandoServicios = ref(true)
const cargandoDias = ref(true)
const cargandoSlots = ref(false)
const enviando = ref(false)

// ── Feedback ──────────────────────────────────────────────────────────────────
const errorMsg = ref('')
const exitoso = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatearFecha(fecha: string) {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: '2-digit', month: 'long',
  })
}

function formatearHora(hora: string) {
  if (!hora) return '—'
  return hora.slice(0, 5)
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
async function cargarClientes() {
  cargandoClientes.value = true
  const { data, execute } = ApiUseFetch('empleado/clients').get().json()
  await execute()
  clientes.value = data.value?.data ?? []
  cargandoClientes.value = false
}

async function cargarServicios() {
  cargandoServicios.value = true
  const { data, execute } = ApiUseFetch('services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
  cargandoServicios.value = false
}

async function cargarDiasLaborales() {
  cargandoDias.value = true
  const { data, execute } = ApiUseFetch('working-days').get().json()
  await execute()
  const hoy = new Date().toISOString().slice(0, 10)
  diasLaborales.value = (data.value?.data ?? []).filter(
    (d: any) => d.is_open && d.date >= hoy
  )
  cargandoDias.value = false
}

// ── Carga reactiva ────────────────────────────────────────────────────────────
async function cargarMascotas(id: number) {
  cargandoMascotas.value = true
  mascotas.value = []
  mascotaId.value = null
  const { data, execute } = ApiUseFetch(`pets?owner_id=${id}`).get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargandoMascotas.value = false
}

async function cargarSlots(id: number) {
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null
  const { data, execute } = ApiUseFetch(`time-slots?working_day_id=${id}&status=available`).get().json()
  await execute()
  slots.value = data.value?.data ?? []
  cargandoSlots.value = false
}

watch(clienteId, (val) => { if (val) cargarMascotas(val) })
watch(diaId, (val) => { if (val) cargarSlots(val) })

// ── Enviar ────────────────────────────────────────────────────────────────────
function validar() {
  if (!clienteId.value) return 'Selecciona un cliente'
  if (!mascotaId.value) return 'Selecciona una mascota'
  if (!servicioId.value) return 'Selecciona un servicio'
  if (!diaId.value) return 'Selecciona un día'
  if (!slotId.value) return 'Selecciona un horario'
  return null
}

async function agendar() {
  errorMsg.value = ''
  const err = validar()
  if (err) { errorMsg.value = err; return }

  enviando.value = true
  const { data, error, execute } = ApiUseFetch('appointments').post({
    pet_id: mascotaId.value,
    service_id: servicioId.value,
    time_slot_id: slotId.value,
    notes: notas.value || null,
  }).json()
  await execute()
  enviando.value = false

  if (error.value || !data.value?.success) {
    errorMsg.value = data.value?.message ?? 'Error al agendar la cita. Intenta de nuevo.'
    return
  }

  exitoso.value = true
  setTimeout(() => router.push('/recepcionista/citas'), 1800)
}

onMounted(() => {
  cargarClientes()
  cargarServicios()
  cargarDiasLaborales()
})
</script>

<template>
  <div class="p-8">

    <!-- Encabezado -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.push('/recepcionista/citas')"
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer p-0 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver a citas
      </button>
      <span class="text-slate-300">/</span>
      <h1 class="text-xl font-semibold text-slate-800 m-0">Nueva cita</h1>
    </div>

    <!-- Éxito -->
    <div
      v-if="exitoso"
      class="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-xl px-6 py-8 text-center space-y-2"
    >
      <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      <p class="text-green-700 font-semibold text-base">¡Cita agendada correctamente!</p>
      <p class="text-green-500 text-sm">Redirigiendo al listado de citas...</p>
    </div>

    <!-- Formulario -->
    <div v-else class="max-w-2xl mx-auto space-y-4">

      <!-- Paso 1: Cliente y Mascota -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-[#1d6bbf] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <h2 class="text-sm font-semibold text-slate-700 m-0">Paciente</h2>
        </div>

        <!-- Cliente -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Cliente <span class="text-red-400">*</span></label>
          <div v-if="cargandoClientes" class="text-sm text-slate-400 py-2">Cargando clientes...</div>
          <select
            v-else
            v-model="clienteId"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors bg-white"
            :class="!clienteId ? 'border-slate-200' : 'border-[#1d6bbf]'"
          >
            <option :value="null" disabled>Selecciona un cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Mascota -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Mascota <span class="text-red-400">*</span></label>
          <div v-if="cargandoMascotas" class="text-sm text-slate-400 py-2">Cargando mascotas...</div>
          <div v-else-if="!clienteId" class="text-sm text-slate-400 py-2 italic">Primero selecciona un cliente</div>
          <div v-else-if="mascotas.length === 0" class="text-sm text-amber-500 py-2">Este cliente no tiene mascotas registradas.</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="m in mascotas"
              :key="m.id"
              @click="mascotaId = m.id"
              class="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors text-left"
              :class="mascotaId === m.id
                ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
            >
              <span>{{ m.name }}</span>
              <span class="text-xs opacity-70">{{ m.species }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Paso 2: Servicio -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-[#1d6bbf] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <h2 class="text-sm font-semibold text-slate-700 m-0">Servicio</h2>
        </div>

        <div v-if="cargandoServicios" class="text-sm text-slate-400">Cargando servicios...</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-for="s in servicios"
            :key="s.id"
            @click="servicioId = s.id"
            class="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors text-left"
            :class="servicioId === s.id
              ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
          >
            <span class="text-sm font-medium">{{ s.name }}</span>
            <span class="text-xs opacity-75 shrink-0 ml-2">${{ s.price }}</span>
          </button>
        </div>
      </div>

      <!-- Paso 3: Fecha y horario -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-[#1d6bbf] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <h2 class="text-sm font-semibold text-slate-700 m-0">Fecha y horario</h2>
        </div>

        <!-- Días laborales -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Día disponible <span class="text-red-400">*</span></label>
          <div v-if="cargandoDias" class="text-sm text-slate-400">Cargando días...</div>
          <div v-else-if="diasLaborales.length === 0" class="text-sm text-amber-500">No hay días laborales disponibles.</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="dia in diasLaborales"
              :key="dia.id"
              @click="diaId = dia.id"
              class="px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors capitalize"
              :class="diaId === dia.id
                ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
            >
              {{ formatearFecha(dia.date) }}
            </button>
          </div>
        </div>

        <!-- Slots -->
        <div v-if="diaId">
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Horario <span class="text-red-400">*</span></label>
          <div v-if="cargandoSlots" class="text-sm text-slate-400">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="text-sm text-amber-500">No hay horarios disponibles para este día.</div>
          <div v-else class="grid grid-cols-4 sm:grid-cols-6 gap-2">
            <button
              v-for="slot in slots"
              :key="slot.id"
              @click="slotId = slot.id"
              class="py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-center"
              :class="slotId === slot.id
                ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
            >
              {{ formatearHora(slot.start_time) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Paso 4: Notas -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">4</span>
          <h2 class="text-sm font-semibold text-slate-700 m-0">Notas <span class="text-slate-400 font-normal">(opcional)</span></h2>
        </div>
        <textarea
          v-model="notas"
          rows="3"
          placeholder="Observaciones adicionales sobre la cita..."
          class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1d6bbf] transition-colors resize-none placeholder-slate-400"
        ></textarea>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
        </svg>
        {{ errorMsg }}
      </div>

      <!-- Resumen + botón -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4">
        <div class="text-sm text-slate-500 space-y-0.5">
          <p class="m-0">
            <span class="font-medium text-slate-700">
              {{ clientes.find(c => c.id === clienteId)?.name ?? '—' }}
            </span>
            <span v-if="mascotaId"> · {{ mascotas.find(m => m.id === mascotaId)?.name ?? '' }}</span>
          </p>
          <p class="m-0 text-xs">
            {{ servicios.find(s => s.id === servicioId)?.name ?? 'Sin servicio' }}
            <span v-if="slotId">
              · {{ formatearFecha(diasLaborales.find(d => d.id === diaId)?.date ?? '') }}
              · {{ formatearHora(slots.find(s => s.id === slotId)?.start_time ?? '') }}
            </span>
          </p>
        </div>
        <button
          @click="agendar"
          :disabled="enviando"
          class="shrink-0 flex items-center gap-2 bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold px-6 py-2.5 rounded-lg border-none cursor-pointer transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg v-if="!enviando" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          {{ enviando ? 'Agendando...' : 'Confirmar cita' }}
        </button>
      </div>

    </div>
  </div>
</template>
