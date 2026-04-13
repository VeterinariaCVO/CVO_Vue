<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const slots = ref<any[]>([])

const mascotaId = ref<number | null>(null)
const servicioId = ref<number | null>(null)
const slotId = ref<number | null>(null)
const fechaSeleccionada = ref('')
const notas = ref('')

const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')
const exitoso = ref(false)

async function cargarMascotas() {
  const { data, execute } = ApiUseFetch('/mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
}

async function cargarServicios() {
  const { data, execute } = ApiUseFetch('/services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null

  const fecha = fechaSeleccionada.value
  const year = Number(fecha.slice(0, 4))
  const month = Number(fecha.slice(5, 7))

  const { data, execute } = ApiUseFetch(`working-days?year=${year}&month=${month}`).get().json()

  await execute()

  const days = Array.isArray(data.value) ? data.value : (data.value?.data ?? [])
  const wd = days.find((d: any) => d.date === fecha)

  if (!wd || !wd.is_open) {
    cargandoSlots.value = false
    return
  }

  slots.value = (wd.time_slots ?? []).filter((s: any) => s.status === 'available' && s.is_open)

  cargandoSlots.value = false
}

watch(fechaSeleccionada, () => cargarSlots())

async function agendar() {
  errorMsg.value = ''
  if (!mascotaId.value || !servicioId.value || !slotId.value) {
    errorMsg.value = 'Completa todos los campos obligatorios.'
    return
  }
  enviando.value = true

  const {
    data,
    error: fetchError,
    execute,
  } = ApiUseFetch('/cliente/appointments')
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
  cargarMascotas()
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
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Mascota</label>
          <select
            v-model="mascotaId"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white"
          >
            <option :value="null" disabled>Selecciona una mascota</option>
            <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Servicio</label>
          <select
            v-model="servicioId"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white"
          >
            <option :value="null" disabled>Selecciona un servicio</option>
            <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Fecha</label>
          <input
            type="date"
            v-model="fechaSeleccionada"
            :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors"
          />
        </div>
        <div v-if="fechaSeleccionada" class="flex flex-col gap-2">
          <label class="text-xs text-slate-500">Horario</label>
          <div v-if="cargandoSlots" class="text-xs text-slate-400">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="text-xs text-slate-400">
            No hay horarios disponibles para esta fecha.
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
          <label class="text-xs text-slate-500">
            Notas <span class="text-slate-400">(opcional)</span>
          </label>
          <textarea
            v-model="notas"
            rows="2"
            placeholder="Observaciones..."
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {{ errorMsg }}
        </div>

        <!-- Botones -->
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
