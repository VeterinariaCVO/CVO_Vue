<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const appointments = ref<any[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const filterStatus = ref('all')
const showModal = ref(false)
const selectedApp = ref<any | null>(null)

const form = ref({
  appointment_id: null as number | null,
  weight: '',
  temperature: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescriptions: '',
  observations: '',
})

function loadAppointments() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError } = ApiUseFetch('/appointments', {
    immediate: true,
  })
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    appointments.value = data.value?.data ?? []
  })

  onFetchError(() => {
    isLoading.value = false
    showMsg('No se pudieron cargar las citas', true)
  })
}

loadAppointments()

const filtered = computed(() => {
  if (filterStatus.value === 'all') return appointments.value
  return appointments.value.filter((a) => a.status === filterStatus.value)
})

function openModal(appointment: any) {
  selectedApp.value = appointment
  form.value = {
    appointment_id: appointment.cita_id,
    weight: '',
    temperature: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    observations: '',
  }
  showModal.value = true
}

function saveRecord() {
  if (!form.value.diagnosis.trim()) {
    showMsg('El diagnóstico es obligatorio', true)
    return
  }

  const body: Record<string, any> = {
    appointment_id: form.value.appointment_id,
    diagnosis: form.value.diagnosis,
    treatment: form.value.treatment || null,
  }

  if (form.value.weight) body.weight = form.value.weight
  if (form.value.temperature) body.temperature = form.value.temperature
  if (form.value.symptoms) body.symptoms = form.value.symptoms
  if (form.value.prescriptions) body.prescriptions = form.value.prescriptions
  if (form.value.observations) body.observations = form.value.observations

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch('/medical-records')
    .post(body)
    .json()

  onFetchResponse(() => {
    showModal.value = false
    showMsg('Expediente registrado correctamente ✓', false)
    loadAppointments()
  })

  onFetchError(() => {
    showMsg(data.value?.message || 'Error al guardar el expediente', true)
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

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; classes: string }> = {
    confirmed: { label: 'Confirmada', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
    in_progress: {
      label: 'En progreso',
      classes: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    },
    completed: { label: 'Completada', classes: 'bg-green-50 text-green-600 border-green-200' },
    cancelled: { label: 'Cancelada', classes: 'bg-red-50 text-red-400 border-red-200' },
  }
  return map[status] ?? { label: status, classes: 'bg-slate-100 text-slate-500 border-slate-200' }
}

defineOptions({ name: 'VetAgenda' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-700">Mi Agenda</h1>
      <p class="text-sm text-slate-400 mt-0.5">Consulta y gestiona tus citas del día</p>
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

    <div class="flex gap-2 mb-5 flex-wrap">
      <button
        v-for="f in [
          { value: 'all', label: 'Todas' },
          { value: 'confirmed', label: 'Confirmadas' },
          { value: 'in_progress', label: 'En progreso' },
          { value: 'completed', label: 'Completadas' },
        ]"
        :key="f.value"
        @click="filterStatus = f.value"
        class="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150"
        :class="
          filterStatus === f.value
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
        "
      >
        {{ f.label }}
        <span
          class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
          :class="
            filterStatus === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
          "
        >
          {{
            f.value === 'all'
              ? appointments.length
              : appointments.filter((a) => a.status === f.value).length
          }}
        </span>
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div
        class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"
      ></div>
    </div>

    <div v-else class="space-y-4">
      <div v-if="filtered.length === 0" class="text-center py-16 text-slate-400">
        <p class="text-4xl mb-3">📅</p>
        <p class="font-medium">No hay citas en esta categoría</p>
      </div>

      <div
        v-for="apt in filtered"
        :key="apt.cita_id"
        class="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex gap-4 items-start">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              :class="apt.is_walk_in ? 'bg-orange-50' : 'bg-blue-50'"
            >
              {{ apt.is_walk_in ? '🚶' : '📋' }}
            </div>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-slate-800 text-base">{{ apt.mascota }}</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full border font-semibold"
                  :class="statusLabel(apt.status).classes"
                >
                  {{ statusLabel(apt.status).label }}
                </span>
                <span
                  v-if="apt.is_walk_in"
                  class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full font-semibold"
                >
                  Walk-in
                </span>
              </div>

              <p class="text-sm text-slate-500 mt-0.5">
                👤 {{ apt.dueño }}
                <span class="text-slate-300 mx-1">·</span>
                📞 {{ apt.telefono }}
              </p>

              <p class="text-sm text-slate-500">
                🩺 {{ apt.servicio }}
                <span class="text-slate-300 mx-1">·</span>
                ${{ Number(apt.precio).toFixed(2) }}
              </p>

              <p class="text-sm text-slate-400 mt-1">
                📅 {{ formatDate(apt.fecha) }}
                <span class="text-slate-300 mx-1">·</span>
                🕐 {{ apt.hora_inicio?.slice(0, 5) }} – {{ apt.hora_fin?.slice(0, 5) }}
              </p>

              <p v-if="apt.notes" class="text-xs text-slate-400 mt-1 italic">"{{ apt.notes }}"</p>
            </div>
          </div>

          <div class="sm:shrink-0">
            <button
              v-if="apt.status !== 'completed'"
              @click="openModal(apt)"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-500 to-blue-700 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              📝 Registrar expediente
            </button>
            <span
              v-else
              class="inline-flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-xl"
            >
              ✓ Expediente registrado
            </span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal && selectedApp"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style="background: rgba(15, 30, 60, 0.5); backdrop-filter: blur(4px)"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative my-4">
          <button
            @click="showModal = false"
            class="absolute top-5 right-5 text-slate-300 hover:text-slate-500 text-xl"
          >
            ✕
          </button>

          <h2 class="text-xl font-bold text-blue-700 mb-1">Nuevo Expediente Médico</h2>
          <p class="text-sm text-slate-400 mb-5">
            Cita #{{ selectedApp.cita_id }} · {{ selectedApp.mascota }} · {{ selectedApp.servicio }}
          </p>

          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Mascota</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">{{ selectedApp.mascota }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Dueño</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">{{ selectedApp.dueño }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Servicio</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">{{ selectedApp.servicio }}</p>
            </div>
          </div>

          <div class="space-y-4">
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
                placeholder="Describe los síntomas..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5"
                >Diagnóstico <span class="text-red-400">*</span></label
              >
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
                <label class="block text-sm font-semibold text-slate-600 mb-1.5"
                  >Prescripciones</label
                >
                <textarea
                  v-model="form.prescriptions"
                  rows="2"
                  placeholder="Medicamentos..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Observaciones</label>
              <textarea
                v-model="form.observations"
                rows="2"
                placeholder="Observaciones generales..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-blue-50/40 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="saveRecord"
              class="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Guardar expediente
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
