<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editPet ? 'Editar Mascota' : 'Agregar Mascota' }}</h2>
          <p class="modal-subtitle">CDU-007 · Registro de mascota</p>
        </div>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">

        <div class="field-row">
          <div class="field">
            <label class="label">Nombre</label>
            <input v-model="form.name" placeholder="Nombre de la mascota"
              :class="['input', errors.name ? 'input-error' : '']" />
            <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
          </div>
          <div class="field">
            <label class="label">Especie</label>
            <input v-model="form.species" placeholder="Perro, Gato..."
              :class="['input', errors.species ? 'input-error' : '']" />
            <p v-if="errors.species" class="error-msg">{{ errors.species }}</p>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label">Raza</label>
            <input v-model="form.breed" placeholder="Raza (opcional)" class="input" />
          </div>
          <div class="field">
            <label class="label">Sexo</label>
            <select v-model="form.sex" class="input">
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label">Color</label>
            <input v-model="form.color" placeholder="Color (opcional)" class="input" />
          </div>
          <div class="field">
            <label class="label">Edad (años)</label>
            <input v-model.number="form.age" type="number" min="0" placeholder="Edad" class="input" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label">Peso (kg)</label>
            <input v-model.number="form.weight" type="number" step="0.1" min="0" placeholder="Peso" class="input" />
          </div>
          <div class="field">
            <label class="label">Marcas especiales</label>
            <input v-model="form.special_marks" placeholder="Opcional" class="input" />
          </div>
        </div>

        <div class="field">
          <label class="label">Foto (opcional)</label>
          <input type="file" accept="image/jpeg,image/png" @change="onFileChange" class="input-file" />
          <p class="hint">Si no sube foto se usara icono por defecto</p>
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
import type { Pet } from '@/types/pet'

const props = defineProps<{
  open: boolean
  editPet: Pet | null
  ownerId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', isEdit: boolean): void
}>()

const authStore = useAuthStore()
const API = 'http://127.0.0.1:8000/api'

function getAuthHeader() {
  return {
    'Authorization': `Bearer ${authStore.token}`,
    'Accept': 'application/json',
  }
}

const blankForm = () => ({
  name: '', species: '', breed: '', color: '',
  special_marks: '', weight: null as number | null,
  sex: 'male' as 'male' | 'female',
  age: null as number | null,
})

const form      = ref(blankForm())
const photoFile = ref<File | null>(null)
const errors    = ref<Record<string, string>>({})
const saving    = ref(false)

watch(() => props.open, (val) => {
  if (!val) return
  errors.value    = {}
  photoFile.value = null
  if (props.editPet) {
    form.value = {
      name:          props.editPet.name,
      species:       props.editPet.species,
      breed:         props.editPet.breed         ?? '',
      color:         props.editPet.color         ?? '',
      special_marks: props.editPet.special_marks ?? '',
      weight:        props.editPet.weight,
      sex:           props.editPet.sex,
      age:           props.editPet.age,
    }
  } else {
    form.value = blankForm()
  }
})

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) photoFile.value = target.files[0]
}

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim())    e.name    = 'El nombre es obligatorio.'
  if (!form.value.species.trim()) e.species = 'La especie es obligatoria.'
  errors.value = e
  return !Object.keys(e).length
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  errors.value = {}

  try {
    const isEdit = !!props.editPet
    const url    = isEdit
      ? `${API}/pets/${props.editPet!.id}`
      : `${API}/pets`

    const formData = new FormData()
    formData.append('name',     form.value.name)
    formData.append('species',  form.value.species)
    formData.append('sex',      form.value.sex)
    formData.append('owner_id', String(props.ownerId))
    if (form.value.breed)           formData.append('breed',         form.value.breed)
    if (form.value.color)           formData.append('color',         form.value.color)
    if (form.value.special_marks)   formData.append('special_marks', form.value.special_marks)
    if (form.value.age !== null)    formData.append('age',           String(form.value.age))
    if (form.value.weight !== null) formData.append('weight',        String(form.value.weight))
    if (photoFile.value)            formData.append('photo',         photoFile.value)
    if (isEdit)                     formData.append('_method',       'PUT')

    const res  = await fetch(url, {
      method:  'POST',
      headers: getAuthHeader(),
      body:    formData,
    })

    const data = await res.json()

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
  width: 100%; max-width: 560px; overflow: hidden;
  max-height: 90vh; overflow-y: auto;
  animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
  position: sticky; top: 0; background: white; z-index: 1;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.modal-subtitle { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: #f3f4f6; color: #374151; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

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
.input-file {
  width: 100%; border: 1px dashed #d1d5db; border-radius: 6px;
  padding: 8px 12px; font-size: 13px; font-family: 'Poppins', sans-serif;
  outline: none; background: #f9fafb; cursor: pointer;
}
.hint { font-size: 11px; color: #9ca3af; }
.error-msg { font-size: 11px; color: #ef4444; }

.modal-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 12px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; background: #f9fafb;
  position: sticky; bottom: 0;
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