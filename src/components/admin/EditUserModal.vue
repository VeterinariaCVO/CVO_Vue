<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const props = defineProps<{ id: number }>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const nombre = ref('')
const correo = ref('')
const contrasena = ref('')
const rolId = ref<number>(2)
const telefono = ref('')
const direccion = ref('')
const genero = ref('')
const fechaNacimiento = ref('')
const cargando = ref(false)
const cargandoDatos = ref(true)
const errores = ref<any>({})

async function cargarEmpleado() {
  cargandoDatos.value = true
  const { data, execute } = ApiUseFetch(`admin/users/${props.id}`).get().json()
  await execute()
  const empleado = data.value?.data
  nombre.value = empleado?.name ?? ''
  correo.value = empleado?.email ?? ''
  rolId.value = empleado?.role_id ?? 2
  telefono.value = empleado?.phone ?? ''
  direccion.value = empleado?.address ?? ''
  genero.value = empleado?.gender ?? ''
  fechaNacimiento.value = empleado?.birth_date ?? ''
  cargandoDatos.value = false
}

async function actualizar() {
  errores.value = {}
  cargando.value = true

  const payload: any = {
    name: nombre.value,
    email: correo.value,
    role_id: rolId.value,
    phone: telefono.value,
    address: direccion.value,
    gender: genero.value || null,
    birth_date: fechaNacimiento.value || null,
  }

  if (contrasena.value) {
    payload.password = contrasena.value
  }

  const { data, execute } = ApiUseFetch(`admin/users/${props.id}`).put(payload).json()
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

onMounted(cargarEmpleado)
</script>

<template>
  <div class="fixed inset-0 bg-black/45 flex items-center justify-center z-9999">
    <div class="bg-white rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-[#1e3a5f] m-0">Editar Empleado</h2>
        <button
          @click="emit('cerrar')"
          class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Cargando datos -->
      <p v-if="cargandoDatos" class="text-center text-slate-400 py-6">Cargando datos...</p>

      <!-- Formulario -->
      <div v-else class="flex flex-col gap-4">
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

        <!-- Contraseña -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Nueva contraseña <span class="text-slate-400 font-normal">(dejar vacío para no cambiar)</span></label>
          <input
            v-model="contrasena"
            type="password"
            placeholder="Mínimo 6 caracteres"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.password" class="text-xs text-red-500">{{ errores.password }}</span>
        </div>

        <!-- Rol -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Rol</label>
          <select
            v-model="rolId"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
          >
            <option :value="2">Recepcionista</option>
            <option :value="4">Veterinario</option>
          </select>
          <span v-if="errores.role_id" class="text-xs text-red-500">{{ errores.role_id }}</span>
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

        <!-- Género -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Género</label>
          <select
            v-model="genero"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors bg-white"
          >
            <option value="">Sin especificar</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
          <span v-if="errores.gender" class="text-xs text-red-500">{{ errores.gender }}</span>
        </div>

        <!-- Fecha de nacimiento -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">Fecha de nacimiento</label>
          <input
            v-model="fechaNacimiento"
            type="date"
            class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1d6bbf] transition-colors"
          />
          <span v-if="errores.birth_date" class="text-xs text-red-500">{{ errores.birth_date }}</span>
        </div>
      </div>

      <!-- Acciones -->
      <div v-if="!cargandoDatos" class="flex gap-3 mt-6">
        <button
          @click="emit('cerrar')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          @click="actualizar"
          :disabled="cargando"
          class="flex-1 bg-[#1d6bbf] hover:bg-[#155fa8] disabled:opacity-60 text-white font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
        >
          {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>