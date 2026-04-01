<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const cargando = ref(false)
const cargandoDatos = ref(true)
const mensajeExito = ref('')
const errores = ref<any>({})
const modoEdicion = ref(false)

const nombre = ref('')
const correo = ref('')
const telefono = ref('')
const direccion = ref('')
const genero = ref('')
const fechaNacimiento = ref('')
const fotoActual = ref<string | null>(null)
const fotoNueva = ref<File | null>(null)
const fotoPreview = ref<string | null>(null)
const eliminarFoto = ref(false)

const contraseniaActual = ref('')
const contraseniaNueva = ref('')
const contraseniaConfirmar = ref('')
const seccionContrasenia = ref(false)
const cargandoContrasenia = ref(false)
const erroresContrasenia = ref<any>({})

const edad = computed(() => {
  if (!fechaNacimiento.value) return null
  const diff = Date.now() - new Date(fechaNacimiento.value).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
})

const nombreRol = computed(() => {
  const map: Record<number, string> = { 1: 'Administrador', 2: 'Recepcionista', 3: 'Cliente', 4: 'Veterinario' }
  return map[auth.user?.role_id ?? 0] ?? '—'
})

async function cargarPerfil() {
  cargandoDatos.value = true
  const { data, execute } = ApiUseFetch('/me').get().json()
  await execute()
  const u = data.value?.data ?? data.value?.user ?? data.value
  nombre.value = u?.name ?? ''
  correo.value = u?.email ?? ''
  telefono.value = u?.phone ?? ''
  direccion.value = u?.address ?? ''
  genero.value = u?.gender ?? ''
  fechaNacimiento.value = u?.birth_date ?? ''
  fotoActual.value = u?.profile_photo ?? null
  cargandoDatos.value = false
}

function onFotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fotoNueva.value = file
  eliminarFoto.value = false
  fotoPreview.value = URL.createObjectURL(file)
}

function onEliminarFoto() {
  eliminarFoto.value = true
  fotoNueva.value = null
  fotoPreview.value = null
}

async function guardar() {
  errores.value = {}
  cargando.value = true
  const formData = new FormData()
  formData.append('name', nombre.value)
  formData.append('email', correo.value)
  if (telefono.value) formData.append('phone', telefono.value)
  if (direccion.value) formData.append('address', direccion.value)
  if (genero.value) formData.append('gender', genero.value)
  if (fechaNacimiento.value) formData.append('birth_date', fechaNacimiento.value)
  if (fotoNueva.value) formData.append('profile_photo', fotoNueva.value)
  if (eliminarFoto.value) formData.append('remove_photo', '1')
  formData.append('_method', 'PUT')

  const { data, execute } = ApiUseFetch('/me').post(formData).json()
  await execute()
  cargando.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  mensajeExito.value = 'Perfil actualizado correctamente'
  modoEdicion.value = false
  fotoNueva.value = null
  fotoPreview.value = null
  eliminarFoto.value = false
  await cargarPerfil()
  setTimeout(() => (mensajeExito.value = ''), 3000)
}

async function cambiarContrasenia() {
  erroresContrasenia.value = {}
  if (contraseniaNueva.value !== contraseniaConfirmar.value) {
    erroresContrasenia.value.confirmar = 'Las contraseñas no coinciden'
    return
  }
  cargandoContrasenia.value = true
  const { data, execute } = ApiUseFetch('/me/password').put({
    current_password: contraseniaActual.value,
    password: contraseniaNueva.value,
    password_confirmation: contraseniaConfirmar.value,
  }).json()
  await execute()
  cargandoContrasenia.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors
    for (const campo in e) erroresContrasenia.value[campo] = e[campo][0]
    return
  }
  mensajeExito.value = 'Contraseña actualizada correctamente'
  seccionContrasenia.value = false
  contraseniaActual.value = ''
  contraseniaNueva.value = ''
  contraseniaConfirmar.value = ''
  setTimeout(() => (mensajeExito.value = ''), 3000)
}

function cancelar() {
  modoEdicion.value = false
  fotoNueva.value = null
  fotoPreview.value = null
  eliminarFoto.value = false
  errores.value = {}
  cargarPerfil()
}

onMounted(cargarPerfil)
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-slate-800 m-0">Mi Perfil</h1>
      <p class="text-sm text-slate-400 mt-0.5 mb-0">Consulta y edita tu información personal</p>
    </div>

    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none">×</button>
    </div>

    <div v-if="cargandoDatos" class="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"></div>
    </div>

    <div v-else class="flex flex-col gap-4">

      <!-- Card principal -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-start gap-6 mb-6">
          <!-- Foto -->
          <div class="relative shrink-0">
            <div class="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
              <img v-if="fotoPreview" :src="fotoPreview" class="w-20 h-20 object-cover" />
              <img v-else-if="fotoActual && !eliminarFoto" :src="fotoActual" class="w-20 h-20 object-cover" />
              <svg v-else class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div v-if="modoEdicion" class="mt-2 flex flex-col gap-1">
              <label class="text-xs text-[#1d6bbf] cursor-pointer text-center hover:underline">
                <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" class="hidden" @change="onFotoChange" />
                Cambiar foto
              </label>
              <button v-if="fotoActual || fotoPreview" @click="onEliminarFoto" class="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">Eliminar foto</button>
            </div>
            <span v-if="eliminarFoto" class="text-xs text-red-500 block text-center mt-1">Se eliminará</span>
          </div>

          <!-- Info básica -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-lg font-semibold text-slate-800 m-0">{{ nombre }}</h2>
              <span class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">{{ nombreRol }}</span>
            </div>
            <p class="text-sm text-slate-400 m-0">{{ correo }}</p>
            <p v-if="edad" class="text-xs text-slate-400 mt-0.5 m-0">{{ edad }} años</p>
          </div>

          <div class="shrink-0">
            <button
              v-if="!modoEdicion"
              @click="modoEdicion = true"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Editar perfil
            </button>
          </div>
        </div>

        <!-- Campos -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Nombre completo</label>
            <input v-if="modoEdicion" v-model="nombre" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ nombre || '—' }}</p>
            <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Correo electrónico</label>
            <input v-if="modoEdicion" v-model="correo" type="email" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ correo || '—' }}</p>
            <span v-if="errores.email" class="text-xs text-red-500">{{ errores.email }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Teléfono</label>
            <input v-if="modoEdicion" v-model="telefono" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ telefono || '—' }}</p>
            <span v-if="errores.phone" class="text-xs text-red-500">{{ errores.phone }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Género</label>
            <select v-if="modoEdicion" v-model="genero" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
              <option value="">Sin especificar</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ genero || '—' }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Fecha de nacimiento</label>
            <input v-if="modoEdicion" v-model="fechaNacimiento" type="date" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ fechaNacimiento || '—' }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Dirección</label>
            <input v-if="modoEdicion" v-model="direccion" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <p v-else class="text-sm text-slate-800 m-0 py-2">{{ direccion || '—' }}</p>
            <span v-if="errores.address" class="text-xs text-red-500">{{ errores.address }}</span>
          </div>
        </div>

        <div v-if="modoEdicion" class="flex gap-2 mt-6 pt-5 border-t border-slate-100">
          <button @click="cancelar" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
          <button @click="guardar" :disabled="cargando" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>

      <!-- Card contraseña -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-700 m-0">Contraseña</p>
            <p class="text-xs text-slate-400 mt-0.5 m-0">Actualiza tu contraseña de acceso</p>
          </div>
          <button
            @click="seccionContrasenia = !seccionContrasenia"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ seccionContrasenia ? 'Cancelar' : 'Cambiar contraseña' }}
          </button>
        </div>

        <div v-if="seccionContrasenia" class="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-xs text-slate-400">Contraseña actual</label>
            <input v-model="contraseniaActual" type="password" placeholder="Ingresa tu contraseña actual" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <span v-if="erroresContrasenia.current_password" class="text-xs text-red-500">{{ erroresContrasenia.current_password }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Nueva contraseña</label>
            <input v-model="contraseniaNueva" type="password" placeholder="Mínimo 6 caracteres" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <span v-if="erroresContrasenia.password" class="text-xs text-red-500">{{ erroresContrasenia.password }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-400">Confirmar nueva contraseña</label>
            <input v-model="contraseniaConfirmar" type="password" placeholder="Repite la nueva contraseña" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <span v-if="erroresContrasenia.confirmar" class="text-xs text-red-500">{{ erroresContrasenia.confirmar }}</span>
          </div>
          <div class="col-span-2 flex gap-2 mt-1">
            <button @click="seccionContrasenia = false; erroresContrasenia = {}" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
            <button @click="cambiarContrasenia" :disabled="cargandoContrasenia" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
              {{ cargandoContrasenia ? 'Actualizando...' : 'Actualizar contraseña' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>