<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { MedicalRecord } from '@/types/medicalRecord'

const route = useRoute()
const router = useRouter()

const records = ref<MedicalRecord[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)

function loadRecords() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError, execute } =
    ApiUseFetch('/medical-records').get().json()

  onFetchResponse(() => {
    isLoading.value = false
    const all = data.value?.data ?? []
     records.value = all.filter((r: MedicalRecord) => r.pet?.id === petId)
  })

    form.value.weight = d.weight ?? ''
    form.value.temperature = d.temperature ?? ''
    form.value.symptoms = d.symptoms ?? ''
    form.value.diagnosis = d.diagnosis ?? ''
    form.value.treatment = d.treatment ?? ''
    form.value.prescriptions = d.prescriptions ?? ''
    form.value.observations = d.observations ?? ''
    form.value.next_visit = d.next_visit ?? ''

    info.value.pet = d.pet?.name ?? ''
    info.value.species = d.pet?.species ?? ''
    info.value.service = d.service ?? ''
    info.value.date = d.date
      ? new Date(d.date).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : ''
    info.value.vet = d.veterinarian?.name ?? ''
  })

  onFetchError(() => {
    isLoading.value = false
    showMsg('No se pudo cargar el expediente', true)
  })

  execute()
}

onMounted(() => loadRecord())

function saveRecord() {
  if (!form.value.diagnosis.trim()) {
    showMsg('El diagnóstico es obligatorio', true)
    return
  }

  isSaving.value = true

  const id = route.params.id

  const body: Record<string, any> = {
    diagnosis: form.value.diagnosis,
  }

  if (form.value.weight) body.weight = form.value.weight
  if (form.value.temperature) body.temperature = form.value.temperature
  if (form.value.symptoms) body.symptoms = form.value.symptoms
  if (form.value.treatment) body.treatment = form.value.treatment
  if (form.value.prescriptions) body.prescriptions = form.value.prescriptions
  if (form.value.observations) body.observations = form.value.observations
  if (form.value.next_visit) body.next_visit = form.value.next_visit

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/medical-records/${id}`)
    .put(body)
    .json()

  onFetchResponse(() => {
    isSaving.value = false
    showMsg('Expediente actualizado correctamente ✓', false)
    setTimeout(() => router.back(), 1500)
  })

  onFetchError(() => {
    isSaving.value = false
    showMsg(data.value?.message || 'Error al guardar', true)
  })

  execute()
}

function showMsg(text: string, error: boolean) {
  message.value = text
  isError.value = error
  setTimeout(() => {
    message.value = ''
  }, 3500)
}

defineOptions({ name: 'VetExpediente' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 p-6">
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.back()"
        class="p-2 rounded-xl bg-white border border-blue-100 text-slate-500 hover:bg-blue-50 transition-colors shadow-sm"
      >
        ←
      </button>
      <div>
        <h1 class="text-2xl font-bold text-blue-700">Editar Expediente</h1>
        <p class="text-sm text-slate-400 mt-0.5">Actualiza los datos de la consulta</p>
      </div>
    </div>

    <div
      v-if="message"
      class="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
      :class="
        isError
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-green-50 border border-green-200 text-green-700'
      "
    >
      <span>{{ isError ? '⚠' : '✓' }}</span> {{ message }}
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"
      ></div>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
          <p class="text-xs text-slate-400 mb-1">Mascota</p>
          <p class="font-bold text-slate-700 text-sm">{{ info.pet }}</p>
          <p class="text-xs text-slate-400">{{ info.species }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
          <p class="text-xs text-slate-400 mb-1">Servicio</p>
          <p class="font-bold text-slate-700 text-sm">{{ info.service }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
          <p class="text-xs text-slate-400 mb-1">Fecha</p>
          <p class="font-bold text-slate-700 text-sm">{{ info.date }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Peso (kg)</label>
            <input
              v-model="form.weight"
              type="number"
              step="0.1"
              placeholder="Ej: 4.5"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5"
              >Temperatura (°C)</label
            >
            <input
              v-model="form.temperature"
              type="number"
              step="0.1"
              placeholder="Ej: 38.5"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Síntomas</label>
          <textarea
            v-model="form.symptoms"
            rows="2"
            placeholder="Síntomas observados..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">
            Diagnóstico <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="form.diagnosis"
            rows="2"
            placeholder="Diagnóstico del paciente..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tratamiento</label>
          <textarea
            v-model="form.treatment"
            rows="2"
            placeholder="Tratamiento indicado..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Prescripciones</label>
            <textarea
              v-model="form.prescriptions"
              rows="2"
              placeholder="Medicamentos recetados..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Próxima visita</label>
            <input
              v-model="form.next_visit"
              type="date"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Observaciones</label>
          <textarea
            v-model="form.observations"
            rows="2"
            placeholder="Observaciones adicionales..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="router.back()"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
          ></button>
          <button
            @click="saveRecord"
            :disabled="isSaving"
            class="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
          >
            {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
