<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { MedicalRecord } from '@/types/medicalRecord'

const route = useRoute()
const router = useRouter()

const records = ref<MedicalRecord[]>([])
const isLoading = ref(true)
const isError = ref(false)

const petId = Number(route.params.id)

function formatoFecha(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function loadRecords() {
  isLoading.value = true
  isError.value = false

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
    isError.value = true
  })

  execute()
}

onMounted(() => loadRecords())

defineOptions({ name: 'RHistorialView' })
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <main class="p-8 max-w-4xl mx-auto space-y-6">

      <!-- Header -->
      <header class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#1d6bbf] hover:border-[#1d6bbf]/30 transition-all shadow-sm"
        >
          ←
        </button>
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">Historial Clínico</h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Vista de consulta · Solo lectura
          </p>
        </div>
      </header>

      <!-- Aviso de solo lectura -->
      <div class="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
        <span class="text-amber-400 text-base">🔒</span>
        <p class="text-[11px] font-black text-amber-600 uppercase tracking-widest">
          Modo consulta — No puedes modificar expedientes
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-24">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-[#1d6bbf] rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="bg-red-50 border border-red-100 rounded-2xl px-6 py-5 text-center">
        <p class="text-sm font-black text-red-500 uppercase tracking-widest">No se pudo cargar el historial</p>
        <button
          @click="loadRecords"
          class="mt-3 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest underline"
        >
          Reintentar
        </button>
      </div>

      <!-- Sin registros -->
      <div v-else-if="records.length === 0" class="bg-white rounded-3xl border border-slate-200 py-24 text-center">
        <p class="text-4xl mb-3">📋</p>
        <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Sin expedientes registrados para esta mascota
        </p>
      </div>

      <!-- Lista de registros -->
      <div v-else class="space-y-5">
        <div
          v-for="record in records"
          :key="record.id"
          class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <!-- Cabecera del expediente -->
          <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="font-black text-slate-800 text-sm uppercase tracking-tight">{{ record.pet?.name }}</span>
                <span class="text-[9px] bg-blue-50 text-[#1d6bbf] border border-blue-100 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                  {{ record.pet?.species }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                📅 {{ formatoFecha(record.date) }}
                <span class="mx-1 text-slate-200">·</span>
                🩺 {{ record.service }}
                <span class="mx-1 text-slate-200">·</span>
                👨‍⚕️ {{ record.veterinarian?.name }}
              </p>
            </div>
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
              Exp. #{{ record.id }}
            </span>
          </div>

          <!-- Cuerpo -->
          <div class="px-8 py-6 space-y-5">

            <!-- Signos vitales -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                <p class="text-xl font-black text-slate-700 tracking-tighter">
                  {{ record.weight ? record.weight + ' kg' : '—' }}
                </p>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Temperatura</p>
                <p class="text-xl font-black text-slate-700 tracking-tighter">
                  {{ record.temperature ? record.temperature + ' °C' : '—' }}
                </p>
              </div>
            </div>

            <!-- Campos clínicos -->
            <div class="space-y-3">

              <div v-if="record.symptoms" class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Síntomas</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ record.symptoms }}</p>
              </div>

              <div v-if="record.diagnosis" class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnóstico</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ record.diagnosis }}</p>
              </div>

              <div v-if="record.treatment" class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tratamiento</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ record.treatment }}</p>
              </div>

              <div v-if="record.prescriptions" class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Prescripciones</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ record.prescriptions }}</p>
              </div>

              <div v-if="record.observations" class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Observaciones</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ record.observations }}</p>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-3 border-t border-slate-100 bg-slate-50/30">
            <p class="text-[9px] text-slate-300 font-black uppercase tracking-widest text-right">
              Registrado el {{ formatoFecha(record.created_at) }}
            </p>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>
