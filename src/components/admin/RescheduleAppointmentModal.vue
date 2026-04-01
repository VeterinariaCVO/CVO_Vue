<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
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

  const { data: wdData, execute: wdExecute } = ApiUseFetch('/working-days?date=' + fechaSeleccionada.value).get().json()
  await wdExecute()

  const workingDays = wdData.value?.data ?? []
  if (workingDays.length === 0) {
    cargandoSlots.value = false
    return
  }

  const { data, execute } = ApiUseFetch('/time-slots?working_day_id=' + workingDays[0].id + '&status=available').get().json()
  await execute()
  slots.value = data.value?.data ?? []
  cargandoSlots.value = false
}

async function reagendar() {
  if (!slotId.value) {
    errorMsg.value = 'Selecciona un horario.'
    return
  }

  errorMsg.value = ''
  enviando.value = true

  const { data, execute } = ApiUseFetch('/appointments/' + props.citaId).put({
    time_slot_id: slotId.value,
  }).json()

  await execute()
  enviando.value = false

  if (data.value?.errors || !data.value?.success) {
    errorMsg.value = data.value?.message ?? 'Error al reagendar.'
    return
  }

  emit('guardado')
}

watch(fechaSeleccionada, () => cargarSlots())
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-7 w-full max-w-md shadow-xl">

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-[#1e3a5f]">Reagendar Cita</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 text-xl bg-transparent border-none cursor-pointer">✕</button>
      </div>

      <div class="flex flex-col gap-4">

        <!-- Fecha -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Nueva fecha</label>
          <input
            type="date"
            v-model="fechaSeleccionada"
            :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
        </div>

        <!-- Slots -->
        <div v-if="fechaSeleccionada" class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Horario disponible</label>
          <div v-if="cargandoSlots" class="text-sm text-slate-400">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="text-sm text-slate-400">No hay horarios disponibles.</div>
          <div v-else class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in slots"
              :key="slot.id"
              @click="slotId = slot.id"
              :class="slotId === slot.id ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1d6bbf]'"
              class="border rounded-lg py-2 text-sm font-medium transition"
            >{{ slot.start_time.slice(0, 5) }}</button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {{ errorMsg }}
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 mt-6">
        <button
          @click="emit('cerrar')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors"
        >Cancelar</button>
        <button
          @click="reagendar"
          :disabled="enviando"
          class="flex-1 bg-[#1d6bbf] hover:bg-[#155fa8] disabled:opacity-60 text-white font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors"
        >{{ enviando ? 'Guardando...' : 'Confirmar' }}</button>
      </div>

    </div>
  </div>
</template>