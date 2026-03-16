<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Eliminar Empleado</h2>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="msg">
          ¿Desea eliminar a <strong>{{ employee?.name }}</strong>?
          Esta accion no se puede deshacer.
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

defineProps<{
  open: boolean
  loading: boolean
  employee: User | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.modal-backdrop {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal {
  background: white; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 100%; max-width: 400px; overflow: hidden;
  animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-close {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: #f3f4f6; color: #374151; }
.modal-body { padding: 24px; }
.msg { font-size: 14px; color: #374151; line-height: 1.6; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px; border-top: 1px solid #f3f4f6; background: #f9fafb;
}
.btn-cancel {
  padding: 8px 20px; border-radius: 6px; border: 1px solid #d1d5db;
  background: white; color: #6b7280; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-cancel:hover { background: #f3f4f6; }
.btn-delete {
  padding: 8px 24px; border-radius: 6px; border: none;
  background-color: #dc3545; color: white; font-size: 13px;
  font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 8px; font-family: 'Poppins', sans-serif;
}
.btn-delete:hover { opacity: 0.9; }
.btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>