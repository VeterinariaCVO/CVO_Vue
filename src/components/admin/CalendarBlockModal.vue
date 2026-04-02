<script setup lang="ts">
import type { WorkingDay, TimeSlot } from '@/types/calendar'

const props = defineProps<{
  show: boolean
  editingSlot: TimeSlot | null
  selectedDay: WorkingDay | null
  modelValue: { start_time: string; end_time: string }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: { start_time: string; end_time: string }): void
  (e: 'save'): void
  (e: 'close'): void
}>()

function update(patch: Partial<{ start_time: string; end_time: string }>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  return dt.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-all duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          leave-active-class="transition-all duration-150"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-if="show" class="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

            <!-- Accent bar -->
            <div class="h-1 w-full bg-linear-to-r from-[#1a8f5a] to-[#4db88a]" />

            <!-- Header -->
            <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
              <div>
                <p class="text-sm font-semibold text-[#1a1916]">
                  {{ editingSlot ? 'Editar bloque horario' : 'Nuevo bloque horario' }}
                </p>
                <p class="text-xs text-[#a09d97] mt-0.5 capitalize">
                  {{ selectedDay ? formatDate(selectedDay.date) : '' }}
                </p>
              </div>
              <button
                @click="emit('close')"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-[#c5c1bb] hover:text-[#706e69] hover:bg-[#f5f4f0] transition-colors"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="13" y1="3" x2="3" y2="13"/><line x1="3" y1="3" x2="13" y2="13"/>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">

              <!-- Time range visual -->
              <div class="flex items-center gap-3 mb-5">
                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-[#706e69] uppercase tracking-wider mb-2">
                    Inicio <span class="text-[#c94040]">*</span>
                  </label>
                  <input
                    :value="modelValue.start_time"
                    @input="update({ start_time: ($event.target as HTMLInputElement).value })"
                    type="time"
                    class="w-full px-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] font-mono outline-none focus:border-[#1a8f5a] focus:ring-2 focus:ring-[#1a8f5a]/10 transition-all"
                  />
                </div>

                <!-- Arrow separator -->
                <div class="mt-5 shrink-0 text-[#d0ccc5]">
                  <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                    <line x1="2" y1="8" x2="14" y2="8"/>
                    <polyline points="10 4 14 8 10 12"/>
                  </svg>
                </div>

                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-[#706e69] uppercase tracking-wider mb-2">
                    Fin <span class="text-[#c94040]">*</span>
                  </label>
                  <input
                    :value="modelValue.end_time"
                    @input="update({ end_time: ($event.target as HTMLInputElement).value })"
                    type="time"
                    class="w-full px-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] font-mono outline-none focus:border-[#1a8f5a] focus:ring-2 focus:ring-[#1a8f5a]/10 transition-all"
                  />
                </div>
              </div>

              <!-- Hint -->
              <p class="text-[11px] text-[#a09d97] flex items-center gap-1.5">
                <svg class="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><line x1="8" y1="10.5" x2="8.01" y2="10.5"/>
                </svg>
                La hora fin debe ser mayor a la de inicio
              </p>
            </div>

            <!-- Footer -->
            <div class="flex gap-2 px-6 pb-6">
              <button
                @click="emit('close')"
                class="flex-1 py-2.5 rounded-lg border border-[#e4e0d8] text-sm text-[#706e69] font-medium hover:bg-[#f5f4f0] transition-colors"
              >Cancelar</button>
              <button
                @click="emit('save')"
                class="flex-1 py-2.5 rounded-lg bg-[#1a8f5a] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
              >{{ editingSlot ? 'Guardar cambios' : 'Crear bloque' }}</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>