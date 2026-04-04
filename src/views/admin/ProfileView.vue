<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useAuthStore } from '@/stores/authStore'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal.vue'

const auth = useAuthStore()
const cargando = ref(false)
const cargandoDatos = ref(true)
const mensajeExito = ref('')
const errores = ref<any>({})
const modoEdicion = ref(false)
const mostrarModalContrasenia = ref(false)

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

const edad = computed(() => {
  if (!fechaNacimiento.value) return null
  const diff = Date.now() - new Date(fechaNacimiento.value).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
})

const nombreRol = computed(() => {
  const map: Record<number, string> = { 1: 'Administrador', 2: 'Recepcionista', 3: 'Cliente', 4: 'Veterinario' }
  return map[auth.user?.role_id ?? 0] ?? '—'
})

// Buscar correcto de la respuesta
function BuscarUsuario(response: any) {
  const u = response?.data ?? response
  nombre.value          = u?.name ?? ''
  correo.value          = u?.email ?? ''
  telefono.value        = u?.phone ?? ''
  direccion.value       = u?.address ?? ''
  genero.value          = u?.gender ?? ''
  fechaNacimiento.value = u?.birth_date ?? ''
  fotoActual.value      = u?.profile_photo ?? null
}

async function cargarPerfil() {
  cargandoDatos.value = true
  const { data, execute } = ApiUseFetch('/me').get().json()
  await execute()

  const u = (data.value as any)?.data
  nombre.value          = u?.name ?? ''
  correo.value          = u?.email ?? ''
  telefono.value        = u?.phone ?? ''
  direccion.value       = u?.address ?? ''
  genero.value          = u?.gender ?? ''
  fechaNacimiento.value = u?.birth_date ?? ''
  fotoActual.value      = u?.profile_photo ?? null
  cargandoDatos.value   = false
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

  // Usar JSON en lugar de FormData
  const payload: Record<string, any> = {
    name: nombre.value,
    email: correo.value,
    phone: telefono.value || null,
    address: direccion.value || null,
    gender: genero.value || null,
    birth_date: fechaNacimiento.value || null,
  }

  const { data, execute } = ApiUseFetch('/me/update').post(payload).json()
  await execute()

  console.log('Respuesta:', data.value)

  cargando.value = false

  const resp = data.value as any

  if (resp?.errors) {
    for (const campo in resp.errors) {
      errores.value[campo] = resp.errors[campo][0]
    }
    return
  }

  BuscarUsuario(resp)
  mensajeExito.value = 'Perfil actualizado correctamente'
  modoEdicion.value = false
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

function onContraseniaGuardada() {
  mostrarModalContrasenia.value = false
  mensajeExito.value = 'Contraseña actualizada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
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
            @click="mostrarModalContrasenia = true"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cambiar contraseña
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal contraseña -->
  <ChangePasswordModal
    v-if="mostrarModalContrasenia"
    @cerrar="mostrarModalContrasenia = false"
    @guardado="onContraseniaGuardada"
  />
</template>