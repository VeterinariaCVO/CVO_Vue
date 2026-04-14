<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { ReporteBdItem } from '@/types/reporteBD'

const cargando = ref(true)
const error = ref('')
const reporte = ref<ReporteBdItem[]>([])

function normalizarNumero(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function normalizarFila(item: any): ReporteBdItem {
  return {
    fecha: item?.fecha ?? '',
    total_citas: normalizarNumero(item?.total_citas),
    confirmadas: normalizarNumero(item?.confirmadas),
    completadas: normalizarNumero(item?.completadas),
    canceladas: normalizarNumero(item?.canceladas),
    walk_in: normalizarNumero(item?.walk_in),
  }
}

async function cargarReporte() {
  cargando.value = true
  error.value = ''

  try {
    const { data, execute } = ApiUseFetch('admin/appointments/reporte-bd').get().json()
    await execute()

    const payload = data.value?.data ?? data.value ?? []
    reporte.value = Array.isArray(payload) ? payload.map(normalizarFila) : []
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo cargar el reporte avanzado.'
  } finally {
    cargando.value = false
  }
}

const totalDias = computed(() => reporte.value.length)

const totalCitas = computed(() =>
  reporte.value.reduce((acc, item) => acc + item.total_citas, 0),
)

const totalConfirmadas = computed(() =>
  reporte.value.reduce((acc, item) => acc + item.confirmadas, 0),
)

const totalCompletadas = computed(() =>
  reporte.value.reduce((acc, item) => acc + item.completadas, 0),
)

const totalCanceladas = computed(() =>
  reporte.value.reduce((acc, item) => acc + item.canceladas, 0),
)

const totalWalkIn = computed(() =>
  reporte.value.reduce((acc, item) => acc + item.walk_in, 0),
)

const promedioDiario = computed(() => {
  if (!reporte.value.length) return 0
  return Math.round((totalCitas.value / reporte.value.length) * 10) / 10
})

const ultimoDia = computed(() => reporte.value[0] ?? null)

const maximoTotal = computed(() => {
  if (!reporte.value.length) return 1
  return Math.max(...reporte.value.map((item) => item.total_citas), 1)
})

const ultimos7Dias = computed(() => reporte.value.slice(0, 7).reverse())

function porcentaje(parte: number, total: number): string {
  if (!total || total <= 0) return '0%'
  return `${Math.min((parte / total) * 100, 100)}%`
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '—'
  const date = new Date(`${fecha}T00:00:00`)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  cargarReporte()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Herramientas avanzadas de BD</h1>
        <p class="text-sm text-slate-400 mt-1 mb-0">
          Reporte generado desde la vista <span class="font-medium text-slate-500">vw_reporte_cita</span>
        </p>
      </div>

      <button
        @click="cargarReporte"
        class="bg-[#1d6bbf] hover:bg-[#17589d] text-white text-sm font-medium px-4 py-2.5 rounded-lg border-none cursor-pointer transition-colors"
      >
        Recargar reporte
      </button>
    </div>

    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
      {{ error }}
    </div>

    <div v-if="cargando" class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
      Cargando reporte avanzado...
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Días registrados</p>
          <p class="text-2xl font-semibold text-[#1d6bbf] m-0">{{ totalDias }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Citas totales</p>
          <p class="text-2xl font-semibold text-[#1d6bbf] m-0">{{ totalCitas }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Confirmadas</p>
          <p class="text-2xl font-semibold text-emerald-600 m-0">{{ totalConfirmadas }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Completadas</p>
          <p class="text-2xl font-semibold text-sky-600 m-0">{{ totalCompletadas }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Canceladas</p>
          <p class="text-2xl font-semibold text-rose-600 m-0">{{ totalCanceladas }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-400 mb-1">Walk-in</p>
          <p class="text-2xl font-semibold text-amber-600 m-0">{{ totalWalkIn }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700 m-0">Comportamiento de los últimos días</h2>
          </div>

          <div v-if="!ultimos7Dias.length" class="p-6 text-sm text-slate-400">
            No hay datos para mostrar.
          </div>

          <div v-else class="p-5 space-y-4">
            <div v-for="item in ultimos7Dias" :key="item.fecha">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>{{ formatearFecha(item.fecha) }}</span>
                <span>{{ item.total_citas }} citas</span>
              </div>

              <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  class="h-full rounded-full bg-[#1d6bbf] transition-all"
                  :style="{ width: porcentaje(item.total_citas, maximoTotal) }"
                />
              </div>

              <div class="grid grid-cols-4 gap-2 mt-2 text-[11px] text-slate-500">
                <span>Conf: {{ item.confirmadas }}</span>
                <span>Compl: {{ item.completadas }}</span>
                <span>Canc: {{ item.canceladas }}</span>
                <span>Walk-in: {{ item.walk_in }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700 m-0">Resumen ejecutivo</h2>
          </div>

          <div class="p-5 space-y-4 text-sm">
            <div>
              <p class="text-slate-400 mb-1">Promedio diario</p>
              <p class="text-slate-800 font-semibold text-lg m-0">{{ promedioDiario }}</p>
            </div>

            <div>
              <p class="text-slate-400 mb-1">Último día con datos</p>
              <p class="text-slate-800 font-medium m-0">
                {{ ultimoDia ? formatearFecha(ultimoDia.fecha) : '—' }}
              </p>
            </div>

            <div v-if="ultimoDia" class="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p class="text-xs text-slate-400 mb-3">Detalle del último día</p>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Citas</span>
                  <span class="font-medium text-slate-800">{{ ultimoDia.total_citas }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Confirmadas</span>
                  <span class="font-medium text-emerald-600">{{ ultimoDia.confirmadas }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Completadas</span>
                  <span class="font-medium text-sky-600">{{ ultimoDia.completadas }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Canceladas</span>
                  <span class="font-medium text-rose-600">{{ ultimoDia.canceladas }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Walk-in</span>
                  <span class="font-medium text-amber-600">{{ ultimoDia.walk_in }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700 m-0">Detalle por día</h2>
          <span class="text-xs text-slate-400">{{ reporte.length }} registros</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse min-w-[760px]">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Total</th>
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Confirmadas</th>
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Completadas</th>
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Canceladas</th>
                <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Walk-in</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in reporte"
                :key="item.fecha"
                class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
              >
                <td class="px-5 py-3 text-sm text-slate-800">{{ formatearFecha(item.fecha) }}</td>
                <td class="px-5 py-3 text-sm text-[#1d6bbf] font-semibold">{{ item.total_citas }}</td>
                <td class="px-5 py-3 text-sm text-emerald-600">{{ item.confirmadas }}</td>
                <td class="px-5 py-3 text-sm text-sky-600">{{ item.completadas }}</td>
                <td class="px-5 py-3 text-sm text-rose-600">{{ item.canceladas }}</td>
                <td class="px-5 py-3 text-sm text-amber-600">{{ item.walk_in }}</td>
              </tr>

              <tr v-if="!reporte.length">
                <td colspan="6" class="px-5 py-8 text-center text-sm text-slate-400">
                  No hay datos en la vista de reporte.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>