<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const authStore = useAuthStore()

const form = ref({
  name: '',
  species: '',
  sex: 'male',
  breed: '',
  color: '',
  special_marks: '',
  age: '',
  weight: '',
})

// ── Foto ──────────────────────────────────────────────────────────────────────
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

// ── Registrar con FormData para poder enviar la foto ─────────────────────────
async function registrar() {
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('species', form.value.species)
  formData.append('sex', form.value.sex)
  formData.append('breed', form.value.breed)
  formData.append('color', form.value.color)
  formData.append('special_marks', form.value.special_marks)
  formData.append('age', form.value.age)
  formData.append('weight', form.value.weight)
  if (fotoArchivo.value) {
    formData.append('photo', fotoArchivo.value)
  }

  await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      Accept: 'application/json',
    },
    body: formData,
  })

  emit('cerrar')
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
              <span class="text-3xl">📷</span>
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
          <input
            v-model="form.name"
            placeholder="Nombre de la mascota"
            class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
          />
        </div>

        <!-- Especie -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Especie *</label>
          <input
            v-model="form.species"
            placeholder="Ej: Perro, Gato"
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
            placeholder="Ej: Labrador"
            class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
          />
        </div>

        <!-- Color -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Color</label>
          <input
            v-model="form.color"
            placeholder="Ej: Café con blanco"
            class="w-full border border-[#dce6f0] rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#1d6bbf] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border"
          />
        </div>

        <!-- Marcas especiales -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-500">Marcas especiales</label>
          <input
            v-model="form.special_marks"
            placeholder="Ej: Mancha en la oreja"
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
            placeholder="0"
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
            placeholder="0.0"
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
          @click="registrar"
          class="flex-1 bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>
