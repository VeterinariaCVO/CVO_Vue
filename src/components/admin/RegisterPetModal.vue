<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Client } from '@/types/client'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const nombre = ref('')
const especie = ref('')
const raza = ref('')
const color = ref('')
const marcas = ref('')
const sexo = ref<'male' | 'female'>('male')
const edad = ref<number | null>(null)
const peso = ref<number | null>(null)
const ownerId = ref<number | null>(null)
const clientes = ref<Client[]>([])
const cargando = ref(false)
const errores = ref<any>({})

async function cargarClientes() {
  const { data, execute } = ApiUseFetch('admin/users').get().json()
  await execute()
  const todos = data.value?.data ?? []
  clientes.value = todos.filter((u: any) => u.role_id === 3)
}

async function registrar() {
  errores.value = {}
  cargando.value = true

  const { data, execute } = ApiUseFetch('pets').post({
    name: nombre.value,
    species: especie.value,
    breed: raza.value || null,
    color: color.value || null,
    special_marks: marcas.value || null,
    sex: sexo.value,
    age: edad.value,
    weight: peso.value,
    owner_id: ownerId.value,
  }).json()

  await execute()
  cargando.value = false

  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors as any
    for (const campo in e) {
      errores.value = { ...errores.value, [campo]: e[campo][0] }
    }
    return
  }

  emit('guardado')
}

onMounted(cargarClientes)
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-9999">
    <div class="bg-white rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-[#1e3a5f] m-0">Registrar Mascota</h2>
        <button
          @click="emit('cerrar')"
          class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Dueño -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Dueño (cliente)</label>
          <select
            v-model="ownerId"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
          >
            <option :value="null">Selecciona un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.name }}
            </option>
          </select>
          <span v-if="errores.owner_id" class="text-xs text-red-500">{{ errores.owner_id }}</span>
        </div>

        <!-- Nombre -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Nombre</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Ej. Firulais"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>

        <!-- Especie -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Especie</label>
          <input
            v-model="especie"
            type="text"
            placeholder="Ej. Perro, Gato"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.species" class="text-xs text-red-500">{{ errores.species }}</span>
        </div>

        <!-- Raza -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Raza</label>
          <input
            v-model="raza"
            type="text"
            placeholder="Ej. Labrador"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
        </div>

        <!-- Color -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Color</label>
          <input
            v-model="color"
            type="text"
            placeholder="Ej. Café"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
        </div>

        <!-- Marcas especiales -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Marcas especiales</label>
          <input
            v-model="marcas"
            type="text"
            placeholder="Ej. Mancha en la pata"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
        </div>

        <!-- Sexo -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Sexo</label>
          <select
            v-model="sexo"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
          >
            <option value="male">Macho</option>
            <option value="female">Hembra</option>
          </select>
        </div>

        <!-- Edad y Peso -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs font-semibold text-slate-600">Edad (años)</label>
            <input
              v-model.number="edad"
              type="number"
              min="0"
              placeholder="Ej. 3"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
            />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs font-semibold text-slate-600">Peso (kg)</label>
            <input
              v-model.number="peso"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej. 5.5"
              class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 mt-6">
        <button
          @click="emit('cerrar')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          @click="registrar"
          :disabled="cargando"
          class="flex-1 bg-[#1d6bbf] hover:bg-[#155fa8] disabled:opacity-60 text-white font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
        >
          {{ cargando ? 'Guardando...' : 'Registrar' }}
        </button>
      </div>
    </div>
  </div>
</template>