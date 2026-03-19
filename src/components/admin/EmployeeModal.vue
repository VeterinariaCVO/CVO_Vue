<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editEmployee ? 'Editar Empleado' : 'Registrar Empleado' }}</h2>
          <p class="modal-subtitle">CDU-009 · Gestion de empleados</p>
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
            <label class="label">Direccion</label>
            <input v-model="form.address" placeholder="Calle, Ciudad" class="input" />
          </div>
        </div>

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
            <input v-model="form.birth_date" type="date" :class="['input', errors.birth_date ? 'input-error' : '']" :max="maxBirthDate" />
            <p v-if="errors.birth_date" class="error-msg">{{ errors.birth_date }}</p>
          </div>
        </div>

        <div v-if="calculatedAge !== null" class="field">
          <label class="label">Edad</label>
          <div class="age-display">{{ calculatedAge }} años</div>
        </div>

        <div class="field">
          <label class="label">Foto de perfil <span class="optional">(opcional)</span></label>
          <div class="flex items-center gap-3">
            <div v-if="photoPreview || editEmployee?.profile_photo" class="relative inline-block">
              <img :src="photoPreview || editEmployee?.profile_photo || ''" class="photo-preview" alt="preview" />
              <button type="button" @click="removePhoto" class="photo-remove">✕</button>
            </div>
            <label v-else class="photo-upload">
              <span>📷 Seleccionar foto</span>
              <input type="file" accept="image/*" @change="handlePhoto" class="hidden" />
            </label>
          </div>
          <p v-if="errors.profile_photo" class="error-msg">{{ errors.profile_photo }}</p>
        </div>

        <div v-if="!editEmployee" class="field">
          <label class="label">Contrasena</label>
          <input v-model="form.password" type="password" placeholder="Minimo 8 caracteres" :class="['input', errors.password ? 'input-error' : '']" />
          <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
        </div>

        <div v-if="editEmployee" class="field">
          <label class="label">Nueva contrasena <span class="optional">(opcional)</span></label>
          <input v-model="form.password" type="password" placeholder="Dejar vacio para no cambiar" class="input" />
        </div>

        <p v-if="errors.general" class="error-msg text-center">{{ errors.general }}</p>
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
import { ref, watch, computed } from 'vue'
import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user'

const props = defineProps<{ open: boolean; editEmployee: User | null }>()
const emit  = defineEmits<{ (e: 'close'): void; (e: 'saved', isEdit: boolean): void }>()

const { apiFetch, loading, validationErrors } = useFetch()

const blankForm = () => ({ name: '', email: '', phone: '', address: '', password: '', active: true, gender: '', birth_date: '' })
const form            = ref(blankForm())
const errors          = ref<Record<string, string>>({})
const photoFile       = ref<File | null>(null)
const photoPreview    = ref<string | null>(null)
const removePhotoFlag = ref(false)

const maxBirthDate = computed(() => {
  const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0]
})

const calculatedAge = computed(() => {
  if (!form.value.birth_date) return null
  const birth = new Date(form.value.birth_date), today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
})

watch(validationErrors, (val) => { errors.value = { ...errors.value, ...val } })

watch(() => props.open, (val) => {
  if (!val) return
  errors.value = {}; photoFile.value = null; photoPreview.value = null; removePhotoFlag.value = false
  if (props.editEmployee) {
    form.value = {
      name: props.editEmployee.name, email: props.editEmployee.email,
      phone: props.editEmployee.phone ?? '', address: props.editEmployee.address ?? '',
      password: '', active: props.editEmployee.active,
      gender: (props.editEmployee as any).gender ?? '',
      birth_date: (props.editEmployee as any).birth_date ?? '',
    }
  } else { form.value = blankForm() }
})

function handlePhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file; removePhotoFlag.value = false
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

function removePhoto() { photoFile.value = null; photoPreview.value = null; removePhotoFlag.value = true }

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim())  e.name  = 'El nombre es obligatorio.'
  if (!form.value.email.trim()) e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = 'Correo invalido.'
  if (!form.value.gender)     e.gender     = 'El sexo es obligatorio.'
  if (!form.value.birth_date) e.birth_date = 'La fecha de nacimiento es obligatoria.'
  else if (calculatedAge.value !== null && calculatedAge.value < 18) e.birth_date = 'El empleado debe ser mayor de 18 años.'
  if (!props.editEmployee && form.value.password.length < 8) e.password = 'Minimo 8 caracteres.'
  errors.value = e
  return !Object.keys(e).length
}

async function handleSubmit() {
  if (!validate()) return
  errors.value = {}
  const isEdit   = !!props.editEmployee
  const endpoint = isEdit ? `/admin/employees/${props.editEmployee!.id}` : '/admin/employees'
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('email', form.value.email)
  formData.append('role_id', '2')
  formData.append('active', form.value.active ? '1' : '0')
  formData.append('gender', form.value.gender)
  formData.append('birth_date', form.value.birth_date)
  if (form.value.phone)         formData.append('phone',         form.value.phone)
  if (form.value.address)       formData.append('address',       form.value.address)
  if (!isEdit)                  formData.append('password',      form.value.password)
  else if (form.value.password) formData.append('password',      form.value.password)
  if (photoFile.value)          formData.append('profile_photo', photoFile.value)
  if (removePhotoFlag.value)    formData.append('remove_photo',  '1')
  if (isEdit)                   formData.append('_method',       'PUT')
  const data = await apiFetch(endpoint, { method: 'POST', body: formData })
  if (data !== null) { emit('saved', isEdit); emit('close') }
}
</script>

<style scoped>

.backdrop { @apply fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4; }
.modal    { @apply bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col; animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-header   { @apply flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0; }
.modal-title    { @apply text-lg font-bold text-gray-800; }
.modal-subtitle { @apply text-xs text-gray-400 mt-0.5; }
.btn-close      { @apply bg-transparent border-none text-gray-400 cursor-pointer text-lg px-1.5 py-0.5 rounded hover:bg-gray-100 hover:text-gray-600; }

.modal-body  { @apply px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1; }
.modal-footer { @apply flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0; }

.field     { @apply flex flex-col gap-1.5; }
.field-row { @apply grid grid-cols-2 gap-4; }
.label     { @apply text-xs font-bold text-gray-500 uppercase tracking-wide; }
.optional  { @apply font-normal normal-case text-gray-400 text-[10px]; }

.input       { @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none transition-colors bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100; }
.input-error { @apply border-red-300 bg-red-50; }
.error-msg   { @apply text-xs text-red-500; }

.age-display  { @apply bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm text-green-700 font-semibold; }
.photo-preview { @apply w-16 h-16 rounded-full object-cover border-2 border-gray-200; }
.photo-remove  { @apply absolute -top-1 -right-1 bg-red-500 text-white border-none rounded-full w-4 h-4 text-[9px] cursor-pointer flex items-center justify-center; }
.photo-upload  { @apply flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-500 bg-gray-50 hover:bg-gray-100; }

.btn-cancel { @apply px-5 py-2 rounded-md border border-gray-300 bg-white text-gray-500 text-sm font-medium cursor-pointer hover:bg-gray-100; }
.btn-save   { @apply px-6 py-2 rounded-md border-none bg-blue-600 text-white text-sm font-semibold cursor-pointer flex items-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed; }
.spinner    { @apply w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block; }
</style>