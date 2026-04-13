<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

// ── Estado principal ──────────────────────────────────────────────────────────
const clientes = ref<any[]>([])
const cargando = ref(true)
const busqueda = ref('')
const mensajeExito = ref('')
const mensajeError = ref('')

// ── Modal: Ver mascotas del cliente ──────────────────────────────────────────
const mostrarMascotas = ref(false)
const clienteSeleccionado = ref<any>(null)
const mascotasCliente = ref<any[]>([])
const cargandoMascotas = ref(false)

// ── Modal: Registrar cliente ──────────────────────────────────────────────────
const mostrarRegistrar = ref(false)
const guardandoRegistro = ref(false)
const formRegistro = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role_id: 3,
})
const erroresRegistro = ref<Record<string, string>>({})

// ── Modal: Editar cliente ─────────────────────────────────────────────────────
const mostrarEditar = ref(false)
const guardandoEdicion = ref(false)
const clienteEditando = ref<any>(null)
const formEdicion = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
})
const erroresEdicion = ref<Record<string, string>>({})

// ── Modal: Confirmar eliminación ──────────────────────────────────────────────
const mostrarEliminar = ref(false)
const clienteAEliminar = ref<any>(null)
const eliminando = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
const storageUrl = (import.meta.env.VITE_API_URL as string).replace('/api', '') + '/storage/'

function fotoUrl(path: string | null) {
  return path ? storageUrl + path : null
}

const clientesFiltrados = computed(() => {
  if (!busqueda.value.trim()) return clientes.value
  const q = busqueda.value.toLowerCase()
  return clientes.value.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.phone?.toLowerCase().includes(q)
  )
})

// ── Carga de clientes ─────────────────────────────────────────────────────────
async function cargarClientes() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('empleado/clients').get().json()
  await execute()
  clientes.value = data.value?.data ?? []
  cargando.value = false
}

// ── Ver mascotas del cliente ──────────────────────────────────────────────────
async function verMascotas(cliente: any) {
  clienteSeleccionado.value = cliente
  mascotasCliente.value = []
  mostrarMascotas.value = true
  cargandoMascotas.value = true
  const { data, execute } = ApiUseFetch(`empleado/clients/${cliente.id}`).get().json()
  await execute()
  mascotasCliente.value = data.value?.data?.pets ?? []
  cargandoMascotas.value = false
}

// ── Registrar cliente ─────────────────────────────────────────────────────────
function abrirRegistrar() {
  formRegistro.value = { name: '', email: '', phone: '', address: '', password: '', role_id: 3 }
  erroresRegistro.value = {}
  mostrarRegistrar.value = true
}

function validarRegistro() {
  const e: Record<string, string> = {}
  if (!formRegistro.value.name.trim()) e.name = 'El nombre es requerido'
  if (!formRegistro.value.email.trim()) e.email = 'El correo es requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formRegistro.value.email)) e.email = 'Correo inválido'
  if (!formRegistro.value.password.trim()) e.password = 'La contraseña es requerida'
  else if (formRegistro.value.password.length < 6) e.password = 'Mínimo 6 caracteres'
  erroresRegistro.value = e
  return Object.keys(e).length === 0
}

async function guardarRegistro() {
  if (!validarRegistro()) return
  guardandoRegistro.value = true
  const { error, execute } = ApiUseFetch('admin/users')
    .post({ ...formRegistro.value }).json()
  await execute()
  guardandoRegistro.value = false
  if (error.value) {
    mostrarErrorMsg('Error al registrar el cliente. Verifica que el correo no esté en uso.')
  } else {
    mostrarRegistrar.value = false
    mostrarExitoMsg('Cliente registrado correctamente')
    await cargarClientes()
  }
}

// ── Editar cliente ────────────────────────────────────────────────────────────
function abrirEditar(cliente: any) {
  clienteEditando.value = cliente
  formEdicion.value = {
    name: cliente.name ?? '',
    email: cliente.email ?? '',
    phone: cliente.phone ?? '',
    address: cliente.address ?? '',
  }
  erroresEdicion.value = {}
  mostrarEditar.value = true
}

function validarEdicion() {
  const e: Record<string, string> = {}
  if (!formEdicion.value.name.trim()) e.name = 'El nombre es requerido'
  if (!formEdicion.value.email.trim()) e.email = 'El correo es requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEdicion.value.email)) e.email = 'Correo inválido'
  erroresEdicion.value = e
  return Object.keys(e).length === 0
}

async function guardarEdicion() {
  if (!validarEdicion()) return
  guardandoEdicion.value = true
  const { error, execute } = ApiUseFetch(`admin/users/${clienteEditando.value.id}`)
    .put({ ...formEdicion.value }).json()
  await execute()
  guardandoEdicion.value = false
  if (error.value) {
    mostrarErrorMsg('Error al actualizar el cliente')
  } else {
    mostrarEditar.value = false
    mostrarExitoMsg('Cliente actualizado correctamente')
    await cargarClientes()
  }
  clienteEditando.value = null
}

// ── Eliminar cliente ──────────────────────────────────────────────────────────
function abrirEliminar(cliente: any) {
  clienteAEliminar.value = cliente
  mostrarEliminar.value = true
}

async function eliminarCliente() {
  if (!clienteAEliminar.value) return
  eliminando.value = true
  const { error, execute } = ApiUseFetch(`admin/users/${clienteAEliminar.value.id}`).delete().json()
  await execute()
  eliminando.value = false
  mostrarEliminar.value = false
  if (error.value) {
    mostrarErrorMsg('Error al eliminar el cliente')
  } else {
    mostrarExitoMsg('Cliente eliminado correctamente')
    await cargarClientes()
  }
  clienteAEliminar.value = null
}

// ── Notificaciones ────────────────────────────────────────────────────────────
function mostrarExitoMsg(msg: string) {
  mensajeExito.value = msg
  setTimeout(() => (mensajeExito.value = ''), 3500)
}
function mostrarErrorMsg(msg: string) {
  mensajeError.value = msg
  setTimeout(() => (mensajeError.value = ''), 3500)
}

onMounted(cargarClientes)
</script>

<template>
  <div class="p-8 space-y-5">

    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Clientes</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">
          {{ cargando ? 'Cargando...' : `${clientesFiltrados.length} cliente${clientesFiltrados.length !== 1 ? 's' : ''} registrado${clientesFiltrados.length !== 1 ? 's' : ''}` }}
        </p>
      </div>
      <button
        @click="abrirRegistrar"
        class="flex items-center gap-2 bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Registrar cliente
      </button>
    </div>

    <!-- Alertas -->
    <div v-if="mensajeExito" class="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-lg leading-none">×</button>
    </div>
    <div v-if="mensajeError" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeError }}
      <button @click="mensajeError = ''" class="bg-transparent border-none cursor-pointer text-red-400 text-lg leading-none">×</button>
    </div>

    <!-- Buscador -->
    <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full max-w-sm">
      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
      </svg>
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por nombre, correo o teléfono..."
        class="text-sm text-slate-700 border-none outline-none bg-transparent w-full placeholder-slate-400"
      />
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">

      <p v-if="cargando" class="text-sm text-slate-400 text-center py-12">Cargando clientes...</p>

      <p v-else-if="clientesFiltrados.length === 0" class="text-sm text-slate-400 text-center py-12">
        No se encontraron clientes.
      </p>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Cliente</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Correo</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Teléfono</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dirección</th>
            <th class="text-xs text-slate-400 font-medium px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cliente in clientesFiltrados"
            :key="cliente.id"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
          >
            <!-- Nombre + foto -->
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    v-if="fotoUrl(cliente.profile_photo)"
                    :src="fotoUrl(cliente.profile_photo)!"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-xs font-semibold text-[#1d6bbf]">
                    {{ cliente.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm font-medium text-slate-800">{{ cliente.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ cliente.email ?? '—' }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ cliente.phone ?? '—' }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ cliente.address ?? '—' }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">

                <!-- Ver mascotas -->
                <button
                  @click="verMascotas(cliente)"
                  title="Ver mascotas"
                  class="p-1.5 rounded-md text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="9" cy="4" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="15" cy="4" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="5" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="19" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                    <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <!-- Editar -->
                <button
                  @click="abrirEditar(cliente)"
                  title="Editar cliente"
                  class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <!-- Eliminar -->
                <button
                  @click="abrirEliminar(cliente)"
                  title="Eliminar cliente"
                  class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── MODAL: Ver mascotas ────────────────────────────────────────────────── -->
  <div v-if="mostrarMascotas" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">

      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 class="text-base font-semibold text-slate-800 m-0">Mascotas de {{ clienteSeleccionado?.name }}</h3>
          <p class="text-xs text-slate-400 m-0">{{ clienteSeleccionado?.email }}</p>
        </div>
        <button
          @click="mostrarMascotas = false"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer text-slate-500 text-lg transition-colors"
        >×</button>
      </div>

      <div class="p-6">
        <p v-if="cargandoMascotas" class="text-sm text-slate-400 text-center py-6">Cargando mascotas...</p>
        <p v-else-if="mascotasCliente.length === 0" class="text-sm text-slate-400 text-center py-6">
          Este cliente no tiene mascotas registradas.
        </p>
        <div v-else class="space-y-3">
          <div
            v-for="mascota in mascotasCliente"
            :key="mascota.id"
            class="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50"
          >
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                v-if="mascota.photo_path"
                :src="storageUrl + mascota.photo_path"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xl">🐾</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 m-0">{{ mascota.name }}</p>
              <p class="text-xs text-slate-400 m-0">{{ mascota.species }} · {{ mascota.breed ?? 'Sin raza' }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs text-slate-500 m-0">{{ mascota.sex === 'male' ? '♂ Macho' : '♀ Hembra' }}</p>
              <p class="text-xs text-slate-400 m-0">{{ mascota.age ? mascota.age + ' meses' : '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 pb-5">
        <button
          @click="mostrarMascotas = false"
          class="w-full py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Registrar cliente ───────────────────────────────────────────── -->
  <div v-if="mostrarRegistrar" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 class="text-base font-semibold text-slate-800 m-0">Registrar nuevo cliente</h3>
        <button
          @click="mostrarRegistrar = false"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer text-slate-500 text-lg transition-colors"
        >×</button>
      </div>

      <div class="p-6 space-y-4">

        <!-- Nombre -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nombre completo <span class="text-red-400">*</span></label>
          <input
            v-model="formRegistro.name"
            type="text"
            placeholder="Ej. María González"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors placeholder-slate-400"
            :class="erroresRegistro.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-[#1d6bbf]'"
          />
          <p v-if="erroresRegistro.name" class="text-xs text-red-500 mt-1">{{ erroresRegistro.name }}</p>
        </div>

        <!-- Correo -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Correo electrónico <span class="text-red-400">*</span></label>
          <input
            v-model="formRegistro.email"
            type="email"
            placeholder="correo@ejemplo.com"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors placeholder-slate-400"
            :class="erroresRegistro.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-[#1d6bbf]'"
          />
          <p v-if="erroresRegistro.email" class="text-xs text-red-500 mt-1">{{ erroresRegistro.email }}</p>
        </div>

        <!-- Teléfono y dirección -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
            <input
              v-model="formRegistro.phone"
              type="text"
              placeholder="Ej. 871 234 5678"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1d6bbf] transition-colors placeholder-slate-400"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
            <input
              v-model="formRegistro.address"
              type="text"
              placeholder="Calle y número"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1d6bbf] transition-colors placeholder-slate-400"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Contraseña temporal <span class="text-red-400">*</span></label>
          <input
            v-model="formRegistro.password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors placeholder-slate-400"
            :class="erroresRegistro.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-[#1d6bbf]'"
          />
          <p v-if="erroresRegistro.password" class="text-xs text-red-500 mt-1">{{ erroresRegistro.password }}</p>
        </div>

      </div>

      <div class="flex gap-2 px-6 pb-6">
        <button
          @click="mostrarRegistrar = false"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="guardarRegistro"
          :disabled="guardandoRegistro"
          class="flex-1 py-2 rounded-lg bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {{ guardandoRegistro ? 'Guardando...' : 'Registrar cliente' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Editar cliente ──────────────────────────────────────────────── -->
  <div v-if="mostrarEditar" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 class="text-base font-semibold text-slate-800 m-0">Editar cliente</h3>
          <p class="text-xs text-slate-400 m-0">{{ clienteEditando?.email }}</p>
        </div>
        <button
          @click="mostrarEditar = false"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer text-slate-500 text-lg transition-colors"
        >×</button>
      </div>

      <div class="p-6 space-y-4">

        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nombre completo <span class="text-red-400">*</span></label>
          <input
            v-model="formEdicion.name"
            type="text"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors"
            :class="erroresEdicion.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-[#1d6bbf]'"
          />
          <p v-if="erroresEdicion.name" class="text-xs text-red-500 mt-1">{{ erroresEdicion.name }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Correo electrónico <span class="text-red-400">*</span></label>
          <input
            v-model="formEdicion.email"
            type="email"
            class="w-full px-3 py-2 rounded-lg border text-sm text-slate-700 outline-none transition-colors"
            :class="erroresEdicion.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-[#1d6bbf]'"
          />
          <p v-if="erroresEdicion.email" class="text-xs text-red-500 mt-1">{{ erroresEdicion.email }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
            <input
              v-model="formEdicion.phone"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1d6bbf] transition-colors"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
            <input
              v-model="formEdicion.address"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1d6bbf] transition-colors"
            />
          </div>
        </div>

      </div>

      <div class="flex gap-2 px-6 pb-6">
        <button
          @click="mostrarEditar = false"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="guardarEdicion"
          :disabled="guardandoEdicion"
          class="flex-1 py-2 rounded-lg bg-[#1d6bbf] hover:bg-[#1659a8] text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {{ guardandoEdicion ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── MODAL: Eliminar cliente ────────────────────────────────────────────── -->
  <div v-if="mostrarEliminar" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">

      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-semibold text-slate-800 m-0">Eliminar cliente</h3>
          <p class="text-xs text-slate-400 m-0">Esta acción no se puede deshacer</p>
        </div>
      </div>

      <p class="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3">
        ¿Confirmas que deseas eliminar a <strong>{{ clienteAEliminar?.name }}</strong>?
        Se perderán todos sus datos del sistema.
      </p>

      <div class="flex gap-2">
        <button
          @click="mostrarEliminar = false; clienteAEliminar = null"
          class="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="eliminarCliente"
          :disabled="eliminando"
          class="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
        >
          {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>
