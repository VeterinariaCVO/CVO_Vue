<script setup lang="ts">
import type { WorkingDay } from '@/types/calendar'

const props = defineProps<{
  show: boolean
  editingDay: WorkingDay | null
  modelValue: { date: string; is_open: boolean }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: { date: string; is_open: boolean }): void
  (e: 'save'): void
  (e: 'close'): void
}>()

function update(patch: Partial<{ date: string; is_open: boolean }>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
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
            <div class="h-1 w-full bg-gradient-to-r from-[#2d5be3] to-[#6b8ef0]" />

            <!-- Header -->
            <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
              <div>
                <p class="text-sm font-semibold text-[#1a1916]">
                  {{ editingDay ? 'Editar día laboral' : 'Nuevo día laboral' }}
                </p>
                <p class="text-xs text-[#a09d97] mt-0.5">
                  {{ editingDay ? 'Modifica la fecha o el estado' : 'Ingresa la fecha del nuevo día' }}
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
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#706e69] uppercase tracking-wider mb-2">
                  Fecha <span class="text-[#c94040]">*</span>
                </label>
                <input
                  :value="modelValue.date"
                  @input="update({ date: ($event.target as HTMLInputElement).value })"
                  type="date"
                  class="w-full px-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#fafaf9] text-sm text-[#1a1916] outline-none focus:border-[#2d5be3] focus:ring-2 focus:ring-[#2d5be3]/10 transition-all"
                />
              </div>

              <div class="flex items-center justify-between p-3.5 rounded-lg bg-[#f5f4f0] border border-[#e4e0d8]">
                <div>
                  <p class="text-sm font-medium text-[#1a1916]">Estado del día</p>
                  <p class="text-xs text-[#a09d97] mt-0.5">
                    {{ modelValue.is_open ? 'Abierto — se permiten citas' : 'Cerrado — sin citas' }}
                  </p>
                </div>
                <button
                  type="button"
                  @click="update({ is_open: !modelValue.is_open })"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0"
                  :class="modelValue.is_open ? 'bg-[#2d5be3]' : 'bg-[#d0ccc5]'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                    :class="modelValue.is_open ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex gap-2 px-6 pb-6">
              <button
                @click="emit('close')"
                class="flex-1 py-2.5 rounded-lg border border-[#e4e0d8] text-sm text-[#706e69] font-medium hover:bg-[#f5f4f0] transition-colors"
              >Cancelar</button>
              <button
                @click="emit('save')"
                class="flex-1 py-2.5 rounded-lg bg-[#2d5be3] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
              >{{ editingDay ? 'Guardar cambios' : 'Crear día' }}</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>