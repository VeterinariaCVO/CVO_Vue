<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { WorkingDay, TimeSlot } from '@/types/calendar'
import CalendarDayList from '@/components/admin/CalendarDayList.vue'
import CalendarBlockGrid from '@/components/admin/CalendarBlockGrid.vue'
import CalendarDayModal from '@/components/admin/CalendarDayModal.vue'
import CalendarBlockModal from '@/components/admin/CalendarBlockModal.vue'
import CalendarDeleteConfirm from '@/components/admin/CalendarDeleteConfirm.vue'

const workingDays = ref<WorkingDay[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const selectedDay = ref<WorkingDay | null>(null)

// Day modal
const showDayModal = ref(false)
const editingDay = ref<WorkingDay | null>(null)
const dayForm = ref({ date: '', is_open: true })

// Slot modal (solo crear, no editar)
const showSlotModal = ref(false)
const slotForm = ref({ start_time: '', end_time: '' })

// Delete confirm (solo para días)
const showConfirmDelete = ref(false)
const deletingDay = ref<WorkingDay | null>(null)

// ── Helpers ────────────────────────────────────────────
function showMsg(text: string, error = false) {
  message.value = text
  isError.value = error
  setTimeout(() => (message.value = ''), 3500)
}

function syncSelectedDay(days: WorkingDay[]) {
  if (selectedDay.value) {
    selectedDay.value = days.find((d) => d.id === selectedDay.value!.id) ?? null
  }
}

// ── Load ───────────────────────────────────────────────
function loadWorkingDays() {
  isLoading.value = true
  const { data, onFetchResponse, onFetchError } = ApiUseFetch('/working-days', { immediate: true }).get().json()
  onFetchResponse(() => {
    isLoading.value = false
    workingDays.value = data.value?.data ?? []
    syncSelectedDay(workingDays.value)
  })
  onFetchError(() => {
    isLoading.value = false
    showMsg('No se pudieron cargar los días laborales', true)
  })
}

loadWorkingDays()

// ── Days ───────────────────────────────────────────────
function onCreateDay() {
  editingDay.value = null
  dayForm.value = { date: '', is_open: true }
  showDayModal.value = true
}

function onEditDay(day: WorkingDay) {
  editingDay.value = day
  dayForm.value = { date: day.date, is_open: day.is_open }
  showDayModal.value = true
}

function onSaveDay() {
  if (!dayForm.value.date) { showMsg('La fecha es obligatoria', true); return }

  const isEdit = !!editingDay.value
  const req = isEdit
    ? ApiUseFetch(`/working-days/${editingDay.value!.id}`).put(dayForm.value).json()
    : ApiUseFetch('/working-days').post(dayForm.value).json()

  req.onFetchResponse(() => {
    showDayModal.value = false
    showMsg(isEdit ? 'Día laboral actualizado' : 'Día laboral creado')
    loadWorkingDays()
  })
  req.onFetchError(() => showMsg(req.data.value?.message || 'Error al guardar el día', true))
  req.execute()
}

function onToggleDay(day: WorkingDay) {
  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/working-days/${day.id}/toggle`).patch().json()
  onFetchResponse(() => {
    showMsg(day.is_open ? 'Día deshabilitado' : 'Día habilitado')
    loadWorkingDays()
  })
  onFetchError(() => showMsg(data.value?.message || 'Error al cambiar estado del día', true))
  execute()
}

function onDeleteDay(day: WorkingDay) {
  deletingDay.value = day
  showConfirmDelete.value = true
}

function onConfirmDelete() {
  if (!deletingDay.value) return
  const id = deletingDay.value.id
  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/working-days/${id}`).delete().json()
  onFetchResponse(() => {
    showConfirmDelete.value = false
    showMsg('Día laboral eliminado')
    if (selectedDay.value?.id === id) selectedDay.value = null
    loadWorkingDays()
  })
  onFetchError(() => {
    showConfirmDelete.value = false
    showMsg(data.value?.message || 'Error al eliminar', true)
  })
  execute()
}

// ── Slots ──────────────────────────────────────────────
function onCreateSlot() {
  if (!selectedDay.value) return
  slotForm.value = { start_time: '', end_time: '' }
  showSlotModal.value = true
}

function onSaveSlot() {
  if (!slotForm.value.start_time || !slotForm.value.end_time) {
    showMsg('Hora de inicio y fin son obligatorias', true); return
  }
  if (slotForm.value.start_time >= slotForm.value.end_time) {
    showMsg('La hora de fin debe ser mayor a la de inicio', true); return
  }

  const body = { working_day_id: selectedDay.value!.id, ...slotForm.value }
  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch('/time-slots').post(body).json()
  onFetchResponse(() => { showSlotModal.value = false; showMsg('Horario creado'); loadWorkingDays() })
  onFetchError(() => showMsg(data.value?.message || 'Error al crear el horario', true))
  execute()
}

function onToggleSlot(slot: TimeSlot) {
  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/time-slots/${slot.id}/toggle`).patch().json()
  onFetchResponse(() => {
    showMsg(slot.is_open ? 'Horario deshabilitado' : 'Horario habilitado')
    loadWorkingDays()
  })
  onFetchError(() => showMsg(data.value?.message || 'Error al cambiar estado del horario', true))
  execute()
}

defineOptions({ name: 'CalendarManagementView' })
</script>

<template>
  <div class="min-h-screen bg-white p-6">

    <div class="mb-7">
      <h1 class="text-xl font-semibold tracking-tight text-[#1a1916]">Gestión de Calendario</h1>
      <p class="text-sm text-[#a09d97] mt-0.5">Administra días laborales y bloques horarios</p>
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
        :class="isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-[#e6f5ee] border-[#b2dfc7] text-[#1a8f5a]'"
      >
        <svg v-if="isError" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ message }}
      </div>
    </Transition>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CalendarDayList
        :working-days="workingDays"
        :selected-day="selectedDay"
        :is-loading="isLoading"
        @select="selectedDay = $event"
        @create="onCreateDay"
        @edit="onEditDay"
        @toggle="onToggleDay"
        @delete="onDeleteDay"
      />
      <CalendarBlockGrid
        :selected-day="selectedDay"
        @create="onCreateSlot"
        @toggle="onToggleSlot"
      />
    </div>

    <CalendarDayModal
      :show="showDayModal"
      :editing-day="editingDay"
      v-model="dayForm"
      @save="onSaveDay"
      @close="showDayModal = false"
    />

    <CalendarBlockModal
      :show="showSlotModal"
      :selected-day="selectedDay"
      v-model="slotForm"
      @save="onSaveSlot"
      @close="showSlotModal = false"
    />

    <CalendarDeleteConfirm
      :show="showConfirmDelete"
      :day="deletingDay"
      @confirm="onConfirmDelete"
      @close="showConfirmDelete = false"
    />

  </div>
</template>
