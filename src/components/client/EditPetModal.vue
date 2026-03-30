<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'

const props = defineProps<{ id: number }>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const cargando = ref(true)
const form = ref<Pet>({} as Pet)

async function cargarMascota() {
  const { data, execute } = ApiUseFetch(`mis-mascotas/${props.id}`).get().json()
  await execute()
  form.value = data.value.data
  cargando.value = false
}

async function guardar() {
  const { execute } = ApiUseFetch(`mis-mascotas/${props.id}`).put(form.value).json()
  await execute()
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
