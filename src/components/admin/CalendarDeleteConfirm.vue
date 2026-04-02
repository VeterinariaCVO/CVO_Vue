<script setup lang="ts">
import type { DeleteTarget } from '@/types/calendar'

defineProps<{
  show: boolean
  target: DeleteTarget | null
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()
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
        v-if="show && target"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          leave-active-class="transition-all duration-150"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div v-if="show" class="w-full sm:max-w-xs bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

            <!-- Accent bar rojo -->
            <div class="h-1 w-full bg-gradient-to-r from-[#c94040] to-[#e07070]" />

            <!-- Body -->
            <div class="px-6 pt-6 pb-4 text-center">
              <!-- Icono -->
              <div class="w-12 h-12 rounded-xl bg-[#fdf0f0] text-[#c94040] flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="2 4 14 4"/>
                  <path d="M5 4V2h6v2"/><rect x="3" y="5" width="10" height="9" rx="1"/>
                  <line x1="6" y1="8" x2="6" y2="11"/><line x1="10" y1="8" x2="10" y2="11"/>
                </svg>
              </div>

              <p class="text-sm font-semibold text-[#1a1916] mb-1">¿Eliminar este registro?</p>
              <p class="text-xs text-[#a09d97] mb-3 leading-relaxed">
                {{ target.type === 'day'
                  ? 'Se eliminará el día y todos sus bloques en cascada. Esta acción no se puede deshacer.'
                  : 'Se eliminará el bloque horario permanentemente.' }}
              </p>

              <!-- Label del target -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fdf0f0] border border-[#f5c6c6] mb-5">
                <svg class="w-3 h-3 text-[#c94040] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="3" width="12" height="12" rx="2"/>
                  <line x1="2" y1="7" x2="14" y2="7"/>
                </svg>
                <span class="text-xs font-mono font-medium text-[#c94040]">{{ target.label }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex gap-2 px-6 pb-6">
              <button
                @click="emit('close')"
                class="flex-1 py-2.5 rounded-lg border border-[#e4e0d8] text-sm text-[#706e69] font-medium hover:bg-[#f5f4f0] transition-colors"
              >Cancelar</button>
              <button
                @click="emit('confirm')"
                class="flex-1 py-2.5 rounded-lg bg-[#c94040] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
              >Sí, eliminar</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>