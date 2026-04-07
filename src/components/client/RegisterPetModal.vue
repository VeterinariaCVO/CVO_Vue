<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{ cerrar: []; guardado: [] }>()

const authStore = useAuthStore()
const guardando = ref(false)
const errores = ref<Record<string, string>>({})

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

function validar(): boolean {
  errores.value = {}

  if (!form.value.name.trim()) errores.value.name = 'El nombre es obligatorio.'

  if (!form.value.species.trim()) errores.value.species = 'La especie es obligatoria.'

  if (form.value.age_months !== '') {
    const meses = Number(form.value.age_months)
    if (isNaN(meses) || meses < 0 || meses > 11)
      errores.value.age_months = 'Los meses deben ser entre 0 y 11.'
  }

  if (form.value.age !== '') {
    const años = Number(form.value.age)
    if (isNaN(años) || años < 0 || años > 30) errores.value.age = 'Los años deben ser entre 0 y 30.'
  }

  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)
  if (totalMeses > 360) errores.value.age = 'La edad máxima es 30 años.'

  if (form.value.weight !== '') {
    const peso = Number(form.value.weight)
    if (isNaN(peso) || peso <= 0 || peso > 500)
      errores.value.weight = 'El peso debe ser mayor a 0 y menor a 500 kg.'
  }

  return Object.keys(errores.value).length === 0
}

async function registrar() {
  if (guardando.value) return
  if (!validar()) return

  guardando.value = true

  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)

  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('species', form.value.species)
  formData.append('sex', form.value.sex)
  formData.append('breed', form.value.breed)
  formData.append('color', form.value.color)
  formData.append('special_marks', form.value.special_marks)
  formData.append('age', String(totalMeses))
  formData.append('weight', form.value.weight)
  if (fotoArchivo.value) formData.append('photo', fotoArchivo.value)

  await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas`, {
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
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999]">
    <div
      class="bg-white rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
    >
      <h2 class="text-lg font-bold text-[#1e3a5f] mt-0 mb-5">Registrar Mascota</h2>

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
              <p class="text-xs m-0">Click para subir foto</p>
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
          <input v-model="form.name" placeholder="Nombre de la mascota" :class="ic('name')" />
          <p v-if="errores.name" class="text-red-500 text-xs m-0">{{ errores.name }}</p>
        </div>

        <!-- Especie -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Especie *</label>
          <input
            v-model="form.species"
            placeholder="Ej: Perro, Gato, Conejo..."
            :class="ic('species')"
            list="especies-list"
          />
          <datalist id="especies-list">
            <option value="Perro" />
            <option value="Gato" />
            <option value="Conejo" />
            <option value="Hámster" />
            <option value="Cobaya" />
            <option value="Pájaro" />
            <option value="Tortuga" />
            <option value="Pez" />
            <option value="Caballo" />
            <option value="Vaca" />
            <option value="Cerdo" />
            <option value="Cabra" />
            <option value="Oveja" />
            <option value="Gallina" />
            <option value="Pato" />
          </datalist>
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
          <input v-model="form.breed" placeholder="Ej: Labrador" :class="ic('breed')" />
        </div>

        <!-- Color -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Color</label>
          <input v-model="form.color" placeholder="Ej: Café con blanco" :class="ic('color')" />
        </div>

        <!-- Marcas -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Marcas especiales</label>
          <input
            v-model="form.special_marks"
            placeholder="Ej: Mancha en la oreja"
            :class="ic('special_marks')"
          />
        </div>

        <!-- Edad -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Edad</label>
          <div class="flex gap-2">
            <div class="flex-1 flex flex-col gap-1">
              <input
                v-model="form.age"
                type="number"
                min="0"
                max="30"
                placeholder="0"
                :class="ic('age')"
              />
              <span class="text-[10px] text-slate-400 text-center">Años</span>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <input
                v-model="form.age_months"
                type="number"
                min="0"
                max="11"
                placeholder="0"
                :class="ic('age_months')"
              />
              <span class="text-[10px] text-slate-400 text-center">Meses</span>
            </div>
          </div>
          <p v-if="errores.age" class="text-red-500 text-xs m-0">{{ errores.age }}</p>
          <p v-if="errores.age_months" class="text-red-500 text-xs m-0">{{ errores.age_months }}</p>
        </div>

        <!-- Peso -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Peso (kg)</label>
          <input
            v-model="form.weight"
            type="number"
            min="0"
            max="500"
            step="0.1"
            placeholder="0.0"
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
          @click="registrar"
          :disabled="guardando"
          class="flex-1 font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
          :class="
            guardando
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-[#1d6bbf] hover:bg-[#155fa8] text-white'
          "
        >
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
