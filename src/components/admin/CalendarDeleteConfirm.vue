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
    <Transition name="modal">
      <div
        v-if="show && target"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0,0,0,0.25)"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-xs w-11/12">
          <p class="text-sm font-semibold text-slate-800 m-0 mb-1">¿Eliminar este registro?</p>
          <p class="text-sm text-slate-400 m-0 mb-5 leading-relaxed">
            {{ target.type === 'day'
              ? 'Se eliminará el día y todos sus bloques en cascada. Esta acción no se puede deshacer.'
              : 'Se eliminará el bloque horario permanentemente.' }}
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="emit('close')"
              class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-transparent text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >Cancelar</button>
            <button
              @click="emit('confirm')"
              class="text-sm px-3 py-1.5 rounded-lg border-none bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
            >Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>