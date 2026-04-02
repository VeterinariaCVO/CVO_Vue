<script setup lang="ts">
import type { WorkingDay } from '@/types/calendar'

const props = defineProps<{
  workingDays: WorkingDay[]
  selectedDay: WorkingDay | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'select', day: WorkingDay): void
  (e: 'create'): void
  (e: 'edit', day: WorkingDay): void
  (e: 'toggle', day: WorkingDay): void
  (e: 'delete', day: WorkingDay): void
}>()

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  return dt.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="bg-white border border-[#e4e0d8] rounded-xl overflow-hidden">

    <!-- Header -->
    <div class="flex items-start justify-between px-5 py-4 border-b border-[#e4e0d8]">
      <div>
        <p class="text-sm font-semibold text-[#1a1916]">Días Laborales</p>
        <p class="text-xs text-[#a09d97] mt-0.5">Selecciona uno para ver sus horarios</p>
      </div>
      <button
        @click="emit('create')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2d5be3] text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
        </svg>
        Nuevo día
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-14">
      <div class="w-6 h-6 border-2 border-[#e4e0d8] border-t-[#2d5be3] rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="workingDays.length === 0" class="py-14 text-center">
      <svg class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <p class="text-xs text-[#a09d97]">No hay días laborales registrados</p>
    </div>

    <!-- List -->
    <div v-else class="overflow-y-auto max-h-[520px] divide-y divide-[#f0ede8]">
      <div
        v-for="day in workingDays"
        :key="day.id"
        @click="emit('select', day)"
        class="group flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors relative"
        :class="selectedDay?.id === day.id ? 'bg-[#eef1fd]' : 'hover:bg-[#f5f4f0]'"
      >
        <!-- Selected indicator -->
        <span v-if="selectedDay?.id === day.id" class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2d5be3] rounded-r" />

        <!-- Icon -->
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="day.is_open ? 'bg-[#eef1fd] text-[#2d5be3]' : 'bg-[#f0ede8] text-[#a09d97]'"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="12" height="12" rx="2"/>
            <line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="1" x2="5" y2="5"/><line x1="11" y1="1" x2="11" y2="5"/>
          </svg>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-[#1a1916] capitalize truncate">{{ formatDate(day.date) }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              class="text-[10.5px] font-medium px-1.5 py-0.5 rounded-full border font-mono"
              :class="day.is_open
                ? 'bg-[#e6f5ee] text-[#1a8f5a] border-[#b2dfc7]'
                : 'bg-[#f0ede8] text-[#706e69] border-[#d0ccc5]'"
            >
              {{ day.is_open ? 'Abierto' : 'Cerrado' }}
            </span>
            <span class="text-[11px] text-[#a09d97]">
              {{ day.time_slots.length }} bloque{{ day.time_slots.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
          <button
            @click="emit('toggle', day)"
            class="w-7 h-7 rounded-md flex items-center justify-center text-[#a09d97] hover:text-[#2d5be3] hover:bg-[#eef1fd] transition-colors"
            :title="day.is_open ? 'Cerrar día' : 'Abrir día'"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path v-if="day.is_open" d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <path v-else d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
          </button>
          <button
            @click="emit('edit', day)"
            class="w-7 h-7 rounded-md flex items-center justify-center text-[#a09d97] hover:text-[#2d5be3] hover:bg-[#eef1fd] transition-colors"
            title="Editar día"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"/>
            </svg>
          </button>
          <button
            @click="emit('delete', day)"
            class="w-7 h-7 rounded-md flex items-center justify-center text-[#a09d97] hover:text-[#c94040] hover:bg-[#fdf0f0] transition-colors"
            title="Eliminar día"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="2 4 14 4"/>
              <path d="M5 4V2h6v2"/><rect x="3" y="5" width="10" height="9" rx="1"/>
              <line x1="6" y1="8" x2="6" y2="11"/><line x1="10" y1="8" x2="10" y2="11"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>