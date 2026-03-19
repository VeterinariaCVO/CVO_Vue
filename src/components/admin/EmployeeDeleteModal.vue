<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Eliminar Empleado</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>
      <div class="px-6 py-5">
        <p class="text-sm text-gray-700 leading-relaxed">
          ¿Desea eliminar a <strong>{{ employee?.name }}</strong>? Esta accion no se puede deshacer.
        </p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">Cancelar</button>
        <button @click="$emit('confirm')" :disabled="loading" class="btn-delete">
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Eliminando...' : 'Si, eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'
defineProps<{ open: boolean; loading: boolean; employee: User | null }>()
defineEmits<{ (e: 'close'): void; (e: 'confirm'): void }>()
</script>

<style scoped>

.backdrop     { @apply fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4; }
.modal        { @apply bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden; animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header { @apply flex items-center justify-between px-6 py-5 border-b border-gray-100; }
.modal-title  { @apply text-lg font-bold text-gray-800; }
.btn-close    { @apply bg-transparent border-none text-gray-400 cursor-pointer text-lg px-1.5 py-0.5 rounded hover:bg-gray-100; }
.modal-footer { @apply flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50; }
.btn-cancel   { @apply px-5 py-2 rounded-md border border-gray-300 bg-white text-gray-500 text-sm font-medium cursor-pointer hover:bg-gray-100; }
.btn-delete   { @apply px-6 py-2 rounded-md border-none bg-red-500 text-white text-sm font-semibold cursor-pointer flex items-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed; }
.spinner      { @apply w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block; }
</style>