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
  const e = data.value?.data
  nombre.value = e?.name ?? ''
  correo.value = e?.email ?? ''
  rolId.value = e?.role_id ?? 2
  telefono.value = e?.phone ?? ''
  direccion.value = e?.address ?? ''
  genero.value = e?.gender ?? ''
  fechaNacimiento.value = e?.birth_date ?? ''
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
  if (contrasena.value) payload.password = contrasena.value
  const { data, execute } = ApiUseFetch(`admin/users/${props.id}`).put(payload).json()
  await execute()
  cargando.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors as any
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  emit('guardado')
}

onMounted(cargarEmpleado)
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('cerrar')">
    <div class="bg-white rounded-xl w-full max-w-2xl p-7 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-base font-semibold text-slate-800">Editar empleado</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <p v-if="cargandoDatos" class="text-sm text-slate-400 py-4 text-center">Cargando...</p>

      <div v-else class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nombre completo</label>
          <input v-model="nombre" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Correo electrónico</label>
          <input v-model="correo" type="email" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.email" class="text-xs text-red-500">{{ errores.email }}</span>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label class="text-xs text-slate-500">Nueva contraseña <span class="text-slate-400">(dejar vacío para no cambiar)</span></label>
          <input v-model="contrasena" type="password" placeholder="Mínimo 6 caracteres" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.password" class="text-xs text-red-500">{{ errores.password }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Rol</label>
          <select v-model="rolId" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
            <option :value="2">Recepcionista</option>
            <option :value="4">Veterinario</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Teléfono</label>
          <input v-model="telefono" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.phone" class="text-xs text-red-500">{{ errores.phone }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Dirección</label>
          <input v-model="direccion" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.address" class="text-xs text-red-500">{{ errores.address }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Género</label>
          <select v-model="genero" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
            <option value="">Sin especificar</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Fecha de nacimiento</label>
          <input v-model="fechaNacimiento" type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.birth_date" class="text-xs text-red-500">{{ errores.birth_date }}</span>
        </div>
      </div>

      <div v-if="!cargandoDatos" class="flex gap-2 mt-6">
        <button @click="emit('cerrar')" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
        <button @click="actualizar" :disabled="cargando" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
          {{ cargando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>