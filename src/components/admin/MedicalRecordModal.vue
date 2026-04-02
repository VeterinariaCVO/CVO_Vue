<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const props = defineProps<{ cita: any }>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const peso = ref('')
const temperatura = ref('')
const sintomas = ref('')
const diagnostico = ref('')
const tratamiento = ref('')
const receta = ref('')
const observaciones = ref('')
const proximaVisita = ref('')
const cargando = ref(false)
const errores = ref<any>({})

async function registrar() {
  errores.value = {}
  cargando.value = true
  const { data, execute } = ApiUseFetch('/medical-records').post({
    appointment_id: props.cita.id,
    weight: peso.value ? parseFloat(peso.value) : null,
    temperature: temperatura.value ? parseFloat(temperatura.value) : null,
    symptoms: sintomas.value || null,
    diagnosis: diagnostico.value || null,
    treatment: tratamiento.value || null,
    prescription: receta.value || null,
    observations: observaciones.value || null,
    next_visit: proximaVisita.value || null,
  }).json()
  await execute()
  cargando.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors as any
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  if ((data.value as any)?.message && !(data.value as any)?.success) {
    errores.value.general = (data.value as any).message
    return
  }
  emit('guardado')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('cerrar')">
    <div class="bg-white rounded-xl w-full max-w-2xl p-7 shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-base font-semibold text-slate-800">Registrar expediente médico</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <!-- Info de la cita -->
      <div class="bg-slate-50 rounded-lg px-4 py-3 mb-5 border border-slate-100">
        <p class="text-xs text-slate-500 m-0">Mascota: <span class="font-medium text-slate-700">{{ cita.pet?.name }}</span> · Servicio: <span class="font-medium text-slate-700">{{ cita.service?.name }}</span> · Cliente: <span class="font-medium text-slate-700">{{ cita.client?.name }}</span></p>
      </div>

      <div v-if="errores.general" class="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">{{ errores.general }}</div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Peso (kg)</label>
          <input v-model="peso" type="number" step="0.1" placeholder="5.5" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.weight" class="text-xs text-red-500">{{ errores.weight }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Temperatura (°C)</label>
          <input v-model="temperatura" type="number" step="0.1" placeholder="38.5" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.temperature" class="text-xs text-red-500">{{ errores.temperature }}</span>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Síntomas</label>
          <textarea v-model="sintomas" rows="2" placeholder="Describe los síntomas observados..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
          <span v-if="errores.symptoms" class="text-xs text-red-500">{{ errores.symptoms }}</span>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Diagnóstico</label>
          <textarea v-model="diagnostico" rows="2" placeholder="Diagnóstico clínico..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
          <span v-if="errores.diagnosis" class="text-xs text-red-500">{{ errores.diagnosis }}</span>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Tratamiento</label>
          <textarea v-model="tratamiento" rows="2" placeholder="Tratamiento indicado..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
          <span v-if="errores.treatment" class="text-xs text-red-500">{{ errores.treatment }}</span>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Receta <span class="text-slate-400">(opcional)</span></label>
          <textarea v-model="receta" rows="2" placeholder="Medicamentos recetados..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Observaciones <span class="text-slate-400">(opcional)</span></label>
          <textarea v-model="observaciones" rows="2" placeholder="Notas adicionales..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Próxima visita sugerida <span class="text-slate-400">(opcional)</span></label>
          <input v-model="proximaVisita" type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button @click="emit('cerrar')" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
        <button @click="registrar" :disabled="cargando" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
          {{ cargando ? 'Guardando...' : 'Registrar expediente' }}
        </button>
      </div>
    </div>
  </div>
</template>