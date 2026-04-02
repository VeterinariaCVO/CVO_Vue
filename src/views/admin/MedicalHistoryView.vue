<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useAuthStore } from '@/stores/authStore'
import MedicalRecordModal from '@/components/admin/MedicalRecordModal.vue'

const auth = useAuthStore()
const mascotas = ref<any[]>([])
const mascotaSeleccionada = ref<any>(null)
const historial = ref<any[]>([])
const cargandoMascotas = ref(true)
const cargandoHistorial = ref(false)
const mostrarModal = ref(false)
const citaParaExpediente = ref<any>(null)
const citasDisponibles = ref<any[]>([])
const mensajeExito = ref('')
const busqueda = ref('')

const esVeterinario = computed(() => auth.user?.role_id === 4)
const esAdmin = computed(() => auth.user?.role_id === 1)
const esCliente = computed(() => auth.user?.role_id === 3)
const puedeEscribir = computed(() => esVeterinario.value || esAdmin.value)

async function cargarMascotas() {
  cargandoMascotas.value = true
  const url = esCliente.value ? '/pets?owner_id=' + auth.user?.id : '/pets'
  const { data, execute } = ApiUseFetch(url).get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargandoMascotas.value = false
}

async function seleccionarMascota(mascota: any) {
  mascotaSeleccionada.value = mascota
  cargandoHistorial.value = true
  historial.value = []
  const { data, execute } = ApiUseFetch(`/medical-records?pet_id=${mascota.id}`).get().json()
  await execute()
  historial.value = data.value?.data ?? []
  if (puedeEscribir.value) await cargarCitasDisponibles(mascota.id)
  cargandoHistorial.value = false
}

async function cargarCitasDisponibles(petId: number) {
  const { data, execute } = ApiUseFetch(`/appointments?pet_id=${petId}&status=confirmed,in_progress`).get().json()
  await execute()
  citasDisponibles.value = (data.value?.data ?? []).filter((c: any) =>
    c.status === 'confirmed' || c.status === 'in_progress'
  )
}

function abrirModal(cita: any) {
  citaParaExpediente.value = cita
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  citaParaExpediente.value = null
  if (mascotaSeleccionada.value) seleccionarMascota(mascotaSeleccionada.value)
  mensajeExito.value = 'Expediente registrado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
}

const mascotasFiltradas = computed(() => {
  if (!busqueda.value.trim()) return mascotas.value
  const q = busqueda.value.toLowerCase()
  return mascotas.value.filter(m =>
    m.name?.toLowerCase().includes(q) ||
    m.owner?.name?.toLowerCase().includes(q) ||
    m.species?.toLowerCase().includes(q)
  )
})

function labelEstado(status: string) {
  const map: Record<string, string> = { confirmed: 'Confirmada', in_progress: 'En progreso' }
  return map[status] ?? status
}

onMounted(cargarMascotas)
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Historial Clínico</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Consulta y registra expedientes médicos de mascotas</p>
      </div>
    </div>

    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none">×</button>
    </div>

    <div class="grid grid-cols-3 gap-5">

      <!-- Panel izquierdo: lista de mascotas -->
      <div class="col-span-1">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100">
            <p class="text-sm font-semibold text-slate-700 m-0 mb-2">Mascotas</p>
            <div class="relative">
              <svg class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
              <input v-model="busqueda" type="text" placeholder="Buscar mascota..." class="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#1d6bbf] transition-colors bg-slate-50" />
            </div>
          </div>

          <div v-if="cargandoMascotas" class="text-sm text-slate-400 text-center py-8">Cargando...</div>
          <div v-else-if="mascotasFiltradas.length === 0" class="text-sm text-slate-400 text-center py-8">Sin mascotas registradas.</div>

          <div v-else class="divide-y divide-slate-50 max-h-[calc(100vh-280px)] overflow-y-auto">
            <button
              v-for="mascota in mascotasFiltradas"
              :key="mascota.id"
              @click="seleccionarMascota(mascota)"
              class="w-full flex items-center gap-3 px-4 py-3 text-left border-none cursor-pointer transition-colors"
              :class="mascotaSeleccionada?.id === mascota.id ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'"
            >
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <img v-if="mascota.photo_url" :src="mascota.photo_url" class="w-9 h-9 rounded-full object-cover" />
                <svg v-else class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-800 m-0 truncate">{{ mascota.name }}</p>
                <p class="text-xs text-slate-400 m-0 truncate">{{ mascota.species }} · {{ mascota.owner?.name ?? '—' }}</p>
              </div>
              <div v-if="mascotaSeleccionada?.id === mascota.id" class="ml-auto shrink-0">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1d6bbf]"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: historial -->
      <div class="col-span-2">

        <!-- Sin mascota seleccionada -->
        <div v-if="!mascotaSeleccionada" class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-20 text-center">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="text-sm text-slate-500 m-0">Selecciona una mascota para ver su historial</p>
        </div>

        <div v-else>
          <!-- Header mascota seleccionada -->
          <div class="bg-white rounded-xl border border-slate-200 p-5 mb-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <img v-if="mascotaSeleccionada.photo_url" :src="mascotaSeleccionada.photo_url" class="w-12 h-12 rounded-full object-cover" />
                <svg v-else class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-semibold text-slate-800 m-0">{{ mascotaSeleccionada.name }}</h2>
                <p class="text-sm text-slate-400 m-0">{{ mascotaSeleccionada.species }} · {{ mascotaSeleccionada.breed ?? 'Sin raza' }} · Dueño: {{ mascotaSeleccionada.owner?.name ?? '—' }}</p>
              </div>
              <span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{{ historial.length }} expedientes</span>
            </div>

            <!-- Citas disponibles para registrar (solo vet/admin) -->
            <div v-if="puedeEscribir && citasDisponibles.length > 0" class="mt-4 pt-4 border-t border-slate-100">
              <p class="text-xs font-medium text-slate-500 mb-2">Citas listas para registrar expediente:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cita in citasDisponibles"
                  :key="cita.id"
                  @click="abrirModal(cita)"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1d6bbf] hover:bg-blue-700 text-white text-xs border-none cursor-pointer transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
                  </svg>
                  Registrar expediente — {{ cita.service?.name }} ({{ labelEstado(cita.status) }})
                </button>
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div v-if="cargandoHistorial" class="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"></div>
          </div>

          <div v-else-if="historial.length === 0" class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-14 text-center">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-sm text-slate-400 m-0">Sin expedientes médicos registrados.</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="expediente in historial"
              :key="expediente.id"
              class="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm font-semibold text-slate-800 m-0">{{ expediente.appointment?.service?.name ?? 'Consulta' }}</p>
                  <p class="text-xs text-slate-400 mt-0.5 m-0">{{ expediente.created_at?.slice(0, 10) }} · Dr. {{ expediente.veterinarian?.name ?? '—' }}</p>
                </div>
                <span class="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md">Completada</span>
              </div>

              <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div v-if="expediente.weight">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Peso</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.weight }} kg</p>
                </div>
                <div v-if="expediente.temperature">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Temperatura</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.temperature }} °C</p>
                </div>
                <div v-if="expediente.symptoms" class="col-span-2">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Síntomas</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.symptoms }}</p>
                </div>
                <div v-if="expediente.diagnosis" class="col-span-2">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Diagnóstico</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.diagnosis }}</p>
                </div>
                <div v-if="expediente.treatment" class="col-span-2">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Tratamiento</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.treatment }}</p>
                </div>
                <div v-if="expediente.prescription" class="col-span-2">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Receta</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.prescription }}</p>
                </div>
                <div v-if="expediente.observations" class="col-span-2">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Observaciones</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.observations }}</p>
                </div>
                <div v-if="expediente.next_visit">
                  <p class="text-xs text-slate-400 m-0 mb-0.5">Próxima visita sugerida</p>
                  <p class="text-sm text-slate-800 m-0">{{ expediente.next_visit }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <MedicalRecordModal
    v-if="mostrarModal && citaParaExpediente"
    :cita="citaParaExpediente"
    @cerrar="mostrarModal = false; citaParaExpediente = null"
    @guardado="cerrarModal"
  />
</template>