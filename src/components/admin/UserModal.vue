<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
          <p class="modal-subtitle">CDU-002 · Registro de cliente/usuario</p>
        </div>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">

        <div class="field">
          <label class="label">Nombre completo</label>
          <input v-model="form.name" placeholder="Ej. Juan Perez"
            :class="['input', errors.name ? 'input-error' : '']" />
          <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label class="label">Correo electronico</label>
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com"
            :class="['input', errors.email ? 'input-error' : '']" />
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
          <input v-model="form.password" type="password" placeholder="Minimo 8 caracteres"
            :class="['input', errors.password ? 'input-error' : '']" />
          <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
        </div>

        <p v-if="errors.general" class="error-msg">{{ errors.general }}</p>

      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">Cancelar</button>
        <button @click="handleSubmit" :disabled="saving" class="btn-save">
          <span v-if="saving" class="spinner" />
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const props = defineProps<{
  open: boolean
  editUser: User | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', isEdit: boolean): void
}>()

const authStore = useAuthStore()
const API = 'http://127.0.0.1:8000/api'

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${authStore.token}`,
    'Accept':        'application/json',
  }
}

const blankForm = () => ({ name: '', email: '', role_id: 3, phone: '', address: '', password: '', active: true })
const form   = ref(blankForm())
const errors = ref<Record<string, string>>({})
const saving = ref(false)

watch(() => props.open, (val) => {
  if (!val) return
  errors.value = {}
  if (props.editUser) {
    form.value = {
      name:     props.editUser.name,
      email:    props.editUser.email,
      role_id:  props.editUser.role_id,
      phone:    props.editUser.phone    ?? '',
      address:  props.editUser.address  ?? '',
      password: '',
      active:   props.editUser.active,
    }
  } else {
    form.value = blankForm()
  }
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
  saving.value = true
  errors.value = {}

  try {
    const isEdit = !!props.editUser
    const method = isEdit ? 'PUT' : 'POST'
    const url    = isEdit
      ? `${API}/admin/users/${props.editUser!.id}`
      : `${API}/admin/users`

    const body: any = {
      name:    form.value.name,
      email:   form.value.email,
      role_id: form.value.role_id,
      phone:   form.value.phone   || null,
      address: form.value.address || null,
      active:  form.value.active,
    }
    if (!isEdit)                  body.password = form.value.password
    else if (form.value.password) body.password = form.value.password

    const res  = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }

    if (!res.ok) {
      if (res.status === 422 && data.errors) {
        const le: Record<string, string> = {}
        for (const key in data.errors) le[key] = data.errors[key][0]
        errors.value = le
        return
      }
      throw new Error(data.message ?? 'Error al guardar')
    }

    emit('saved', isEdit)
    emit('close')

  } catch (e: any) {
    errors.value.general = e.message
  } finally {
    saving.value = false
  }
}
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
  width: 100%; max-width: 480px; overflow: hidden;
  animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-subtitle { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: #f3f4f6; color: #374151; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
.input {
  width: 100%; border: 1px solid #d1d5db; border-radius: 6px;
  padding: 8px 12px; font-size: 13px; font-family: 'Poppins', sans-serif;
  outline: none; transition: border-color 0.2s; background: white;
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.input-error { border-color: #f87171; background-color: #fef2f2; }
.error-msg { font-size: 11px; color: #ef4444; }

.modal-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 12px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; background: #f9fafb;
}
.btn-cancel {
  padding: 8px 20px; border-radius: 6px; border: 1px solid #d1d5db;
  background: white; color: #6b7280; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-cancel:hover { background: #f3f4f6; }
.btn-save {
  padding: 8px 24px; border-radius: 6px; border: none;
  background-color: #007bff; color: white; font-size: 13px;
  font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 8px; font-family: 'Poppins', sans-serif;
}
.btn-save:hover { opacity: 0.9; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>