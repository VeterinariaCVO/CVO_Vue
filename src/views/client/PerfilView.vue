<template>
  <div class="min-h-screen bg-[#f8fafc] italic flex flex-col font-sans antialiased">
    <main class="w-full max-w-2xl mx-auto px-6 py-10 flex-1">
      <button
        @click="router.back()"
        class="group flex items-center gap-2 mb-8 bg-white border border-slate-100 shadow-sm hover:shadow-md text-slate-400 hover:text-[#3f98ff] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl cursor-pointer transition-all italic border-none"
      >
        <svg
          class="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Regresar
      </button>

      <div
        class="relative rounded-[2.5rem] overflow-hidden p-10 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-900/10"
        style="background: linear-gradient(135deg, #1e293b, #0f172a)"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-[#3f98ff]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"
        ></div>

        <div class="relative">
          <div
            class="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-800 flex items-center justify-center shadow-2xl border-4 border-white/10"
          >
            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-cover" />
            <div v-else class="text-[#3f98ff] opacity-40">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </div>
          </div>

          <div v-if="modoEdicion" class="absolute -bottom-2 -right-2 flex gap-2">
            <label
              class="w-10 h-10 rounded-2xl bg-[#3f98ff] text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all"
            >
              <input type="file" accept="image/*" @change="onFotoChange" class="hidden" />
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </label>
            <button
              v-if="fotoPreview"
              @click="eliminarFoto"
              class="w-10 h-10 rounded-2xl bg-white text-red-500 shadow-lg flex items-center justify-center hover:scale-110 border-none cursor-pointer"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="relative z-10 text-center md:text-left">
          <span
            class="inline-block px-4 py-1 bg-[#3f98ff] rounded-xl text-white text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-lg shadow-[#3f98ff]/30"
          >
            {{ rolActual }}
          </span>
          <h1 class="text-4xl font-black text-white m-0 tracking-tighter uppercase italic">
            {{ formulario.name || 'MI PERFIL' }}
          </h1>
          <p class="text-slate-400 text-sm font-bold mt-1 m-0 tracking-wide">
            {{ formulario.email }}
          </p>
        </div>
      </div>

      <div
        v-if="mensajeExito"
        class="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 flex items-center gap-3"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          />
        </svg>
        {{ mensajeExito }}
      </div>

      <div
        v-if="errorGeneral"
        class="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 flex items-center gap-3"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          />
        </svg>
        {{ errorGeneral }}
      </div>

      <div v-if="!modoEdicion" class="space-y-4">
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div
              v-for="item in datosLectura"
              :key="item.label"
              class="p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1 group-hover:text-[#3f98ff]"
              >
                {{ item.label }}
              </p>
              <p class="text-sm font-black text-slate-700 uppercase tracking-tight m-0">
                {{ item.valor || '—' }}
              </p>
            </div>
          </div>
        </div>
        <button
          @click="modoEdicion = true"
          class="w-full py-5 rounded-[1.5rem] bg-[#3f98ff] hover:bg-[#2d87ee] text-white font-black uppercase text-[11px] tracking-[0.3em] border-none cursor-pointer transition-all shadow-xl shadow-[#3f98ff]/20 active:scale-95"
        >
          Editar mis datos
        </button>
      </div>

      <form v-else @submit.prevent="actualizar" class="space-y-6">
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 space-y-6">
          <p
            class="text-[10px] font-black uppercase tracking-[0.2em] text-[#3f98ff] border-b border-slate-50 pb-4"
          >
            Información Personal
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >Nombre *</label
              >
              <input v-model="formulario.name" type="text" :class="ic('name')" />
              <p
                v-if="errores?.name"
                class="text-red-500 text-[9px] font-black uppercase italic m-0 mt-1"
              >
                {{ errores.name }}
              </p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >Email *</label
              >
              <input v-model="formulario.email" type="email" :class="ic('email')" />
              <p
                v-if="errores?.email"
                class="text-red-500 text-[9px] font-black uppercase italic m-0 mt-1"
              >
                {{ errores.email }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >Teléfono</label
              >
              <input v-model="formulario.phone" type="tel" :class="ic('phone')" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >Género</label
              >
              <select v-model="formulario.gender" :class="ic('gender')">
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Domicilio</label
            >
            <input v-model="formulario.address" type="text" :class="ic('address')" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >Fecha Nacimiento</label
            >
            <input
              v-model="formulario.birth_date"
              type="date"
              :max="hoy"
              :class="ic('birth_date')"
            />
          </div>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 space-y-6">
          <p
            class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-4"
          >
            Cambiar Contraseña (Opcional)
          </p>
          <div class="flex flex-col gap-4">
            <input
              v-model="formulario.current_password"
              type="password"
              placeholder="CONTRASEÑA ACTUAL"
              :class="ic('current_password')"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                v-model="formulario.password"
                type="password"
                placeholder="NUEVA CONTRASEÑA"
                :class="ic('password')"
              />
              <input
                v-model="formulario.password_confirmation"
                type="password"
                placeholder="CONFIRMAR NUEVA"
                :class="ic('password_confirmation')"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="cargando"
            class="flex-[2] py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] border-none cursor-pointer transition-all shadow-xl shadow-[#3f98ff]/20"
            :class="
              cargando
                ? 'bg-slate-200 text-slate-400'
                : 'bg-[#3f98ff] text-white hover:bg-[#2d87ee]'
            "
          >
            {{ cargando ? 'Sincronizando...' : 'Guardar Cambios' }}
          </button>
          <button
            type="button"
            @click="modoEdicion = false"
            class="flex-1 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-white text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

// --- ESTADOS ---
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
const mensajeExito = ref('')
const errorGeneral = ref('')
const errores = ref<Record<string, string>>({})
const hoy = new Date().toISOString().split('T')[0]

// --- UTILIDADES ---

// Función para manejar clases de input con validación
function ic(campo: string) {
  const base =
    'w-full bg-[#f8fafc] border-2 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-800 uppercase italic outline-none transition-all focus:bg-white'
  // Acceso seguro a errores.value
  const tieneError = errores.value && errores.value[campo]
  return `${base} ${tieneError ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-[#3f98ff]'}`
}

// Formateo de URL de imagen
function fotoPerfilUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path.replace('api.natita.me/storage/', 'natita.me/storage/')
  const storageBase = (import.meta.env.VITE_STORAGE_URL as string).replace(/\/$/, '')
  const pathLimpio = path.replace(/^\/?storage\//, '')
  return `${storageBase}/${pathLimpio}`
}

// --- COMPUTADOS ---

const rolActual = computed(() => {
  const roles: Record<string, string> = {
    cliente: 'Cliente',
    veterinario: 'Veterinario',
    admin: 'Administrador',
    recepcionista: 'Recepcionista',
  }
  return roles[auth.user?.role ?? ''] ?? 'Usuario'
})

const datosLectura = computed(() => [
  { label: 'Nombre', valor: formulario.value.name },
  { label: 'Email', valor: formulario.value.email },
  { label: 'Teléfono', valor: formulario.value.phone },
  { label: 'Dirección', valor: formulario.value.address },
  { label: 'Género', valor: formulario.value.gender || 'No especificado' },
])

// --- CICLO DE VIDA ---

onMounted(() => {
  const u = auth.user
  if (u) {
    formulario.value.name = u.name || ''
    formulario.value.email = u.email || ''
    formulario.value.phone = u.phone || ''
    formulario.value.address = u.address || ''
    formulario.value.gender = u.gender || ''
    formulario.value.birth_date = u.birth_date || ''
    fotoPreview.value = fotoPerfilUrl(u.profile_photo)
  }
})

// --- ACCIONES ---

function onFotoChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

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
  // Resetear estados
  errores.value = {}
  errorGeneral.value = ''
  mensajeExito.value = ''
  cargando.value = true

  const fd = new FormData()
  fd.append('name', formulario.value.name)
  fd.append('email', formulario.value.email)
  fd.append('phone', formulario.value.phone)
  fd.append('address', formulario.value.address)
  fd.append('gender', formulario.value.gender)
  fd.append('birth_date', formulario.value.birth_date)

  if (fotoArchivo.value) fd.append('profile_photo', fotoArchivo.value)
  if (formulario.value.remove_photo) fd.append('remove_photo', '1')

  // Solo enviar contraseñas si el usuario llenó el campo de nueva contraseña
  if (formulario.value.password) {
    fd.append('current_password', formulario.value.current_password)
    fd.append('password', formulario.value.password)
    fd.append('password_confirmation', formulario.value.password_confirmation)
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/perfil`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json',
      },
      body: fd,
    })

    const resData = await response.json()

    if (!response.ok) {
      if (resData.errors) {
        errores.value = resData.errors
      } else {
        errorGeneral.value = resData.message || 'ERROR AL ACTUALIZAR EL PERFIL'
      }
    } else {
      mensajeExito.value = '¡PERFIL ACTUALIZADO CON ÉXITO!'

      // Actualizar Store Global
      if (auth.user && resData.data) {
        auth.user = { ...auth.user, ...resData.data }
        localStorage.setItem('user', JSON.stringify(auth.user))
      }

      // Salir del modo edición tras un breve delay
      setTimeout(() => {
        modoEdicion.value = false
        mensajeExito.value = ''
      }, 2000)
    }
  } catch (error: any) {
    console.error('Error de petición:', error)
    errorGeneral.value = 'ERROR DE CONEXIÓN CON EL SERVIDOR'
  } finally {
    cargando.value = false
  }
}
</script>
