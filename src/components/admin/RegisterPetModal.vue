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
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  emit('guardado')
}

onMounted(cargarClientes)
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('cerrar')">
    <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-slate-800">Registrar mascota</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Dueño</label>
          <select v-model="ownerId" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
            <option :value="null">Selecciona un cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <span v-if="errores.owner_id" class="text-xs text-red-500">{{ errores.owner_id }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nombre</label>
          <input v-model="nombre" type="text" placeholder="Firulais" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Especie</label>
          <input v-model="especie" type="text" placeholder="Perro, Gato..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.species" class="text-xs text-red-500">{{ errores.species }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Raza</label>
          <input v-model="raza" type="text" placeholder="Labrador" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
        </div>
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Color</label>
            <input v-model="color" type="text" placeholder="Café" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Sexo</label>
            <select v-model="sexo" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Edad (años)</label>
            <input v-model.number="edad" type="number" min="0" placeholder="3" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Peso (kg)</label>
            <input v-model.number="peso" type="number" min="0" step="0.1" placeholder="5.5" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Marcas especiales</label>
          <input v-model="marcas" type="text" placeholder="Mancha en la pata" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
        </div>
      </div>

      <div class="flex gap-2 mt-5">
        <button @click="emit('cerrar')" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
        <button @click="registrar" :disabled="cargando" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
          {{ cargando ? 'Guardando...' : 'Registrar' }}
        </button>
      </div>
    </div>
  </div>
</template>