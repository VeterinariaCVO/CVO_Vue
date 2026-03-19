<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
          <p class="modal-subtitle">CDU-002 · Registro de cliente/usuario</p>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label class="label">Nombre completo</label>
          <input v-model="form.name" placeholder="Ej. Juan Perez" :class="['input', errors.name ? 'input-error' : '']" />
          <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label class="label">Correo electronico</label>
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" :class="['input', errors.email ? 'input-error' : '']" />
          <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label">Telefono</label>
            <input v-model="form.phone" placeholder="+52 000 000 0000" class="input" />
          </div>
          <div class="field">
            <label class="label">Rol</label>
            <select v-model="form.role_id" class="input">
              <option :value="2">Trabajador</option>
              <option :value="3">Cliente</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Direccion</label>
          <input v-model="form.address" placeholder="Calle, Ciudad" class="input" />
        </div>

        <div v-if="!editUser" class="field">
          <label class="label">Contrasena</label>
          <input v-model="form.password" type="password" placeholder="Minimo 8 caracteres" :class="['input', errors.password ? 'input-error' : '']" />
          <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
        </div>

        <p v-if="errors.general" class="error-msg">{{ errors.general }}</p>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">Cancelar</button>
        <button @click="handleSubmit" :disabled="loading" class="btn-save">
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user'

const props = defineProps<{ open: boolean; editUser: User | null }>()
const emit  = defineEmits<{ (e: 'close'): void; (e: 'saved', isEdit: boolean): void }>()

const { apiFetch, loading, validationErrors } = useFetch()
const blankForm = () => ({ name: '', email: '', role_id: 3, phone: '', address: '', password: '', active: true })
const form   = ref(blankForm())
const errors = ref<Record<string, string>>({})

watch(validationErrors, (val) => { errors.value = { ...errors.value, ...val } })

watch(() => props.open, (val) => {
  if (!val) return
  errors.value = {}
  if (props.editUser) {
    form.value = {
      name: props.editUser.name, email: props.editUser.email,
      role_id: props.editUser.role_id, phone: props.editUser.phone ?? '',
      address: props.editUser.address ?? '', password: '', active: props.editUser.active,
    }
  } else { form.value = blankForm() }
})

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim())  e.name  = 'El nombre es obligatorio.'
  if (!form.value.email.trim()) e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = 'Correo invalido.'
  if (!props.editUser && form.value.password.length < 8) e.password = 'Minimo 8 caracteres.'
  errors.value = e
  return !Object.keys(e).length
}

async function handleSubmit() {
  if (!validate()) return
  errors.value = {}
  const isEdit   = !!props.editUser
  const endpoint = isEdit ? `/admin/users/${props.editUser!.id}` : '/admin/users'
  const body: any = {
    name: form.value.name, email: form.value.email, role_id: form.value.role_id,
    phone: form.value.phone || null, address: form.value.address || null, active: form.value.active,
  }
  if (!isEdit)                  body.password = form.value.password
  else if (form.value.password) body.password = form.value.password
  const data = await apiFetch(endpoint, { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) })
  if (data !== null) { emit('saved', isEdit); emit('close') }
}
</script>

<style scoped>

.backdrop     { @apply fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4; }
.modal        { @apply bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden; animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header   { @apply flex items-start justify-between px-6 py-5 border-b border-gray-100; }
.modal-title    { @apply text-lg font-bold text-gray-800; }
.modal-subtitle { @apply text-xs text-gray-400 mt-0.5; }
.btn-close      { @apply bg-transparent border-none text-gray-400 cursor-pointer text-lg px-1.5 py-0.5 rounded hover:bg-gray-100; }
.modal-body     { @apply px-6 py-5 flex flex-col gap-4; }
.modal-footer   { @apply flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50; }
.field          { @apply flex flex-col gap-1.5; }
.field-row      { @apply grid grid-cols-2 gap-4; }
.label          { @apply text-xs font-bold text-gray-500 uppercase tracking-wide; }
.input          { @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none transition-colors bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100; }
.input-error    { @apply border-red-300 bg-red-50; }
.error-msg      { @apply text-xs text-red-500; }
.btn-cancel     { @apply px-5 py-2 rounded-md border border-gray-300 bg-white text-gray-500 text-sm font-medium cursor-pointer hover:bg-gray-100; }
.btn-save       { @apply px-6 py-2 rounded-md border-none bg-blue-600 text-white text-sm font-semibold cursor-pointer flex items-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed; }
.spinner        { @apply w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block; }
</style>