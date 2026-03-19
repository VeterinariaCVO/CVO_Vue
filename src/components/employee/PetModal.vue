<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ editPet ? 'Editar Mascota' : 'Agregar Mascota' }}</h2>
          <p class="modal-subtitle">CDU-007 · Registro de mascota</p>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="field-row">
          <div class="field">
            <label class="label">Nombre</label>
            <input v-model="form.name" placeholder="Nombre de la mascota" :class="['input', errors.name ? 'input-error' : '']" />
            <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
          </div>
          <div class="field">
            <label class="label">Especie</label>
            <input v-model="form.species" placeholder="Perro, Gato..." :class="['input', errors.species ? 'input-error' : '']" />
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
          <p class="text-xs text-gray-400 mt-1">Si no sube foto se usara icono por defecto</p>
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
import type { Pet } from '@/types/pet'

const props = defineProps<{ open: boolean; editPet: Pet | null; ownerId: number }>()
const emit  = defineEmits<{ (e: 'close'): void; (e: 'saved', isEdit: boolean): void }>()

const { apiFetch, loading, validationErrors } = useFetch()

const blankForm = () => ({
  name: '', species: '', breed: '', color: '', special_marks: '',
  weight: null as number | null, sex: 'male' as 'male' | 'female', age: null as number | null,
})

const form      = ref(blankForm())
const photoFile = ref<File | null>(null)
const errors    = ref<Record<string, string>>({})

watch(validationErrors, (val) => { errors.value = { ...errors.value, ...val } })

watch(() => props.open, (val) => {
  if (!val) return
  errors.value = {}; photoFile.value = null
  if (props.editPet) {
    form.value = {
      name: props.editPet.name, species: props.editPet.species,
      breed: props.editPet.breed ?? '', color: props.editPet.color ?? '',
      special_marks: props.editPet.special_marks ?? '',
      weight: props.editPet.weight, sex: props.editPet.sex, age: props.editPet.age,
    }
  } else { form.value = blankForm() }
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
  errors.value = {}
  const isEdit   = !!props.editPet
  const endpoint = isEdit ? `/pets/${props.editPet!.id}` : '/pets'
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
  const data = await apiFetch(endpoint, { method: 'POST', body: formData })
  if (data !== null) { emit('saved', isEdit); emit('close') }
}
</script>

<style scoped>

.backdrop  { @apply fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4; }
.modal     { @apply bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto; animation: modalIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header   { @apply flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10; }
.modal-title    { @apply text-lg font-bold text-gray-800; }
.modal-subtitle { @apply text-xs text-gray-400 mt-0.5; }
.btn-close      { @apply bg-transparent border-none text-gray-400 cursor-pointer text-lg px-1.5 py-0.5 rounded hover:bg-gray-100; }
.modal-body     { @apply px-6 py-5 flex flex-col gap-4; }
.modal-footer   { @apply flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0; }
.field          { @apply flex flex-col gap-1.5; }
.field-row      { @apply grid grid-cols-2 gap-4; }
.label          { @apply text-xs font-bold text-gray-500 uppercase tracking-wide; }
.input          { @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none transition-colors bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100; }
.input-error    { @apply border-red-300 bg-red-50; }
.input-file     { @apply w-full border border-dashed border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-pointer outline-none; }
.error-msg      { @apply text-xs text-red-500; }
.btn-cancel     { @apply px-5 py-2 rounded-md border border-gray-300 bg-white text-gray-500 text-sm font-medium cursor-pointer hover:bg-gray-100; }
.btn-save       { @apply px-6 py-2 rounded-md border-none bg-blue-600 text-white text-sm font-semibold cursor-pointer flex items-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed; }
.spinner        { @apply w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block; }
</style>