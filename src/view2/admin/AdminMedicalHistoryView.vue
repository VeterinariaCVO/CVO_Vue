<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const historial = ref<any[]>([])
const cargando = ref(true)
const busqueda = ref('')
const registroSeleccionado = ref<any | null>(null)

const historialFiltrado = computed(() => {
  if (!busqueda.value.trim()) return historial.value
  const q = busqueda.value.toLowerCase()
  return historial.value.filter(
    (r) =>
      r.mascota_nombre?.toLowerCase().includes(q) ||
      r.owner_nombre?.toLowerCase().includes(q) ||
      r.veterinario_nombre?.toLowerCase().includes(q) ||
      r.diagnostico?.toLowerCase().includes(q),
  )
})

function formatFecha(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

async function cargarHistorial() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('/medical-records').get().json()
  await execute()
  historial.value = data.value?.data ?? []
  cargando.value = false
}

onMounted(cargarHistorial)
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Historial Médico</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Todos los expedientes clínicos</p>
      </div>
    </div>

    <!-- Búsqueda -->
    <div class="mb-4">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por mascota, dueño, veterinario o diagnóstico..."
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors w-full max-w-md"
      />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="cargando" class="flex justify-center py-14">
        <div
          class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"
        ></div>
      </div>
      <p
        v-else-if="historialFiltrado.length === 0"
        class="text-center text-sm text-slate-400 py-12"
      >
        No hay expedientes registrados.
      </p>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Fecha</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dueño</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Veterinario</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Servicio</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Diagnóstico</th>
            <th class="text-xs text-slate-400 font-medium px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="registro in historialFiltrado"
            :key="registro.id"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
          >
            <td class="px-5 py-3 text-sm text-slate-500">{{ formatFecha(registro.fecha) }}</td>
            <td class="px-5 py-3">
              <p class="text-sm text-slate-800 m-0">{{ registro.mascota_nombre }}</p>
              <p class="text-xs text-slate-400 m-0">{{ registro.especie }}</p>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ registro.owner_nombre }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ registro.veterinario_nombre }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ registro.servicio_nombre }}</td>
            <td class="px-5 py-3 text-sm text-slate-600 max-w-xs truncate">
              {{ registro.diagnostico ?? '—' }}
            </td>
            <td class="px-5 py-3">
              <button
                @click="registroSeleccionado = registro"
                class="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal detalle expediente -->
    <Teleport to="body">
      <div
        v-if="registroSeleccionado"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
        style="background: rgba(0, 0, 0, 0.3)"
        @click.self="registroSeleccionado = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-800 m-0">Expediente Clínico</h2>
              <p class="text-xs text-slate-400 mt-0.5 m-0">
                {{ formatFecha(registroSeleccionado.fecha) }}
              </p>
            </div>
            <button
              @click="registroSeleccionado = null"
              class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-xl"
            >
              ✕
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Info básica -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-xl p-3">
                <p class="text-xs text-slate-400 mb-0.5">Mascota</p>
                <p class="font-semibold text-slate-700 text-sm m-0">
                  {{ registroSeleccionado.mascota_nombre }}
                </p>
                <p class="text-xs text-slate-400 m-0">
                  {{ registroSeleccionado.especie }} · {{ registroSeleccionado.raza ?? 'Sin raza' }}
                </p>
              </div>
              <div class="bg-slate-50 rounded-xl p-3">
                <p class="text-xs text-slate-400 mb-0.5">Dueño</p>
                <p class="font-semibold text-slate-700 text-sm m-0">
                  {{ registroSeleccionado.owner_nombre }}
                </p>
                <p class="text-xs text-slate-400 m-0">
                  {{ registroSeleccionado.owner_telefono ?? '—' }}
                </p>
              </div>
              <div class="bg-slate-50 rounded-xl p-3">
                <p class="text-xs text-slate-400 mb-0.5">Veterinario</p>
                <p class="font-semibold text-slate-700 text-sm m-0">
                  {{ registroSeleccionado.veterinario_nombre }}
                </p>
              </div>
              <div class="bg-slate-50 rounded-xl p-3">
                <p class="text-xs text-slate-400 mb-0.5">Servicio</p>
                <p class="font-semibold text-slate-700 text-sm m-0">
                  {{ registroSeleccionado.servicio_nombre }}
                </p>
              </div>
            </div>

            <!-- Signos vitales -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-xl p-3 text-center">
                <p class="text-xs text-slate-400">Peso</p>
                <p class="font-bold text-slate-700">
                  {{
                    registroSeleccionado.peso_consulta
                      ? registroSeleccionado.peso_consulta + ' kg'
                      : '—'
                  }}
                </p>
              </div>
              <div class="bg-blue-50 rounded-xl p-3 text-center">
                <p class="text-xs text-slate-400">Temperatura</p>
                <p class="font-bold text-slate-700">
                  {{
                    registroSeleccionado.temperatura
                      ? registroSeleccionado.temperatura + ' °C'
                      : '—'
                  }}
                </p>
              </div>
            </div>

            <!-- Campos clínicos -->
            <div v-if="registroSeleccionado.sintomas" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Síntomas</p>
              <p
                class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 m-0"
              >
                {{ registroSeleccionado.sintomas }}
              </p>
            </div>
            <div v-if="registroSeleccionado.diagnostico" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Diagnóstico
              </p>
              <p
                class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 m-0"
              >
                {{ registroSeleccionado.diagnostico }}
              </p>
            </div>
            <div v-if="registroSeleccionado.tratamiento" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Tratamiento
              </p>
              <p
                class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 m-0"
              >
                {{ registroSeleccionado.tratamiento }}
              </p>
            </div>
            <div v-if="registroSeleccionado.prescripciones" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Prescripciones
              </p>
              <p
                class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 m-0"
              >
                {{ registroSeleccionado.prescripciones }}
              </p>
            </div>
            <div v-if="registroSeleccionado.observaciones" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Observaciones
              </p>
              <p
                class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 m-0"
              >
                {{ registroSeleccionado.observaciones }}
              </p>
            </div>
            <div v-if="registroSeleccionado.proxima_visita" class="flex flex-col gap-1">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Próxima visita
              </p>
              <p class="text-sm font-bold text-blue-600 m-0">
                {{ registroSeleccionado.proxima_visita }}
              </p>
            </div>
          </div>

          <div class="p-4 border-t border-slate-100">
            <button
              @click="registroSeleccionado = null"
              class="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
