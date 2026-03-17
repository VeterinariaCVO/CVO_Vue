<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editEmployee ? 'Editar Empleado' : 'Registrar Empleado' }}</h2>
          <p class="modal-subtitle">CDU-009 · Gestion de empleados</p>
        </div>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">

        <!-- Nombre -->
        <div class="field">
          <label class="label">Nombre completo</label>
          <input v-model="form.name" placeholder="Ej. Juan Perez"
            :class="['input', errors.name ? 'input-error' : '']" />
          <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
        </div>

        <!-- Correo -->
        <div class="field">
          <label class="label">Correo electronico</label>
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com"
            :class="['input', errors.email ? 'input-error' : '']" />
          <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
        </div>

        <!-- Telefono + Direccion -->
        <div class="field-row">
          <div class="field">
            <label class="label">Telefono</label>
            <input v-model="form.phone" placeholder="+52 000 000 0000" class="input" />
          </div>
          <div class="field">
            <label class="label">Direccion</label>
            <input v-model="form.address" placeholder="Calle, Ciudad" class="input" />
          </div>
        </div>

        <!-- Sexo + Fecha nacimiento -->
        <div class="field-row">
          <div class="field">
            <label class="label">Sexo</label>
            <select v-model="form.gender" :class="['input', errors.gender ? 'input-error' : '']">
              <option value="">Seleccionar</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <p v-if="errors.gender" class="error-msg">{{ errors.gender }}</p>
          </div>
          <div class="field">
            <label class="label">Fecha de nacimiento</label>
            <input v-model="form.birth_date" type="date"
              :class="['input', errors.birth_date ? 'input-error' : '']"
              :max="maxBirthDate" />
            <p v-if="errors.birth_date" class="error-msg">{{ errors.birth_date }}</p>
          </div>
        </div>

        <!-- Edad calculada automáticamente -->
        <div v-if="calculatedAge !== null" class="field">
          <label class="label">Edad</label>
          <div class="age-display">{{ calculatedAge }} años</div>
        </div>

        <!-- Foto de perfil -->
        <div class="field">
          <label class="label">Foto de perfil <span class="optional">(opcional)</span></label>
          <div class="photo-wrapper">
            <div v-if="photoPreview || editEmployee?.profile_photo" class="photo-preview-wrap">
              <img :src="photoPreview || editEmployee?.profile_photo" class="photo-preview" alt="preview" />
              <button type="button" @click="removePhoto" class="photo-remove">✕</button>
            </div>
            <label v-else class="photo-upload-btn">
              <span>📷 Seleccionar foto</span>
              <input type="file" accept="image/*" @change="handlePhoto" class="input-file" />
            </label>
          </div>
          <p v-if="errors.profile_photo" class="error-msg">{{ errors.profile_photo }}</p>
        </div>

        <!-- Contraseña -->
        <div v-if="!editEmployee" class="field">
          <label class="label">Contrasena</label>
          <input v-model="form.password" type="password" placeholder="Minimo 8 caracteres"
            :class="['input', errors.password ? 'input-error' : '']" />
          <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
        </div>

        <div v-if="editEmployee" class="field">
          <label class="label">Nueva contrasena <span class="optional">(opcional)</span></label>
          <input v-model="form.password" type="password" placeholder="Dejar vacio para no cambiar" class="input" />
        </div>

        <p v-if="errors.general" class="error-msg general-error">{{ errors.general }}</p>

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
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const props = defineProps<{
  open: boolean
  editEmployee: User | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', isEdit: boolean): void
}>()

const authStore = useAuthStore()
const API = 'http://127.0.0.1:8000/api'

function getHeaders() {
  return {
    'Authorization': `Bearer ${authStore.token}`,
    'Accept':        'application/json',
  }
}

const blankForm = () => ({
  name: '', email: '', phone: '', address: '',
  password: '', active: true,
  gender: '', birth_date: '',
})

const form             = ref(blankForm())
const errors           = ref<Record<string, string>>({})
const saving           = ref(false)
const photoFile        = ref<File | null>(null)
const photoPreview     = ref<string | null>(null)
const removePhotoFlag  = ref(false)

// Fecha maxima: 18 años atras
const maxBirthDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})

// Edad calculada en tiempo real
const calculatedAge = computed(() => {
  if (!form.value.birth_date) return null
  const birth = new Date(form.value.birth_date)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
})

watch(() => props.open, (val) => {
  if (!val) return
  errors.value        = {}
  photoFile.value     = null
  photoPreview.value  = null
  removePhotoFlag.value = false
  if (props.editEmployee) {
    form.value = {
      name:       props.editEmployee.name,
      email:      props.editEmployee.email,
      phone:      props.editEmployee.phone      ?? '',
      address:    props.editEmployee.address    ?? '',
      password:   '',
      active:     props.editEmployee.active,
      gender:     (props.editEmployee as any).gender     ?? '',
      birth_date: (props.editEmployee as any).birth_date ?? '',
    }
  } else {
    form.value = blankForm()
  }
})

function handlePhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  removePhotoFlag.value = false
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

function removePhoto() {
  photoFile.value    = null
  photoPreview.value = null
  removePhotoFlag.value = true
}

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim())  e.name  = 'El nombre es obligatorio.'
  if (!form.value.email.trim()) e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = 'Correo invalido.'
  if (!form.value.gender)       e.gender = 'El sexo es obligatorio.'
  if (!form.value.birth_date)   e.birth_date = 'La fecha de nacimiento es obligatoria.'
  else if (calculatedAge.value !== null && calculatedAge.value < 18)
    e.birth_date = 'El empleado debe ser mayor de 18 años.'
  if (!props.editEmployee && form.value.password.length < 8) e.password = 'Minimo 8 caracteres.'
  errors.value = e
  return !Object.keys(e).length
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  errors.value = {}

  try {
    const isEdit = !!props.editEmployee
    const url    = isEdit
      ? `${API}/admin/employees/${props.editEmployee!.id}`
      : `${API}/admin/employees`

    // FormData para poder enviar foto
    const formData = new FormData()
    formData.append('name',       form.value.name)
    formData.append('email',      form.value.email)
    formData.append('role_id',    '2')
    formData.append('active',     form.value.active ? '1' : '0')
    formData.append('gender',     form.value.gender)
    formData.append('birth_date', form.value.birth_date)
    if (form.value.phone)   formData.append('phone',   form.value.phone)
    if (form.value.address) formData.append('address', form.value.address)
    if (!isEdit)                  formData.append('password', form.value.password)
    else if (form.value.password) formData.append('password', form.value.password)
    if (photoFile.value)          formData.append('profile_photo', photoFile.value)
    if (removePhotoFlag.value)    formData.append('remove_photo', '1')
    // Laravel necesita _method para PUT con FormData
    if (isEdit) formData.append('_method', 'PUT')

    const res  = await fetch(url, { method: 'POST', headers: getHeaders(), body: formData })
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
  width: 100%; max-width: 520px; overflow: hidden;
  max-height: 90vh; display: flex; flex-direction: column;
  animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-subtitle { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: #f3f4f6; color: #374151; }

.modal-body {
  padding: 24px; display: flex; flex-direction: column; gap: 18px;
  overflow-y: auto; flex: 1;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
.optional { font-weight: 400; text-transform: none; color: #9ca3af; font-size: 10px; }

.input {
  width: 100%; border: 1px solid #d1d5db; border-radius: 6px;
  padding: 8px 12px; font-size: 13px; font-family: 'Poppins', sans-serif;
  outline: none; transition: border-color 0.2s; background: white;
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.input-error { border-color: #f87171; background-color: #fef2f2; }
.error-msg { font-size: 11px; color: #ef4444; }
.general-error { text-align: center; font-size: 12px; }

.age-display {
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 6px; padding: 8px 12px;
  font-size: 13px; color: #15803d; font-weight: 600;
}

.photo-wrapper { display: flex; align-items: center; gap: 12px; }
.photo-preview-wrap { position: relative; display: inline-block; }
.photo-preview {
  width: 72px; height: 72px; border-radius: 50%;
  object-fit: cover; border: 2px solid #e5e7eb;
}
.photo-remove {
  position: absolute; top: -4px; right: -4px;
  background: #dc3545; color: white; border: none;
  border-radius: 50%; width: 18px; height: 18px;
  font-size: 9px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.photo-upload-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border: 1px dashed #d1d5db;
  border-radius: 6px; cursor: pointer; font-size: 13px;
  color: #6b7280; background: #f9fafb; transition: background 0.15s;
}
.photo-upload-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
.input-file { display: none; }

.modal-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 12px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; background: #f9fafb; flex-shrink: 0;
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