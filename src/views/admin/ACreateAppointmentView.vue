<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useRouter } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'

const router = useRouter()
const clientes = ref<any[]>([])
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const slots = ref<any[]>([])

const clienteId = ref<number | null>(null)
const mascotaId = ref<number | null>(null)
const servicioId = ref<number | null>(null)
const slotId = ref<number | null>(null)
const fechaSeleccionada = ref('')
const notas = ref('')

const cargandoMascotas = ref(false)
const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')
const exitoso = ref(false)

async function cargarClientes() {
  const { data, execute } = ApiUseFetch('/admin/users').get().json()
  await execute()
  const todos = data.value?.data ?? []
  clientes.value = todos.filter((u: any) => u.role_id === 3)
}

async function cargarServicios() {
  const { data, execute } = ApiUseFetch('/services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
}

async function cargarMascotas() {
  if (!clienteId.value) return
  cargandoMascotas.value = true
  mascotas.value = []
  mascotaId.value = null
  const { data, execute } = ApiUseFetch('/pets?owner_id=' + clienteId.value).get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargandoMascotas.value = false
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null
  const { data: wdData, execute: wdExecute } = ApiUseFetch('/working-days?date=' + fechaSeleccionada.value).get().json()
  await wdExecute()
  const workingDays = wdData.value?.data ?? []
  if (workingDays.length === 0) { cargandoSlots.value = false; return }
  const { data, execute } = ApiUseFetch('/time-slots?working_day_id=' + workingDays[0].id + '&status=available').get().json()
  await execute()
  slots.value = data.value?.data ?? []
  cargandoSlots.value = false
}

watch(clienteId, () => cargarMascotas())
watch(fechaSeleccionada, () => cargarSlots())

async function agendar() {
  errorMsg.value = ''
  if (!clienteId.value || !mascotaId.value || !servicioId.value || !slotId.value) {
    errorMsg.value = 'Por favor completa todos los campos.'
    return
  }
  enviando.value = true
  const { data, error: fetchError, execute } = ApiUseFetch('/appointments').post({
    pet_id: mascotaId.value,
    service_id: servicioId.value,
    time_slot_id: slotId.value,
    notes: notas.value,
  }).json()
  await execute()
  enviando.value = false
  if (fetchError.value || !data.value?.success) {
    errorMsg.value = data.value?.message ?? 'Error al agendar la cita.'
    return
  }
  exitoso.value = true
  setTimeout(() => router.push('/admin/citas'), 1500)
}

onMounted(() => {
  cargarClientes()
  cargarServicios()
})
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />

    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-7">
        <button
          @click="router.push('/admin/citas')"
          class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1d6bbf] bg-transparent border-none cursor-pointer transition-colors font-medium p-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver
        </button>
        <div>
          <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Agendar Cita</h1>
          <p class="text-sm text-slate-500 mt-1 mb-0">Registra una nueva cita para un cliente</p>
        </div>
      </div>

      <!-- Éxito -->
      <div v-if="exitoso" class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm text-center font-semibold">
        ¡Cita agendada correctamente! Redirigiendo...
      </div>

      <!-- Formulario -->
      <div v-if="!exitoso" class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-[#dce6f0]">
          <h2 class="text-base font-bold text-[#1d6bbf] m-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
            Datos de la cita
          </h2>
        </div>

        <div class="p-6 grid gap-5 max-w-lg">
          <!-- Cliente -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-600">Cliente</label>
            <select
              v-model="clienteId"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
            >
              <option :value="null" disabled>Selecciona un cliente</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Mascota -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-600">Mascota</label>
            <div v-if="cargandoMascotas" class="text-sm text-slate-400">Cargando mascotas...</div>
            <select
              v-else
              v-model="mascotaId"
              :disabled="!clienteId"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white disabled:opacity-50"
            >
              <option :value="null" disabled>{{ clienteId ? 'Selecciona una mascota' : 'Primero elige un cliente' }}</option>
              <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>

          <!-- Servicio -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-600">Servicio</label>
            <select
              v-model="servicioId"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
            >
              <option :value="null" disabled>Selecciona un servicio</option>
              <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <!-- Fecha -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-600">Fecha</label>
            <input
              type="date"
              v-model="fechaSeleccionada"
              :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
            />
          </div>

          <!-- Slots -->
          <div v-if="fechaSeleccionada" class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-slate-600">Horario disponible</label>
            <div v-if="cargandoSlots" class="text-sm text-slate-400">Cargando horarios...</div>
            <div v-else-if="slots.length === 0" class="text-sm text-slate-400">No hay horarios disponibles para esta fecha.</div>
            <div v-else class="grid grid-cols-4 gap-2">
              <button
                v-for="slot in slots"
                :key="slot.id"
                @click="slotId = slot.id"
                :class="slotId === slot.id
                  ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
                class="border rounded-lg py-2 text-sm font-semibold transition cursor-pointer"
              >{{ slot.start_time.slice(0, 5) }}</button>
            </div>
          </div>

          <!-- Notas -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-600">Notas <span class="text-slate-400 font-normal">(opcional)</span></label>
            <textarea
              v-model="notas"
              rows="3"
              placeholder="Observaciones..."
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {{ errorMsg }}
          </div>

          <!-- Botón -->
          <button
            @click="agendar"
            :disabled="enviando"
            class="bg-[#1d6bbf] hover:bg-[#155fa8] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm border-none cursor-pointer transition-colors"
          >{{ enviando ? 'Agendando...' : 'Confirmar cita' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>