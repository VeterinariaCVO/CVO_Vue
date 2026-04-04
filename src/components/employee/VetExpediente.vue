<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { MedicalRecord } from '@/types/medicalRecord'

const route = useRoute()
const router = useRouter()

const records = ref<MedicalRecord[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)

const petId = Number(route.params.id)

function loadRecords() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch('/medical-records')
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    const all = data.value?.data ?? []
    records.value = all.filter((r: MedicalRecord) => r.pet?.id === petId)
  })

  onFetchError(() => {
    isLoading.value = false
    mensaje('No se pudo cargar el historial', true)
  })

  execute()
}

onMounted(() => loadRecords())

function mensaje(text: string, error: boolean) {
  message.value = text
  isError.value = error
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function formatoFecha(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

defineOptions({ name: 'VetExpediente' })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
    <!-- aqui va ir el ancabezado -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.back()"
        class="p-2 rounded-xl bg-white border border-blue-100 text-slate-500 hover:bg-blue-50 transition-colors shadow-sm"
      >
        ←
      </button>
      <div>
        <h1 class="text-2xl font-bold text-blue-700">Historial Médico</h1>
        <p class="text-sm text-slate-400 mt-0.5">Expedientes registrados de la mascota</p>
      </div>
    </div>

    <!-- aqui va ir el toast -->
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

    <!-- la carga con isloading-->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"
      ></div>
    </div>

    <!-- cuando no alla expedientes -->
    <div v-else-if="records.length === 0" class="text-center py-20 text-slate-400">
      <p class="text-4xl mb-3">📋</p>
      <p class="font-medium">No hay expedientes registrados para esta mascota</p>
    </div>

    <!-- la lista -->
    <div v-else class="space-y-5 max-w-3xl mx-auto">
      <div
        v-for="record in records"
        :key="record.id"
        class="bg-white rounded-2xl border border-blue-100 shadow-sm p-6"
      >
        <!-- la cabezara del exp -->
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-800 text-base">{{ record.pet?.name }}</span>
              <span
                class="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold"
              >
                {{ record.pet?.species }}
              </span>
            </div>
            <p class="text-sm text-slate-400 mt-1">
              📅 {{ formatoFecha(record.date) }}
              <span class="mx-1 text-slate-300">·</span>
              🩺 {{ record.service }}
              <span class="mx-1 text-slate-300">·</span>
              👨⚕️ {{ record.veterinarian?.name }}
            </p>
          </div>

          <!-- Botón editar — próximamente
<button
  @click="router.push(`/veterinario/editarexpediente/${record.id}`)"
  class="px-3 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600
         border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap"
>
  ✏️ Editar
</button>
-->
        </div>
        <!-- Signos vitales -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-400 mb-1">Peso</p>
            <p class="font-bold text-slate-700">
              {{ record.weight ? record.weight + ' kg' : '—' }}
            </p>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-400 mb-1">Temperatura</p>
            <p class="font-bold text-slate-700">
              {{ record.temperature ? record.temperature + ' °C' : '—' }}
            </p>
          </div>
        </div>

        <!-- Campos clínicos -->
        <div class="space-y-3">
          <div v-if="record.symptoms">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Síntomas
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.symptoms }}
            </p>
          </div>

          <div v-if="record.diagnosis">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Diagnóstico
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.diagnosis }}
            </p>
          </div>

          <div v-if="record.treatment">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Tratamiento
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.treatment }}
            </p>
          </div>

          <div v-if="record.prescriptions">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Prescripciones
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.prescriptions }}
            </p>
          </div>

          <div v-if="record.observations">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Observaciones
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.observations }}
            </p>
          </div>


        </div>

        <!-- footer final -->
        <p class="text-xs text-slate-300 mt-4 text-right">
          Registrado el {{ formatoFecha(record.created_at) }}
        </p>
      </div>
    </div>
  </div>
</template>
