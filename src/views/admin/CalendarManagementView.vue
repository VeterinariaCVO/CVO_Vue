<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { WorkingDay } from '@/types/calendar'

const workingDays = ref<WorkingDay[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const selectedDay = ref<WorkingDay | null>(null)
const showMonthModal = ref(false)
const monthForm = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030]
const filterYear = ref(new Date().getFullYear())
const filterMonth = ref(new Date().getMonth() + 1)
const selectedFilter = ref('')

const filteredDays = computed(() => workingDays.value)

function showMsg(text: string, error = false) {
  message.value = text
  isError.value = error
  setTimeout(() => (message.value = ''), 3500)
}

function syncSelectedDay(days: WorkingDay[]) {
  if (selectedDay.value)
    selectedDay.value = days.find((d) => d.id === selectedDay.value!.id) ?? null
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateLong(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isPastDay(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}

function isPastSlot(dateStr: string, startTime: string): boolean {
  const now = new Date()
  const [rawH, rawM] = startTime.split(':')
  const h = Number(rawH ?? 0)
  const m = Number(rawM ?? 0)
  const slotDateTime = new Date(dateStr + 'T00:00:00')
  slotDateTime.setHours(h, m, 0, 0)
  return slotDateTime <= now
}

function loadWorkingDays(year?: number, month?: number) {
  isLoading.value = true
  const y = year ?? new Date().getFullYear()
  const m = month ?? new Date().getMonth() + 1

  const { data, onFetchResponse, onFetchError } = ApiUseFetch(
    `admin/working-days?year=${y}&month=${m}`,
    { immediate: true },
  )
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    workingDays.value = Array.isArray(data.value) ? data.value : (data.value?.data ?? [])
    syncSelectedDay(workingDays.value)
  })

  onFetchError(() => {
    isLoading.value = false
    showMsg('Error cargando días', true)
  })
}

const today = new Date()
filterYear.value = today.getFullYear()
filterMonth.value = today.getMonth() + 1
selectedFilter.value = `${filterYear.value}-${String(filterMonth.value).padStart(2, '0')}`
loadWorkingDays()

function onSelectMonth() {
  selectedFilter.value = `${filterYear.value}-${String(filterMonth.value).padStart(2, '0')}`
  selectedDay.value = null
  loadWorkingDays(filterYear.value, filterMonth.value)
}

function onGenerateMonth() {
  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(
    'admin/working-days/generate-month',
    {
      immediate: false,
      beforeFetch({ options }) {
        options.body = JSON.stringify(monthForm.value)
        return { options }
      },
    },
  )
    .post()
    .json()

  onFetchResponse(() => {
    showMonthModal.value = false
    showMsg(
      data.value?.message ||
        `Mes generado: ${MONTHS[monthForm.value.month - 1]} ${monthForm.value.year}`,
    )
    filterYear.value = monthForm.value.year
    filterMonth.value = monthForm.value.month
    selectedFilter.value = `${filterYear.value}-${String(filterMonth.value).padStart(2, '0')}`
    loadWorkingDays(monthForm.value.year, monthForm.value.month)
  })

  onFetchError(() => showMsg('Error al generar mes', true))
  execute()
}

function onToggleDay(day: WorkingDay) {
  const { onFetchResponse, onFetchError, execute } = ApiUseFetch(
    `admin/working-days/${day.id}/toggle-open`,
  )
    .patch()
    .json()

  onFetchResponse(() => {
    showMsg(day.is_open ? 'Día deshabilitado' : 'Día habilitado')
    loadWorkingDays(filterYear.value, filterMonth.value)
  })

  onFetchError(() => showMsg('Error al cambiar estado del día', true))
  execute()
}

function onToggleSlot(id: number, state: boolean) {
  const { onFetchResponse, onFetchError, execute } = ApiUseFetch(
    `admin/time-slots/${id}/toggle-open`,
  )
    .patch()
    .json()

  onFetchResponse(() => {
    showMsg(state ? 'Bloque deshabilitado' : 'Bloque habilitado')
    loadWorkingDays(filterYear.value, filterMonth.value)
  })

  onFetchError(() => showMsg('Error al cambiar estado del bloque', true))
  execute()
}

defineOptions({ name: 'CalendarManagementView' })
</script>

<template>
  <div class="min-h-screen bg-white p-6">
    <!-- Título -->
    <div class="mb-7 flex items-start justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight text-[#1a1916]">Gestión de Calendario</h1>
        <p class="text-sm text-[#a09d97] mt-0.5">Habilita meses y administra bloques horarios</p>
      </div>
      <button
        @click="showMonthModal = true"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d5be3] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
        Habilitar mes
      </button>
    </div>
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="message"
        class="mb-5 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 border"
        :class="
          isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-[#e6f5ee] border-[#b2dfc7] text-[#1a8f5a]'
        "
      >
        <svg
          v-if="isError"
          class="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <svg
          v-else
          class="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ message }}
      </div>
    </Transition>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Panel izquierdo -->
      <div class="bg-white border border-[#e4e0d8] rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e4e0d8] space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-[#1a1916]">Días Laborales</p>
            <span class="text-[11px] text-[#a09d97]">{{ filteredDays.length }} días</span>
          </div>
          <div class="flex gap-2">
            <select
              v-model="filterMonth"
              @change="onSelectMonth"
              class="flex-1 px-3 py-2 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] outline-none focus:border-[#2d5be3] transition-all"
            >
              <option v-for="(name, i) in MONTHS" :key="i" :value="i + 1">{{ name }}</option>
            </select>
            <select
              v-model="filterYear"
              @change="onSelectMonth"
              class="w-24 px-3 py-2 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] outline-none focus:border-[#2d5be3] transition-all"
            >
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <div v-if="isLoading" class="flex justify-center py-14">
          <div
            class="w-6 h-6 border-2 border-[#e4e0d8] border-t-[#2d5be3] rounded-full animate-spin"
          />
        </div>

        <div v-else-if="workingDays.length === 0" class="py-14 text-center">
          <svg
            class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p class="text-xs text-[#a09d97]">No hay días laborales registrados</p>
          <p class="text-[11px] text-[#c5c1bb] mt-0.5">Habilita un mes para comenzar</p>
        </div>
        <div v-else class="overflow-y-auto max-h-[520px] divide-y divide-[#f0ede8]">
          <div
            v-for="day in filteredDays"
            :key="day.id"
            @click="selectedDay = day"
            class="group flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors relative"
            :class="selectedDay?.id === day.id ? 'bg-[#eef1fd]' : 'hover:bg-[#f5f4f0]'"
          >
            <span
              v-if="selectedDay?.id === day.id"
              class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2d5be3] rounded-r"
            />

            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="day.is_open ? 'bg-[#eef1fd] text-[#2d5be3]' : 'bg-[#f0ede8] text-[#a09d97]'"
            >
              <svg
                class="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="2" y="3" width="12" height="12" rx="2" />
                <line x1="2" y1="7" x2="14" y2="7" />
                <line x1="5" y1="1" x2="5" y2="5" />
                <line x1="11" y1="1" x2="11" y2="5" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1a1916] capitalize truncate">
                {{ formatDate(day.date) }}
              </p>
              <div class="flex items-center gap-2 mt-0.5">
                <span
                  class="text-[10.5px] font-medium px-1.5 py-0.5 rounded-full border"
                  :class="
                    day.is_open
                      ? 'bg-[#e6f5ee] text-[#1a8f5a] border-[#b2dfc7]'
                      : 'bg-[#f0ede8] text-[#706e69] border-[#d0ccc5]'
                  "
                >
                  {{ day.is_open ? 'Abierto' : 'Cerrado' }}
                </span>
                <span class="text-[11px] text-[#a09d97]">
                  {{ day.time_slots.filter((s) => s.is_open).length }}/{{
                    day.time_slots.length
                  }}
                  bloques activos
                </span>
              </div>
            </div>
            <button
              @click.stop="onToggleDay(day)"
              :disabled="isPastDay(day.date)"
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
              :class="day.is_open ? 'bg-[#2d5be3]' : 'bg-[#d0ccc5]'"
            >
              <span
                class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="day.is_open ? 'translate-x-4' : 'translate-x-0.5'"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="bg-white border border-[#e4e0d8] rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e4e0d8]">
          <p class="text-sm font-semibold text-[#1a1916]">Bloques Horarios</p>
          <p class="text-xs text-[#a09d97] mt-0.5 capitalize">
            {{ selectedDay ? formatDateLong(selectedDay.date) : 'Selecciona un día primero' }}
          </p>
        </div>

        <div v-if="!selectedDay" class="py-16 text-center">
          <svg
            class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p class="text-xs text-[#a09d97]">Selecciona un día para ver sus bloques</p>
        </div>

        <div v-else-if="selectedDay.time_slots.length === 0" class="py-16 text-center">
          <svg
            class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p class="text-xs text-[#a09d97]">No hay bloques para este día</p>
        </div>

        <div v-else class="p-4 overflow-y-auto max-h-[520px]">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in selectedDay.time_slots"
              :key="slot.id"
              @click="
                !isPastSlot(selectedDay.date, slot.start_time) &&
                onToggleSlot(slot.id, slot.is_open)
              "
              :disabled="
                slot.status === 'reserved' || isPastSlot(selectedDay.date, slot.start_time)
              "
              class="relative border rounded-lg px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:hover:scale-100"
              :class="
                isPastSlot(selectedDay.date, slot.start_time)
                  ? 'bg-[#f5f4f0] border-[#e4e0d8] opacity-40'
                  : slot.is_open
                    ? slot.status === 'reserved'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-[#e6f5ee] border-[#b2dfc7] hover:scale-[1.02] active:scale-95'
                    : 'bg-[#f5f4f0] border-[#e4e0d8] opacity-60 hover:scale-[1.02] active:scale-95'
              "
            >
              <p class="text-sm font-medium font-mono text-[#1a1916]">
                {{ slot.start_time.slice(0, 5) }}
              </p>
              <p
                class="text-[10px] mt-0.5"
                :class="
                  isPastSlot(selectedDay.date, slot.start_time)
                    ? 'text-[#c5c1bb]'
                    : !slot.is_open
                      ? 'text-[#a09d97]'
                      : slot.status === 'reserved'
                        ? 'text-amber-600'
                        : 'text-[#1a8f5a]'
                "
              >
                {{
                  isPastSlot(selectedDay.date, slot.start_time)
                    ? 'Pasado'
                    : !slot.is_open
                      ? 'Deshabilitado'
                      : slot.status === 'reserved'
                        ? 'Reservado'
                        : 'Disponible'
                }}
              </p>
              <span
                class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                :class="
                  isPastSlot(selectedDay.date, slot.start_time)
                    ? 'bg-[#e4e0d8]'
                    : slot.is_open
                      ? slot.status === 'reserved'
                        ? 'bg-amber-400'
                        : 'bg-[#1a8f5a]'
                      : 'bg-[#d0ccc5]'
                "
              />
            </button>
          </div>
          <div class="mt-4 flex flex-wrap gap-3 text-[11px] text-[#a09d97]">
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-[#1a8f5a]" /> Disponible</span
            >
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-amber-400" /> Reservado</span
            >
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-[#d0ccc5]" /> Deshabilitado</span
            >
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-[#e4e0d8]" /> Pasado</span
            >
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-all duration-150"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMonthModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          @click.self="showMonthModal = false"
        >
          <div
            class="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
          >
            <div class="h-1 w-full bg-gradient-to-r from-[#2d5be3] to-[#6b8ef0]" />
            <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
              <div>
                <p class="text-sm font-semibold text-[#1a1916]">Habilitar mes</p>
                <p class="text-xs text-[#a09d97] mt-0.5">
                  Se generarán los días hábiles (lun–vie) con bloques de 30 min
                </p>
              </div>
              <button
                @click="showMonthModal = false"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-[#c5c1bb] hover:bg-[#f5f4f0] transition-colors"
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="13" y1="3" x2="3" y2="13" />
                  <line x1="3" y1="3" x2="13" y2="13" />
                </svg>
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label
                  class="block text-[11px] font-semibold text-[#706e69] uppercase tracking-wider mb-2"
                  >Mes</label
                >
                <select
                  v-model="monthForm.month"
                  class="w-full px-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] outline-none focus:border-[#2d5be3] transition-all"
                >
                  <option v-for="(name, i) in MONTHS" :key="i" :value="i + 1">{{ name }}</option>
                </select>
              </div>
              <div>
                <label
                  class="block text-[11px] font-semibold text-[#706e69] uppercase tracking-wider mb-2"
                  >Año</label
                >
                <select
                  v-model.number="monthForm.year"
                  class="w-full px-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] outline-none focus:border-[#2d5be3] transition-all"
                >
                  <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
              <p class="text-[11px] text-[#a09d97] flex items-center gap-1.5">
                <svg
                  class="w-3 h-3 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="8" cy="8" r="6" />
                  <line x1="8" y1="5" x2="8" y2="8" />
                  <line x1="8" y1="10.5" x2="8.01" y2="10.5" />
                </svg>
                Los días que ya existan serán omitidos automáticamente
              </p>
            </div>
            <div class="flex gap-2 px-6 pb-6">
              <button
                @click="showMonthModal = false"
                class="flex-1 py-2.5 rounded-lg border border-[#e4e0d8] text-sm text-[#706e69] font-medium hover:bg-[#f5f4f0] transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="onGenerateMonth"
                class="flex-1 py-2.5 rounded-lg bg-[#2d5be3] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
              >
                Generar mes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
