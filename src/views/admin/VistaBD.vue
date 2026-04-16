<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const reporte = ref<any[]>([])
const cargando = ref(false)

async function cargarReporte() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('admin/reporte-citas').get().json()
  await execute()
  // Tu ApiResponse trait envuelve en { success, data }
  reporte.value = Array.isArray(data.value?.data)
    ? data.value.data
    : Array.isArray(data.value)
      ? data.value
      : []
  cargando.value = false
}

onMounted(cargarReporte)
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-slate-800">Reporte de Citas</h1>
      <p class="text-sm text-slate-400 mt-0.5">Datos desde vw_reporte_citas</p>
    </div>

    <div v-if="cargando" class="flex justify-center py-14">
      <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]" />
    </div>

    <div
      v-else-if="reporte.length === 0"
      class="bg-white rounded-xl border border-slate-200 py-12 text-center"
    >
      <p class="text-sm text-slate-400">No hay datos de reporte.</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Total</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Pendientes</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Confirmadas</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Completadas</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Canceladas</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Walk-ins</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Ingreso real</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in reporte"
            :key="row.fecha"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
          >
            <td class="px-5 py-3 text-sm font-medium text-slate-800">{{ row.fecha }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ row.total_citas }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 font-medium"
                >{{ row.pendientes }}</span
              >
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium">{{
                row.confirmadas
              }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium">{{
                row.completadas
              }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-1 rounded-md bg-red-100 text-red-500 font-medium">{{
                row.canceladas
              }}</span>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ row.walk_ins }}</td>
            <td class="px-5 py-3 text-sm font-medium text-slate-800">
              ${{ Number(row.ingreso_real).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-xs text-slate-400">
      Fuente:
      <code class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">vw_reporte_citas</code> +
      <code class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">idx_reporte_citas</code>
    </p>
  </div>
</template>
