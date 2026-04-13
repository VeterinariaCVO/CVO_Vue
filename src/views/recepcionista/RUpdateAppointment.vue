<script setup lang="ts">
import { ref, watch } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const props = defineProps<{ citaId: number }>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const fechaSeleccionada = ref('')
const slots = ref<any[]>([])
const slotId = ref<number | null>(null)
const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null

  const fecha  = fechaSeleccionada.value
  const year   = Number(fecha.slice(0, 4))
  const month  = Number(fecha.slice(5, 7))

  const { data, execute } = ApiUseFetch(`working-days?year=${year}&month=${month}`).get().json()
  await execute()

  const days = Array.isArray(data.value) ? data.value : (data.value?.data ?? [])
  const wd   = days.find((d: any) => d.date === fecha)

  if (!wd || !wd.is_open) {
    cargandoSlots.value = false
    return
  }

  slots.value       = (wd.time_slots ?? []).filter((s: any) => s.status === 'available' && s.is_open)
  cargandoSlots.value = false
}

async function reagendar() {
  if (enviando.value) return

  errorMsg.value = ''

  if (!slotId.value) {
    errorMsg.value = 'Selecciona un horario.'
    return
  }

  enviando.value = true

  try {
    const { data, execute } = ApiUseFetch(`/appointments/${props.citaId}`)
      .put({ time_slot_id: slotId.value })
      .json()

    await execute()

    if (!data.value?.success) {
      errorMsg.value = data.value?.message ?? 'Error al reagendar.'
      return
    }

    emit('guardado')

  } catch {
    errorMsg.value = 'Ocurrió un error inesperado.'
  } finally {
    enviando.value = false
  }
}

watch(fechaSeleccionada, () => cargarSlots())
</script>

<template>
  <div
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    @click.self="!enviando && emit('cerrar')"
  >
    <div class="bg-white rounded-xl w-full max-w-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-slate-800">Reagendar cita</h2>
        <button
          @click="emit('cerrar')"
          :disabled="enviando"
          class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none disabled:opacity-40"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-col gap-3">

        <!-- Fecha -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nueva fecha</label>
          <input
            type="date"
            v-model="fechaSeleccionada"
            :disabled="enviando"
            :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors disabled:opacity-50"
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
              @click="!enviando && (slotId = slot.id)"
              :disabled="enviando"
              :class="
                slotId === slot.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              "
              class="border rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ slot.start_time.slice(0, 5) }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {{ errorMsg }}
        </div>
      </div>

      <!-- Botones -->
      <div class="flex gap-2 mt-5">
        <button
          @click="emit('cerrar')"
          :disabled="enviando"
          class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          @click="reagendar"
          :disabled="enviando || !slotId"
          class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg border-none transition-colors"
        >
          {{ enviando ? 'Guardando...' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>
