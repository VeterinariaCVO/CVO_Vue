<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { User } from '@/types/user'
import RegisterUserModal from '@/components/admin/RegisterUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import RegisterClientModal from '@/components/admin/RegisterClientModal.vue'
import EditClientModal from '@/components/admin/EditClientModal.vue'

type TabFiltro = 'todos' | 'recepcionista' | 'veterinario' | 'cliente'

const todos = ref<User[]>([])
const cargando = ref(true)
const tabActivo = ref<TabFiltro>('todos')
const busqueda = ref('')
const mostrarRegistroEmpleado = ref(false)
const mostrarRegistroCliente = ref(false)
const mostrarEdicionEmpleado = ref(false)
const mostrarEdicionCliente = ref(false)
const editarId = ref<number | null>(null)
const mensajeExito = ref('')
const mostrarConfirmEliminar = ref(false)
const usuarioAEliminar = ref<User | null>(null)

async function obtenerUsuarios() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('admin/users').get().json()
  await execute()
  todos.value = data.value?.data ?? []
  cargando.value = false
}

const usuariosFiltrados = computed(() => {
  let lista = todos.value
  if (tabActivo.value === 'recepcionista') lista = lista.filter(u => u.role_id === 2)
  else if (tabActivo.value === 'veterinario') lista = lista.filter(u => u.role_id === 4)
  else if (tabActivo.value === 'cliente') lista = lista.filter(u => u.role_id === 3)
  else lista = lista.filter(u => u.role_id !== 1)
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    )
  }
  return lista
})

const conteos = computed(() => ({
  todos: todos.value.filter(u => u.role_id !== 1).length,
  recepcionista: todos.value.filter(u => u.role_id === 2).length,
  veterinario: todos.value.filter(u => u.role_id === 4).length,
  cliente: todos.value.filter(u => u.role_id === 3).length,
}))

function nombreRol(roleId: number) {
  const map: Record<number, string> = { 2: 'Recepcionista', 4: 'Veterinario', 3: 'Cliente' }
  return map[roleId] ?? 'Empleado'
}

function abrirEdicion(usuario: User) {
  editarId.value = usuario.id
  if (usuario.role_id === 3) mostrarEdicionCliente.value = true
  else mostrarEdicionEmpleado.value = true
}

async function toggleActivo(usuario: User) {
  const { execute } = ApiUseFetch(`admin/users/${usuario.id}`).put({ active: !usuario.active }).json()
  await execute()
  mostrarExito(usuario.active ? 'Usuario desactivado' : 'Usuario reactivado')
  obtenerUsuarios()
}

function eliminar(usuario: User) {
  usuarioAEliminar.value = usuario
  mostrarConfirmEliminar.value = true
}

async function confirmarEliminar() {
  if (!usuarioAEliminar.value) return
  const usuario = usuarioAEliminar.value
  const tipo = usuario.role_id === 3 ? 'cliente' : 'empleado'
  const { execute } = ApiUseFetch(`admin/users/${usuario.id}`).delete().json()
  await execute()
  mostrarExito(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado`)
  obtenerUsuarios()
  mostrarConfirmEliminar.value = false
  usuarioAEliminar.value = null
}

function mostrarExito(msg: string) {
  mensajeExito.value = msg
  setTimeout(() => (mensajeExito.value = ''), 3000)
}

function cerrarRegistroEmpleado() { mostrarRegistroEmpleado.value = false; mostrarExito('Empleado registrado'); obtenerUsuarios() }
function cerrarEdicionEmpleado() { mostrarEdicionEmpleado.value = false; editarId.value = null; mostrarExito('Empleado actualizado'); obtenerUsuarios() }
function cerrarRegistroCliente() { mostrarRegistroCliente.value = false; mostrarExito('Cliente registrado'); obtenerUsuarios() }
function cerrarEdicionCliente() { mostrarEdicionCliente.value = false; editarId.value = null; mostrarExito('Cliente actualizado'); obtenerUsuarios() }

const tabs: { key: TabFiltro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'recepcionista', label: 'Recepcionistas' },
  { key: 'veterinario', label: 'Veterinarios' },
  { key: 'cliente', label: 'Clientes' },
]

onMounted(obtenerUsuarios)
</script>

<template>
  <div class="p-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Usuarios</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Administra empleados y clientes del sistema</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="tabActivo !== 'cliente'"
          @click="mostrarRegistroEmpleado = true"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Registrar empleado
        </button>
        <button
          v-if="tabActivo !== 'recepcionista' && tabActivo !== 'veterinario'"
          @click="mostrarRegistroCliente = true"
          class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Registrar cliente
        </button>
      </div>
    </div>

    <!-- Éxito -->
    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none">×</button>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">

      <!-- Tabs + Buscador -->
      <div class="flex items-center justify-between px-5 border-b border-slate-100">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="tabActivo = tab.key; busqueda = ''"
            class="flex items-center gap-1.5 text-sm px-4 py-3.5 border-none cursor-pointer transition-colors border-b-2 -mb-px bg-transparent"
            :class="tabActivo === tab.key
              ? 'text-[#1d6bbf] font-semibold border-[#1d6bbf]'
              : 'text-slate-400 border-transparent hover:text-slate-600'"
          >
            {{ tab.label }}
            <span
              class="text-xs px-1.5 py-0.5 rounded-full"
              :class="tabActivo === tab.key ? 'bg-[#1d6bbf] text-white' : 'bg-slate-100 text-slate-400'"
            >{{ conteos[tab.key] }}</span>
          </button>
        </div>
        <div class="relative py-2">
          <svg class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
          </svg>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar..."
            class="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#1d6bbf] transition-colors w-52 bg-slate-50"
          />
        </div>
      </div>

      <p v-if="cargando" class="text-sm text-slate-400 text-center py-10">Cargando...</p>
      <p v-else-if="usuariosFiltrados.length === 0" class="text-sm text-slate-400 text-center py-10">No se encontraron usuarios.</p>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Nombre</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Correo</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Rol</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Teléfono</th>
            <th v-if="tabActivo === 'cliente'" class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dirección</th>
            <th v-if="tabActivo !== 'cliente'" class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
            <th class="text-xs text-slate-400 font-medium px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="usuario in usuariosFiltrados"
            :key="usuario.id"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-2.5">
                <img v-if="usuario.profile_photo" :src="usuario.profile_photo" class="w-7 h-7 rounded-full object-cover shrink-0" />
                <div v-else class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="text-sm text-slate-800">{{ usuario.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ usuario.email }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ nombreRol(usuario.role_id) }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ usuario.phone ?? '—' }}</td>
            <td v-if="tabActivo === 'cliente'" class="px-5 py-3 text-sm text-slate-500">{{ (usuario as any).address ?? '—' }}</td>
            <td v-if="tabActivo !== 'cliente'" class="px-5 py-3">
              <button
                @click="toggleActivo(usuario)"
                class="text-xs px-2 py-1 rounded border-none cursor-pointer transition-colors"
                :class="usuario.active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'"
              >{{ usuario.active ? 'Activo' : 'Inactivo' }}</button>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <!-- Editar -->
                <button
                  @click="abrirEdicion(usuario)"
                  title="Editar"
                  class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <!-- Eliminar -->
                <button
                  @click="eliminar(usuario)"
                  title="Eliminar"
                  class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <RegisterUserModal v-if="mostrarRegistroEmpleado" @cerrar="mostrarRegistroEmpleado = false" @guardado="cerrarRegistroEmpleado" />
  <EditUserModal v-if="mostrarEdicionEmpleado && editarId" :id="editarId" @cerrar="mostrarEdicionEmpleado = false; editarId = null" @guardado="cerrarEdicionEmpleado" />
  <RegisterClientModal v-if="mostrarRegistroCliente" @cerrar="mostrarRegistroCliente = false" @guardado="cerrarRegistroCliente" />
  <EditClientModal v-if="mostrarEdicionCliente && editarId" :id="editarId" @cerrar="mostrarEdicionCliente = false; editarId = null" @guardado="cerrarEdicionCliente" />

  <!-- Modal confirmar eliminar -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="mostrarConfirmEliminar"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0, 0, 0, 0.25)"
        @click.self="mostrarConfirmEliminar = false"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-xs w-11/12">
          <p class="text-sm font-semibold text-slate-800 m-0 mb-1">
            ¿Eliminar {{ usuarioAEliminar?.role_id === 3 ? 'cliente' : 'empleado' }}?
          </p>
          <p class="text-sm text-slate-400 m-0 mb-5 leading-relaxed">
            Se eliminará a <span class="text-slate-600">{{ usuarioAEliminar?.name }}</span> permanentemente.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="mostrarConfirmEliminar = false"
              class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-transparent text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmarEliminar"
              class="text-sm px-3 py-1.5 rounded-lg border-none bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>