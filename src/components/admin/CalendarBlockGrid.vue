<script setup lang="ts">
import type { WorkingDay, TimeSlot } from '@/types/calendar'

const props = defineProps<{
  selectedDay: WorkingDay | null
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', slot: TimeSlot): void
  (e: 'delete', slot: TimeSlot): void
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
        <p class="text-sm font-semibold text-[#1a1916]">Bloques Horarios</p>
        <p class="text-xs text-[#a09d97] mt-0.5 capitalize">
          {{ selectedDay ? formatDate(selectedDay.date) : 'Selecciona un día primero' }}
        </p>
      </div>
      <button
        v-if="selectedDay"
        @click="emit('create')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2d5be3] text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
        </svg>
        Nuevo bloque
      </button>
    </div>

    <!-- No day selected -->
    <div v-if="!selectedDay" class="py-16 text-center">
      <svg class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p class="text-xs text-[#a09d97]">Selecciona un día para ver sus horarios</p>
    </div>

    <!-- Empty slots -->
    <div v-else-if="selectedDay.time_slots.length === 0" class="py-16 text-center">
      <svg class="w-8 h-8 mx-auto mb-2 text-[#d0ccc5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p class="text-xs text-[#a09d97]">No hay bloques para este día</p>
      <p class="text-[11px] text-[#c5c1bb] mt-0.5">Agrega el primer bloque horario</p>
    </div>

    <!-- Slots grid -->
    <div v-else class="p-4 overflow-y-auto max-h-130">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="slot in selectedDay.time_slots"
          :key="slot.id"
          class="group relative border rounded-lg px-3 py-2.5 transition-colors"
          :class="slot.status === 'available'
            ? 'bg-[#e6f5ee] border-[#b2dfc7]'
            : 'bg-amber-50 border-amber-200'"
        >
          <p class="text-sm font-medium font-mono text-[#1a1916]">
            {{ slot.start_time.slice(0, 5) }} – {{ slot.end_time.slice(0, 5) }}
          </p>
          <p
            class="text-[10.5px] mt-0.5"
            :class="slot.status === 'available' ? 'text-[#1a8f5a]' : 'text-amber-600'"
          >
            {{ slot.status === 'available' ? 'Disponible' : 'Reservado' }}
          </p>

          <!-- Hover actions -->
          <div class="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="emit('edit', slot)"
              class="w-6 h-6 rounded flex items-center justify-center bg-white/80 text-[#706e69] hover:text-[#2d5be3] transition-colors"
              title="Editar"
            >
              <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"/>
              </svg>
            </button>
            <button
              @click="emit('delete', slot)"
              class="w-6 h-6 rounded flex items-center justify-center bg-white/80 text-[#706e69] hover:text-[#c94040] transition-colors"
              title="Eliminar"
            >
              <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="2 4 14 4"/>
                <path d="M5 4V2h6v2"/><rect x="3" y="5" width="10" height="9" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>