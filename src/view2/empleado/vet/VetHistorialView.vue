<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const route = useRoute()
const router = useRouter()

const records = ref<any[]>([])
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
    // Filtramos por mascota_id (campo de vw_historial_mascota)
    records.value = all.filter((r: any) => r.mascota_id === petId)
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

    <div v-else-if="records.length === 0" class="text-center py-20 text-slate-400">
      <p class="text-4xl mb-3">📋</p>
      <p class="font-medium">No hay expedientes registrados para esta mascota</p>
    </div>

    <div v-else class="space-y-5 max-w-3xl mx-auto">
      <div
        v-for="record in records"
        :key="record.expediente_id"
        class="bg-white rounded-2xl border border-blue-100 shadow-sm p-6"
      >
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-800 text-base">{{ record.mascota }}</span>
              <span
                class="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold"
              >
                {{ record.especie }}
              </span>
            </div>
            <p class="text-sm text-slate-400 mt-1">
              📅 {{ formatoFecha(record.fecha_consulta) }}
              <span class="mx-1 text-slate-300">·</span>
              🩺 {{ record.servicio }}
              <span class="mx-1 text-slate-300">·</span>
              👨‍⚕️ {{ record.veterinario }}
            </p>
          </div>
        </div>

        <!-- Signos vitales -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-400 mb-1">Peso</p>
            <p class="font-bold text-slate-700">{{ record.peso ? record.peso + ' kg' : '—' }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-400 mb-1">Temperatura</p>
            <p class="font-bold text-slate-700">
              {{ record.temperatura ? record.temperatura + ' °C' : '—' }}
            </p>
          </div>
        </div>

        <!-- Campos clínicos -->
        <div class="space-y-3">
          <div v-if="record.sintomas">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Síntomas
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.sintomas }}
            </p>
          </div>

          <div v-if="record.diagnostico">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Diagnóstico
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.diagnostico }}
            </p>
          </div>

          <div v-if="record.tratamiento">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Tratamiento
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.tratamiento }}
            </p>
          </div>

          <div v-if="record.recetas">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Prescripciones
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.recetas }}
            </p>
          </div>

          <div v-if="record.observaciones">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Observaciones
            </p>
            <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {{ record.observaciones }}
            </p>
          </div>
        </div>

        <p class="text-xs text-slate-300 mt-4 text-right">
          Registrado el {{ formatoFecha(record.registrado_en) }}
        </p>
      </div>
    </div>
  </div>
</template>
