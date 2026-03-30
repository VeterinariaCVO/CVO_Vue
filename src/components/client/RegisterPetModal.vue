<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

type PetForm = Omit<Pet, 'id' | 'owner_id' | 'active' | 'photo_path'>

const form = ref<PetForm>({
  name: '',
  species: '',
  sex: 'male',
  breed: null,
  color: null,
  special_marks: null,
  age: null,
  weight: null,
})

async function registrar() {
  const { execute } = ApiUseFetch('mis-mascotas').post(form.value).json()
  await execute()
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
