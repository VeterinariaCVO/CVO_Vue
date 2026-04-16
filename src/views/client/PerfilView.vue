<template>
  <div class="min-h-screen bg-[#f0f4ff] font-sans antialiased flex flex-col">
    <main class="w-full max-w-2xl mx-auto px-6 py-10 flex-1">
      <!-- Botón regresar -->
      <button
        @click="router.back()"
        class="group flex items-center gap-2 mb-6 bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-[#0056c2] text-slate-600 hover:text-[#0056c2] text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
      >
        <svg
          class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Regresar
      </button>

      <!-- Hero perfil -->
      <div
        class="relative rounded-3xl overflow-hidden p-8 mb-8 flex items-center gap-6"
        style="background: linear-gradient(135deg, #0056c2, #3b82f6)"
      >
        <div
          class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4"
        ></div>
        <div class="relative">
          <div
            class="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shadow-xl border-4 border-white/30"
          >
            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-cover" />
            <svg
              v-else
              class="w-10 h-10 text-white/60"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <!-- Botones foto en edición -->
          <div v-if="modoEdicion" class="absolute -bottom-1 -right-1 flex gap-1">
            <label
              class="w-8 h-8 rounded-full bg-white text-[#0056c2] shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              title="Cambiar foto"
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                @change="onFotoChange"
                class="hidden"
              />
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </label>
            <button
              v-if="fotoPreview"
              @click="eliminarFoto"
              class="w-8 h-8 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
              title="Quitar foto"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div class="relative z-10">
          <h1 class="text-2xl font-bold text-white m-0">{{ formulario.name || 'Mi Perfil' }}</h1>
          <span
            class="inline-block mt-1 px-3 py-0.5 bg-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-widest"
            >{{ rolActual }}</span
          >
          <p class="text-blue-100 text-sm mt-1 m-0">{{ formulario.email }}</p>
        </div>
      </div>

      <p v-if="errores.photo" class="text-red-500 text-xs mb-4 text-center">{{ errores.photo }}</p>

      <!-- Alertas -->
      <div
        v-if="mensajeExito"
        class="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6"
      >
        <svg
          class="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ mensajeExito }}
      </div>
      <div
        v-if="errorGeneral"
        class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
      >
        <svg
          class="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ errorGeneral }}
      </div>

      <!-- VISTA SOLO LECTURA -->
      <div v-if="!modoEdicion">
        <div class="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden mb-5">
          <div
            class="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50"
          >
            <span class="text-xs font-bold uppercase tracking-widest text-slate-400"
              >Información Personal</span
            >
          </div>
          <div
            v-for="item in datosLectura"
            :key="item.label"
            class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 last:border-none"
          >
            <span class="text-sm text-slate-400 w-28 shrink-0">{{ item.label }}</span>
            <span class="text-sm text-slate-800 font-medium text-right">{{
              item.valor || '—'
            }}</span>
          </div>
        </div>
        <button
          @click="modoEdicion = true"
          class="w-full py-3 rounded-2xl bg-[#0056c2] hover:bg-[#004baa] text-white font-bold text-sm border-none cursor-pointer transition-colors shadow-sm mb-10"
        >
          Editar perfil
        </button>
      </div>

      <!-- FORMULARIO DE EDICIÓN -->
      <form v-if="modoEdicion" @submit.prevent="actualizar" novalidate class="mb-10">
        <!-- Datos personales -->
        <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Datos Personales
          </p>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Nombre *</label>
              <input
                v-model="formulario.name"
                type="text"
                placeholder="Nombre completo"
                :class="ic('name')"
              />
              <p v-if="errores.name" class="text-red-500 text-xs m-0">{{ errores.name }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Correo *</label>
              <input
                v-model="formulario.email"
                type="email"
                placeholder="correo@ejemplo.com"
                :class="ic('email')"
              />
              <p v-if="errores.email" class="text-red-500 text-xs m-0">{{ errores.email }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-500">Teléfono</label>
                <input
                  v-model="formulario.phone"
                  type="tel"
                  maxlength="10"
                  placeholder="10 dígitos"
                  :class="ic('phone')"
                />
                <p v-if="errores.phone" class="text-red-500 text-xs m-0">{{ errores.phone }}</p>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-500">Género</label>
                <select v-model="formulario.gender" :class="ic('gender')">
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Domicilio</label>
              <input
                v-model="formulario.address"
                type="text"
                placeholder="Calle, número, colonia..."
                :class="ic('address')"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Fecha de nacimiento</label>
              <input
                v-model="formulario.birth_date"
                type="date"
                :max="hoy"
                :class="ic('birth_date')"
              />
              <p v-if="errores.birth_date" class="text-red-500 text-xs m-0">
                {{ errores.birth_date }}
              </p>
              <span v-else-if="edad !== null" class="text-xs text-slate-400">{{ edad }} años</span>
            </div>
          </div>
        </div>

        <!-- Contraseña -->
        <div class="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Cambiar Contraseña
            <span class="font-normal normal-case tracking-normal text-slate-300">— opcional</span>
          </p>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-500">Contraseña actual</label>
              <input
                v-model="formulario.current_password"
                type="password"
                placeholder="Tu contraseña actual"
                autocomplete="current-password"
                :class="ic('current_password')"
              />
              <p v-if="errores.current_password" class="text-red-500 text-xs m-0">
                {{ errores.current_password }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-500">Nueva contraseña</label>
                <input
                  v-model="formulario.password"
                  type="password"
                  placeholder="Mín. 8 caracteres"
                  autocomplete="new-password"
                  :class="ic('password')"
                />
                <p v-if="errores.password" class="text-red-500 text-xs m-0">
                  {{ errores.password }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-500">Confirmar</label>
                <input
                  v-model="formulario.password_confirmation"
                  type="password"
                  placeholder="Repite la contraseña"
                  autocomplete="new-password"
                  :class="ic('password_confirmation')"
                />
                <p v-if="errores.password_confirmation" class="text-red-500 text-xs m-0">
                  {{ errores.password_confirmation }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="cargando"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border-none cursor-pointer transition-colors"
            :class="
              cargando
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#0056c2] hover:bg-[#004baa] text-white'
            "
          >
            <svg v-if="cargando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <button
            type="button"
            @click="modoEdicion = false"
            :disabled="cargando"
            class="px-6 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      <!-- Eliminar cuenta -->
      <div class="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 bg-red-50 px-5 py-3 border-b border-red-100">
          <svg
            class="w-4 h-4 text-red-400 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-widest text-red-500"
            >Zona peligrosa</span
          >
        </div>
        <div class="px-5 py-5">
          <div v-if="!mostrarEliminar">
            <p class="text-sm text-slate-400 leading-relaxed mb-4">
              Eliminar tu cuenta borrará todos tus datos de forma permanente e irreversible.
            </p>
            <button
              @click="mostrarEliminar = true"
              class="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold border-none cursor-pointer transition-colors"
            >
              Eliminar mi cuenta
            </button>
          </div>
          <div v-else>
            <p class="text-sm text-slate-600 leading-relaxed mb-4">
              ¿Estás seguro? Esta acción <strong class="text-red-500">no se puede deshacer</strong>.
            </p>
            <div class="flex gap-3">
              <button
                @click="ejecutarEliminar"
                :disabled="cargando"
                class="px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors"
                :class="
                  cargando
                    ? 'bg-red-300 text-white cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                "
              >
                {{ cargando ? 'Eliminando...' : 'Sí, eliminar cuenta' }}
              </button>
              <button
                @click="mostrarEliminar = false"
                class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const formulario = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  gender: '',
  birth_date: '',
  current_password: '',
  password: '',
  password_confirmation: '',
  remove_photo: false,
})

const fotoPreview = ref<string | null>(null)
const fotoArchivo = ref<File | null>(null)
const cargando = ref(false)
const modoEdicion = ref(false)
const mostrarEliminar = ref(false)
const mensajeExito = ref('')
const errorGeneral = ref('')
const errores = ref<Record<string, string>>({})
const hoy = new Date().toISOString().split('T')[0]

function fotoPerfilUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) {
    return path.replace('api.natita.me/storage/', 'natita.me/storage/')
  }
  const storageBase = (import.meta.env.VITE_STORAGE_URL as string).replace(/\/$/, '')
  const pathLimpio = path.replace(/^\/storage\//, '').replace(/^storage\//, '')
  return `${storageBase}/${pathLimpio}`
}

const edad = computed(() => {
  if (!formulario.value.birth_date) return null
  const hoyDate = new Date()
  const nac = new Date(formulario.value.birth_date)
  let años = hoyDate.getFullYear() - nac.getFullYear()
  const m = hoyDate.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoyDate.getDate() < nac.getDate())) años--
  return años
})

const rolLabel: Record<string, string> = {
  cliente: 'Cliente',
  recepcionista: 'Recepcionista',
  veterinario: 'Veterinario',
  administrador: 'Administrador',
}
const rolActual = computed(() => rolLabel[auth.user?.role ?? ''] ?? 'Cliente')

const generoLabel: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
}

const datosLectura = computed(() => [
  { label: 'Nombre', valor: formulario.value.name },
  { label: 'Correo', valor: formulario.value.email },
  { label: 'Teléfono', valor: formulario.value.phone },
  { label: 'Domicilio', valor: formulario.value.address },
  { label: 'Género', valor: generoLabel[formulario.value.gender] ?? '—' },
  {
    label: 'Nacimiento',
    valor: formulario.value.birth_date
      ? new Date(formulario.value.birth_date + 'T00:00:00').toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + (edad.value !== null ? ` · ${edad.value} años` : '')
      : '',
  },
])

onMounted(() => {
  const u = auth.user
  formulario.value.name = u?.name ?? ''
  formulario.value.email = u?.email ?? ''
  formulario.value.phone = u?.phone ?? ''
  formulario.value.address = u?.address ?? ''
  formulario.value.gender = u?.gender ?? ''
  formulario.value.birth_date = u?.birth_date ?? ''
  fotoPreview.value = fotoPerfilUrl(u?.profile_photo)
})

function validar(): boolean {
  errores.value = {}

  if (!formulario.value.name.trim()) errores.value.name = 'El nombre es obligatorio.'
  else if (formulario.value.name.trim().length < 2) errores.value.name = 'Mínimo 2 caracteres.'

  if (!formulario.value.email.trim()) errores.value.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.value.email))
    errores.value.email = 'Correo inválido.'

  if (formulario.value.phone && !/^\d{10}$/.test(formulario.value.phone))
    errores.value.phone = 'Exactamente 10 dígitos.'

  if (formulario.value.birth_date && new Date(formulario.value.birth_date) >= new Date())
    errores.value.birth_date = 'Debe ser una fecha en el pasado.'

  const quiereCambiarPassword =
    formulario.value.password ||
    formulario.value.current_password ||
    formulario.value.password_confirmation

  if (quiereCambiarPassword) {
    if (!formulario.value.current_password)
      errores.value.current_password = 'Ingresa tu contraseña actual.'
    if (!formulario.value.password) errores.value.password = 'Ingresa la nueva contraseña.'
    else if (formulario.value.password.length < 8) errores.value.password = 'Mínimo 8 caracteres.'
    if (formulario.value.password !== formulario.value.password_confirmation)
      errores.value.password_confirmation = 'Las contraseñas no coinciden.'
  }

  if (fotoArchivo.value) {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!tiposPermitidos.includes(fotoArchivo.value.type))
      errores.value.photo = 'Solo jpeg, png, jpg o webp.'
    else if (fotoArchivo.value.size > 2 * 1024 * 1024) errores.value.photo = 'Máximo 2 MB.'
  }

  return Object.keys(errores.value).length === 0
}

function onFotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    errores.value.photo = 'Solo jpeg, png, jpg o webp.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    errores.value.photo = 'Máximo 2 MB.'
    return
  }
  fotoArchivo.value = file
  formulario.value.remove_photo = false
  const reader = new FileReader()
  reader.onload = (ev) => {
    fotoPreview.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function eliminarFoto() {
  fotoPreview.value = null
  fotoArchivo.value = null
  formulario.value.remove_photo = true
}

async function actualizar() {
  if (!validar()) return
  mensajeExito.value = ''
  errorGeneral.value = ''
  cargando.value = true

  const fd = new FormData()
  fd.append('name', formulario.value.name)
  fd.append('email', formulario.value.email)
  fd.append('phone', formulario.value.phone)
  fd.append('address', formulario.value.address)
  fd.append('gender', formulario.value.gender)
  fd.append('birth_date', formulario.value.birth_date)
  if (formulario.value.remove_photo) fd.append('remove_photo', '1')
  if (fotoArchivo.value) fd.append('profile_photo', fotoArchivo.value)
  if (formulario.value.password) {
    fd.append('current_password', formulario.value.current_password)
    fd.append('password', formulario.value.password)
    fd.append('password_confirmation', formulario.value.password_confirmation)
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/perfil`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' },
    body: fd,
  })

  const json = await response.json()
  cargando.value = false

  if (!response.ok) {
    if (json.errors) {
      errores.value = {}
      for (const campo in json.errors) {
        const valor = json.errors[campo]
        errores.value[campo] = Array.isArray(valor) ? valor[0] : valor
      }
    } else {
      errorGeneral.value = json.message || 'Error al actualizar el perfil.'
    }
    return
  }
  if (json.data?.profile_photo) {
    json.data.profile_photo = fotoPerfilUrl(json.data.profile_photo)
  }

  if (auth.user && json.data) {
    auth.user = { ...auth.user, ...json.data }
    localStorage.setItem('user', JSON.stringify(auth.user))
  }

  fotoPreview.value = fotoPerfilUrl(json.data?.profile_photo) ?? fotoPreview.value

  mensajeExito.value = '¡Perfil actualizado correctamente!'
  formulario.value.current_password = ''
  formulario.value.password = ''
  formulario.value.password_confirmation = ''
  fotoArchivo.value = null
  modoEdicion.value = false
}

async function ejecutarEliminar() {
  cargando.value = true
  mostrarEliminar.value = false
  errorGeneral.value = ''

  const response = await fetch(`${import.meta.env.VITE_API_URL}/perfil`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' },
  })

  cargando.value = false
  if (!response.ok) {
    errorGeneral.value = 'No se pudo eliminar la cuenta.'
    return
  }
  auth.logout()
}

const inputBase =
  'w-full border rounded-lg px-3 py-2 text-sm text-[#1e3a5f] bg-slate-50 outline-none transition-[border-color,box-shadow] duration-150 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,107,191,0.1)] box-border'

function ic(campo: string) {
  return (
    inputBase +
    (errores.value[campo] ? ' border-red-400' : ' border-[#dce6f0] focus:border-[#1d6bbf]')
  )
}
</script>
