<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { Pet } from '@/types/pet'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ cerrar: []; guardado: [] }>()

const authStore = useAuthStore()
const cargando = ref(true)
const guardando = ref(false)
const errores = ref<Record<string, string>>({})
const mensaje = ref('')
const form = ref<Pet>({} as Pet)
const formInicial = ref<string>('')

const preview = ref<string | null>(null)
const fotoArchivo = ref<File | null>(null)
const inputFoto = ref<HTMLInputElement | null>(null)

function seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fotoArchivo.value = file
  preview.value = URL.createObjectURL(file)
}

async function cargarMascota() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
    headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
  })
  const json = await response.json()
  form.value = json.data
  preview.value = json.data.photo_url ?? null
  formInicial.value = JSON.stringify({
    name: json.data.name,
    species: json.data.species,
    sex: json.data.sex,
    breed: json.data.breed,
    color: json.data.color,
    special_marks: json.data.special_marks,
    age: json.data.age,
    weight: json.data.weight,
  })
  cargando.value = false
}

function validar(): boolean {
  errores.value = {}
  if (!form.value.name?.trim()) errores.value.name = 'El nombre es obligatorio.'
  if (!form.value.species?.trim()) errores.value.species = 'La especie es obligatoria.'
  if (form.value.age !== null && form.value.age !== undefined) {
    const edad = Number(form.value.age)
    if (edad < 0 || edad > 30) errores.value.age = 'La edad debe ser entre 0 y 30 años.'
  }
  if (form.value.weight !== null && form.value.weight !== undefined) {
    const peso = Number(form.value.weight)
    if (peso < 0 || peso > 500) errores.value.weight = 'El peso debe ser entre 0 y 500 kg.'
  }
  return Object.keys(errores.value).length === 0
}

function huboCambios(): boolean {
  if (fotoArchivo.value) return true
  const actual = JSON.stringify({
    name: form.value.name,
    species: form.value.species,
    sex: form.value.sex,
    breed: form.value.breed,
    color: form.value.color,
    special_marks: form.value.special_marks,
    age: form.value.age,
    weight: form.value.weight,
  })
  return actual !== formInicial.value
}

async function guardar() {
  if (guardando.value) return
  if (!validar()) return

  if (!huboCambios()) {
    mensaje.value = 'No se realizaron cambios.'
    setTimeout(() => {
      mensaje.value = ''
    }, 3000)
    return
  }

  guardando.value = true
  const formData = new FormData()
  formData.append('_method', 'PUT')
  formData.append('name', form.value.name)
  formData.append('species', form.value.species)
  formData.append('sex', form.value.sex)
  formData.append('breed', form.value.breed ?? '')
  formData.append('color', form.value.color ?? '')
  formData.append('special_marks', form.value.special_marks ?? '')
  formData.append('age', String(form.value.age ?? ''))
  formData.append('weight', String(form.value.weight ?? ''))
  if (fotoArchivo.value) formData.append('photo', fotoArchivo.value)

  await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    body: formData,
  })

  guardando.value = false
  emit('cerrar')
}

const inputClass =
  'w-full border rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border'
function ic(campo: string) {
  return (
    inputClass +
    (errores.value[campo] ? ' border-red-400' : ' border-[#dce6f0] focus:border-[#1d6bbf]')
  )
}

onMounted(cargarMascota)
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999]">
    <div
      class="bg-white rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
    >
      <h2 class="text-lg font-bold text-[#1e3a5f] mt-0 mb-5">Editar Mascota</h2>

      <p v-if="cargando" class="text-center text-slate-400 py-6">Cargando...</p>

      <template v-else>
        <!-- Mensaje de sin cambios -->
        <div
          v-if="mensaje"
          class="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4"
        >
          {{ mensaje }}
        </div>

        <div class="flex flex-col gap-3">
          <!-- Foto -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Foto</label>
            <div
              @click="inputFoto?.click()"
              class="w-full h-36 border-2 border-dashed border-[#dce6f0] rounded-xl cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50 hover:border-[#1d6bbf] transition-colors"
            >
              <img v-if="preview" :src="preview" class="w-full h-full object-cover" />
              <div v-else class="flex flex-col items-center gap-1.5 text-slate-400">
                <p class="text-xs m-0">Click para cambiar foto</p>
              </div>
            </div>
            <input
              ref="inputFoto"
              type="file"
              accept="image/*"
              class="hidden"
              @change="seleccionarFoto"
            />
          </div>

          <!-- Nombre -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Nombre *</label>
            <input v-model="form.name" placeholder="Nombre" :class="ic('name')" />
            <p v-if="errores.name" class="text-red-500 text-xs m-0">{{ errores.name }}</p>
          </div>

          <!-- Especie -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Especie *</label>
            <input v-model="form.species" placeholder="Especie" :class="ic('species')" />
            <p v-if="errores.species" class="text-red-500 text-xs m-0">{{ errores.species }}</p>
          </div>

          <!-- Sexo -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Sexo *</label>
            <select v-model="form.sex" :class="ic('sex')">
              <option value="male">♂ Macho</option>
              <option value="female">♀ Hembra</option>
            </select>
          </div>

          <!-- Raza -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Raza</label>
            <input v-model="form.breed" placeholder="Raza" :class="ic('breed')" />
          </div>

          <!-- Color -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Color</label>
            <input v-model="form.color" placeholder="Color" :class="ic('color')" />
          </div>

          <!-- Marcas -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Marcas especiales</label>
            <input
              v-model="form.special_marks"
              placeholder="Marcas especiales"
              :class="ic('special_marks')"
            />
          </div>

          <!-- Edad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Edad (años)</label>
            <input v-model.number="form.age" type="number" min="0" max="30" :class="ic('age')" />
            <p v-if="errores.age" class="text-red-500 text-xs m-0">{{ errores.age }}</p>
          </div>

          <!-- Peso -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Peso (kg)</label>
            <input
              v-model.number="form.weight"
              type="number"
              min="0"
              max="500"
              step="0.1"
              :class="ic('weight')"
            />
            <p v-if="errores.weight" class="text-red-500 text-xs m-0">{{ errores.weight }}</p>
          </div>
        </div>

        <div class="flex gap-2.5 mt-5">
          <button
            @click="$emit('cerrar')"
            class="flex-1 bg-[#e8f0fa] hover:bg-blue-100 text-[#1d6bbf] font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="guardar"
            :disabled="guardando"
            class="flex-1 font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
            :class="
              guardando
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#1d6bbf] hover:bg-[#155fa8] text-white'
            "
          >
            {{ guardando ? 'Guardando...' : 'Actualizar' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
