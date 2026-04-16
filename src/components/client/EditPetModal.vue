<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ cerrar: []; guardado: [] }>()

const authStore = useAuthStore()
const cargando = ref(true)
const guardando = ref(false)
const errores = ref<Record<string, string>>({})
const mensaje = ref('')

const form = ref({
  name: '',
  species: '',
  sex: 'male',
  breed: '',
  color: '',
  special_marks: '',
  age: '',
  age_months: '',
  weight: '',
})

const formInicial = ref<string>('')
const preview = ref<string | null>(null)
const fotoArchivo = ref<File | null>(null)
const eliminarFoto = ref(false)
const inputFoto = ref<HTMLInputElement | null>(null)

function seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fotoArchivo.value = file
  eliminarFoto.value = false
  preview.value = URL.createObjectURL(file)
}

function quitarFoto() {
  preview.value = null
  fotoArchivo.value = null
  eliminarFoto.value = true
}

async function cargarMascota() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
    headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
  })
  const json = await response.json()
  const d = json.data

  const totalMeses = Number(d.age ?? 0)
  const años = Math.floor(totalMeses / 12)
  const meses = totalMeses % 12

  form.value = {
    name: d.name ?? '',
    species: d.species ?? '',
    sex: d.sex ?? 'male',
    breed: d.breed ?? '',
    color: d.color ?? '',
    special_marks: d.special_marks ?? '',
    age: String(años),
    age_months: String(meses),
    weight: String(d.weight ?? ''),
  }

  preview.value = d.photo_url ?? null

  formInicial.value = JSON.stringify({
    name: d.name,
    species: d.species,
    sex: d.sex,
    breed: d.breed,
    color: d.color,
    special_marks: d.special_marks,
    age: totalMeses,
    weight: d.weight,
  })

  cargando.value = false
}

function validar(): boolean {
  errores.value = {}

  if (!form.value.name.trim()) errores.value.name = 'El nombre es obligatorio.'
  if (!form.value.species.trim()) errores.value.species = 'La especie es obligatoria.'

  const años = Number(form.value.age || 0)
  const meses = Number(form.value.age_months || 0)
  const total = años * 12 + meses

  if (años < 0 || años > 30) errores.value.age = 'Los años deben ser entre 0 y 30.'
  if (meses < 0 || meses > 11) errores.value.age_months = 'Los meses deben ser entre 0 y 11.'
  if (total > 360) errores.value.age = 'La edad máxima es 30 años.'

  const peso = Number(form.value.weight || 0)
  if (peso < 0 || peso > 500) errores.value.weight = 'El peso debe ser entre 0 y 500 kg.'

  return Object.keys(errores.value).length === 0
}

function huboCambios(): boolean {
  if (fotoArchivo.value || eliminarFoto.value) return true
  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)
  const actual = JSON.stringify({
    name: form.value.name,
    species: form.value.species,
    sex: form.value.sex,
    breed: form.value.breed,
    color: form.value.color,
    special_marks: form.value.special_marks,
    age: totalMeses,
    weight: form.value.weight,
  })
  return actual !== formInicial.value
}

async function guardar() {
  if (guardando.value) return
  if (!validar()) return

  if (!huboCambios()) {
    mensaje.value = 'No se realizaron cambios.'
    setTimeout(() => { mensaje.value = '' }, 3000)
    return
  }

  guardando.value = true

  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)

  const formData = new FormData()
  formData.append('_method', 'PUT')
  formData.append('name', form.value.name)
  formData.append('species', form.value.species)
  formData.append('sex', form.value.sex)
  formData.append('breed', form.value.breed)
  formData.append('color', form.value.color)
  formData.append('special_marks', form.value.special_marks)
  formData.append('age', String(totalMeses))
  formData.append('weight', form.value.weight)
  if (fotoArchivo.value) formData.append('photo', fotoArchivo.value)
  if (eliminarFoto.value) formData.append('remove_photo', '1')

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
  return inputClass + (errores.value[campo] ? ' border-red-400' : ' border-[#dce6f0] focus:border-[#1d6bbf]')
}

onMounted(cargarMascota)
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999]">
    <div class="bg-white rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
      <h2 class="text-lg font-bold text-[#1e3a5f] mt-0 mb-5">Editar Mascota</h2>

      <p v-if="cargando" class="text-center text-slate-400 py-6">Cargando...</p>

      <template v-else>
        <div v-if="mensaje" class="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4">
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
            <input ref="inputFoto" type="file" accept="image/*" class="hidden" @change="seleccionarFoto" />
            <button
              v-if="preview"
              type="button"
              @click="quitarFoto"
              class="text-xs text-red-400 hover:text-red-600 text-left mt-1 bg-transparent border-none cursor-pointer p-0"
            >
              Eliminar foto
            </button>
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
            <input v-model="form.special_marks" placeholder="Marcas especiales" :class="ic('special_marks')" />
          </div>

          <!-- Edad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Edad</label>
            <div class="flex gap-2">
              <div class="flex-1 flex flex-col gap-1">
                <input v-model="form.age" type="number" min="0" max="30" placeholder="0" :class="ic('age')" />
                <span class="text-[10px] text-slate-400 text-center">Años</span>
              </div>
              <div class="flex-1 flex flex-col gap-1">
                <input v-model="form.age_months" type="number" min="0" max="11" placeholder="0" :class="ic('age_months')" />
                <span class="text-[10px] text-slate-400 text-center">Meses</span>
              </div>
            </div>
            <p v-if="errores.age" class="text-red-500 text-xs m-0">{{ errores.age }}</p>
            <p v-if="errores.age_months" class="text-red-500 text-xs m-0">{{ errores.age_months }}</p>
          </div>

          <!-- Peso -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Peso (kg)</label>
            <input v-model="form.weight" type="number" min="0" max="500" step="0.1" :class="ic('weight')" />
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
            :class="guardando ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#1d6bbf] hover:bg-[#155fa8] text-white'"
          >
            {{ guardando ? 'Guardando...' : 'Actualizar' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>