<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

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

  // ✅ /admin/pets en lugar de /admin1/pets
  const { data, execute } = ApiUseFetch(`/admin/pets?owner_id=${clienteId.value}`).get().json()
  await execute()

  // ✅ La vista vw_pets devuelve mascota_id y nombre en lugar de id y name
  mascotas.value = data.value?.data ?? []
  cargandoMascotas.value = false
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null

  // ✅ Nuevo: primero buscamos el día de trabajo por fecha
  const { data: diasData, execute: ejecutarDias } = ApiUseFetch('/working-days').get().json()
  await ejecutarDias()

  const dias = diasData.value?.data ?? []
  const dia = dias.find((d: any) => d.date === fechaSeleccionada.value)

  if (!dia || !dia.is_open) {
    cargandoSlots.value = false
    return
  }

  // ✅ Nuevo: luego pedimos los slots de ese día por separado
  const { data: slotsData, execute: ejecutarSlots } = ApiUseFetch(
    `/working-days/${dia.id}/time-slots`,
  )
    .get()
    .json()
  await ejecutarSlots()

  const todosSlots = slotsData.value?.data ?? []
  slots.value = todosSlots.filter((s: any) => s.status === 'available' && s.is_open)

  cargandoSlots.value = false
}

watch(clienteId, () => cargarMascotas())
watch(fechaSeleccionada, () => cargarSlots())

async function agendar() {
  errorMsg.value = ''
  if (!clienteId.value || !mascotaId.value || !servicioId.value || !slotId.value) {
    errorMsg.value = 'Completa todos los campos obligatorios.'
    return
  }
  enviando.value = true

  // ✅ /empleado/appointments en lugar de /recep/appointments
  const {
    data,
    error: fetchError,
    execute,
  } = ApiUseFetch('/empleado/appointments')
    .post({
      pet_id: mascotaId.value,
      service_id: servicioId.value,
      time_slot_id: slotId.value,
      notes: notas.value,
    })
    .json()

  await execute()
  enviando.value = false

  if (fetchError.value || !data.value?.success) {
    errorMsg.value = data.value?.message ?? 'Error al agendar la cita.'
    return
  }

  exitoso.value = true
  setTimeout(() => emit('guardado'), 1500)
}

onMounted(() => {
  cargarClientes()
  cargarServicios()
})
</script>

<template>
  <div
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    @click.self="emit('cerrar')"
  >
    <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-slate-800">Agendar cita</h2>
        <button
          v-if="!exitoso"
          @click="emit('cerrar')"
          class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div
        v-if="exitoso"
        class="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center"
      >
        ¡Cita agendada correctamente!
      </div>

      <div v-else class="flex flex-col gap-3">
        <!-- Cliente -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Cliente</label>
          <select
            v-model="clienteId"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white"
          >
            <option :value="null" disabled>Selecciona un cliente</option>
            <!-- ✅ Los campos de usuarios siguen siendo id y name (no cambiaron) -->
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Mascota -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Mascota</label>
          <div v-if="cargandoMascotas" class="text-xs text-slate-400 px-1">
            Cargando mascotas...
          </div>
          <select
            v-else
            v-model="mascotaId"
            :disabled="!clienteId"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white disabled:opacity-50"
          >
            <option :value="null" disabled>
              {{ clienteId ? 'Selecciona una mascota' : 'Elige un cliente primero' }}
            </option>
            <!-- ✅ vw_pets devuelve mascota_id y nombre en lugar de id y name -->
            <option v-for="m in mascotas" :key="m.mascota_id" :value="m.mascota_id">
              {{ m.nombre }}
            </option>
          </select>
        </div>

        <!-- Servicio -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Servicio</label>
          <select
            v-model="servicioId"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white"
          >
            <option :value="null" disabled>Selecciona un servicio</option>
            <!-- Los servicios siguen con id y name (tabla directa, no vista) -->
            <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Fecha -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Fecha</label>
          <input
            type="date"
            v-model="fechaSeleccionada"
            :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <!-- Slots -->
        <div v-if="fechaSeleccionada" class="flex flex-col gap-2">
          <label class="text-xs text-slate-500">Horario</label>
          <div v-if="cargandoSlots" class="text-xs text-slate-400">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="text-xs text-slate-400">
            No hay horarios disponibles.
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="slot in slots"
              :key="slot.id"
              @click="slotId = slot.id"
              :class="
                slotId === slot.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              "
              class="border rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer"
            >
              {{ slot.start_time.slice(0, 5) }}
            </button>
          </div>
        </div>

        <!-- Notas -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500"
            >Notas <span class="text-slate-400">(opcional)</span></label
          >
          <textarea
            v-model="notas"
            rows="2"
            placeholder="Observaciones..."
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"
          ></textarea>
        </div>

        <div
          v-if="errorMsg"
          class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {{ errorMsg }}
        </div>

        <div class="flex gap-2 mt-2">
          <button
            @click="emit('cerrar')"
            class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent"
          >
            Cancelar
          </button>
          <button
            @click="agendar"
            :disabled="enviando"
            class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors"
          >
            {{ enviando ? 'Agendando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
