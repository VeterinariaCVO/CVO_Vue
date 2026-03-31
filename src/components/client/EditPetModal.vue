<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { Pet } from '@/types/pet'

const props = defineProps<{ id: number }>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const authStore = useAuthStore()
const cargando = ref(true)
const form = ref<Pet>({} as Pet)

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
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      Accept: 'application/json',
    },
  })
  const json = await response.json()
  form.value = json.data
  preview.value = json.data.photo_url ?? null
  cargando.value = false
}

async function guardar() {
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

  if (fotoArchivo.value) {
    formData.append('photo', fotoArchivo.value)
  }

  await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      Accept: 'application/json',
    },
    body: formData,
  })

  emit('cerrar')
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
                <span class="text-3xl">📷</span>
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
            <input
              v-model="form.name"
              placeholder="Nombre"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Especie -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Especie *</label>
            <input
              v-model="form.species"
              placeholder="Especie"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Sexo -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Sexo *</label>
            <select
              v-model="form.sex"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            >
              <option value="male">♂ Macho</option>
              <option value="female">♀ Hembra</option>
            </select>
          </div>

          <!-- Raza -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Raza</label>
            <input
              v-model="form.breed"
              placeholder="Raza"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Color -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Color</label>
            <input
              v-model="form.color"
              placeholder="Color"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Marcas especiales -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Marcas especiales</label>
            <input
              v-model="form.special_marks"
              placeholder="Marcas especiales"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Edad -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Edad (años)</label>
            <input
              v-model.number="form.age"
              type="number"
              min="0"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>

          <!-- Peso -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-slate-500">Peso (kg)</label>
            <input
              v-model.number="form.weight"
              type="number"
              min="0"
              step="0.1"
              class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-2.5 mt-5">
          <button
            @click="$emit('cerrar')"
            class="flex-1 bg-[#e8f0fa] hover:bg-blue-100 text-[#1d6bbf] font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="guardar"
            class="flex-1 bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
          >
            Actualizar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
