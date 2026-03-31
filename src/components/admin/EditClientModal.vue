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

  const { data, error, execute } = ApiUseFetch('admin/users').post({
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
    for (const campo in e) {
      errores.value = { ...errores.value, [campo]: e[campo][0] }
    }
    return
  }

  emit('guardado')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-9999">
    <div class="bg-white rounded-2xl p-7 w-full max-w-md shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-[#1e3a5f] m-0">Registrar Cliente</h2>
        <button
          @click="emit('cerrar')"
          class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Formulario -->
      <div class="flex flex-col gap-4">
        <!-- Nombre -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Nombre completo</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Ej. Juan Pérez"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>

        <!-- Correo -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Correo electrónico</label>
          <input
            v-model="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.email" class="text-xs text-red-500">{{ errores.email }}</span>
        </div>

        <!-- Teléfono -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Teléfono</label>
          <input
            v-model="telefono"
            type="text"
            placeholder="Ej. 8711234567"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.phone" class="text-xs text-red-500">{{ errores.phone }}</span>
        </div>

        <!-- Dirección -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Dirección</label>
          <input
            v-model="direccion"
            type="text"
            placeholder="Ej. Calle Falsa 123"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.address" class="text-xs text-red-500">{{ errores.address }}</span>
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