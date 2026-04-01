<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const nombre = ref('')
const correo = ref('')
const telefono = ref('')
const direccion = ref('')
const cargando = ref(false)
const errores = ref<any>({})

async function registrar() {
  errores.value = {}
  cargando.value = true
  const { data, execute } = ApiUseFetch('admin/users').post({
    name: nombre.value,
    email: correo.value,
    phone: telefono.value,
    address: direccion.value,
    role_id: 3,
    password: 'password123',
    active: true,
  }).json()
  await execute()
  cargando.value = false
  if (!data.value) return
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors as any
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  emit('guardado')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('cerrar')">
    <div class="bg-white rounded-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-slate-800">Registrar cliente</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nombre completo</label>
          <input v-model="nombre" type="text" placeholder="Juan Pérez" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Correo electrónico</label>
          <input v-model="correo" type="email" placeholder="correo@ejemplo.com" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.email" class="text-xs text-red-500">{{ errores.email }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Teléfono</label>
          <input v-model="telefono" type="text" placeholder="8711234567" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.phone" class="text-xs text-red-500">{{ errores.phone }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Dirección</label>
          <input v-model="direccion" type="text" placeholder="Calle Falsa 123" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.address" class="text-xs text-red-500">{{ errores.address }}</span>
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