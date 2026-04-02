<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useRouter } from 'vue-router'

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
  const { data, execute } = ApiUseFetch('/empleado/clients').get().json()
  await execute()
  clientes.value = data.value?.data ?? []
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
  if (workingDays.length === 0) {
    cargandoSlots.value = false
    return
  }

  const workingDayId = workingDays[0].id
  const { data, execute } = ApiUseFetch('/time-slots?working_day_id=' + workingDayId + '&status=available').get().json()
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
  setTimeout(() => router.push('/recepcionista/citas'), 1500)
}

onMounted(() => {
  cargarClientes()
  cargarServicios()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-lg mx-auto">

      <div class="mb-6 flex items-center gap-3">
        <button @click="router.push('/recepcionista/citas')" class="text-blue-400 hover:text-blue-600 transition text-sm">← Volver</button>
        <h2 class="text-xl font-bold text-blue-800">Agendar Cita</h2>
      </div>

      <div v-if="exitoso" class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm text-center">
        ¡Cita agendada correctamente! Redirigiendo...
      </div>

      <div v-if="!exitoso" class="bg-white rounded-xl border border-gray-100 p-6 grid gap-5">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select v-model="clienteId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option :value="null" disabled>Selecciona un cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
          <div v-if="cargandoMascotas" class="text-sm text-gray-400">Cargando mascotas...</div>
          <select v-else v-model="mascotaId" :disabled="!clienteId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50">
            <option :value="null" disabled>{{ clienteId ? 'Selecciona una mascota' : 'Primero elige un cliente' }}</option>
            <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
          <select v-model="servicioId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option :value="null" disabled>Selecciona un servicio</option>
            <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            v-model="fechaSeleccionada"
            :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div v-if="fechaSeleccionada">
          <label class="block text-sm font-medium text-gray-700 mb-2">Horario disponible</label>
          <div v-if="cargandoSlots" class="text-sm text-gray-400">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="text-sm text-gray-400">No hay horarios disponibles para esta fecha.</div>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in slots"
              :key="slot.id"
              @click="slotId = slot.id"
              :class="slotId === slot.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'"
              class="border rounded-lg py-2 text-sm font-medium transition"
            >{{ slot.start_time.slice(0, 5) }}</button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea v-model="notas" rows="3" placeholder="Observaciones..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"></textarea>
        </div>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {{ errorMsg }}
        </div>

        <button
          @click="agendar"
          :disabled="enviando"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-60"
        >{{ enviando ? 'Agendando...' : 'Confirmar cita' }}</button>

      </div>
    </div>
  </div>
</template>
