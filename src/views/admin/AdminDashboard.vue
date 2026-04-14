<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/user'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import EditClientModal from '@/components/admin/EditClientModal.vue'

const auth = useAuthStore()
const WELCOME_KEY = 'cvo_welcome_shown'
const mostrarBienvenida = ref(false)

const usuarios = ref<User[]>([])
const cargando = ref(true)
const mensajeExito = ref('')
const totalClientes = ref(0)
const totalEmpleados = ref(0)
const totalVeterinarios = ref(0)
const totalCitas = ref(0)

const mostrarEdicionEmpleado = ref(false)
const mostrarEdicionCliente = ref(false)
const editarId = ref<number | null>(null)

async function cargarDatos() {
  cargando.value = true

  const { data: dataUsers, execute: execUsers } = ApiUseFetch('admin/users').get().json()
  await execUsers()
  usuarios.value = dataUsers.value?.data ?? []

  totalClientes.value = usuarios.value.filter((u) => u.role_id === 3).length
  totalEmpleados.value = usuarios.value.filter((u) => u.role_id === 2).length
  totalVeterinarios.value = usuarios.value.filter((u) => u.role_id === 4).length

  const { data: dataCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
  await execCitas()
  totalCitas.value = dataCitas.value?.data?.length ?? 0

  cargando.value = false
}

function entrarAlPanel() {
  mostrarBienvenida.value = false
  sessionStorage.setItem(WELCOME_KEY, 'true')
}

function abrirEdicion(usuario: User) {
  editarId.value = usuario.id
  if (usuario.role_id === 3) mostrarEdicionCliente.value = true
  else mostrarEdicionEmpleado.value = true
}

function cerrarEdicionEmpleado() {
  mostrarEdicionEmpleado.value = false
  editarId.value = null
  mensajeExito.value = 'Empleado actualizado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  cargarDatos()
}

function cerrarEdicionCliente() {
  mostrarEdicionCliente.value = false
  editarId.value = null
  mensajeExito.value = 'Cliente actualizado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  cargarDatos()
}

async function toggleActivo(usuario: User) {
  const { execute } = ApiUseFetch(`admin/users/${usuario.id}`).put({ active: !usuario.active }).json()
  await execute()
  mensajeExito.value = usuario.active ? 'Usuario desactivado' : 'Usuario reactivado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  cargarDatos()
}

function nombreRol(roleId: number) {
  const map: Record<number, string> = {
    1: 'Admin',
    2: 'Recepcionista',
    3: 'Cliente',
    4: 'Veterinario',
  }
  return map[roleId] ?? '—'
}

onMounted(() => {
  if (!sessionStorage.getItem(WELCOME_KEY)) mostrarBienvenida.value = true
  cargarDatos()
})
</script>

<template>
  <div>
    <transition name="fade">
      <div
        v-if="mostrarBienvenida"
        class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50"
      >
        <div class="flex flex-col items-center gap-5 text-center px-8">
          <div class="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center">
            <svg viewBox="0 0 60 60" fill="none" class="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 38c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <circle cx="30" cy="22" r="5" fill="white"/>
              <path d="M16 30c1.5-3.5 3.5-5 5-5M44 30c-1.5-3.5-3.5-5-5-5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>

          <div>
            <p class="text-white/50 text-xs uppercase tracking-widest mb-2">Sistema CVO</p>
            <h1 class="text-3xl font-semibold text-white m-0">Bienvenido, {{ auth.user?.name }}</h1>
            <p class="text-white/50 text-sm mt-1">Panel de Administración</p>
          </div>

          <button
            @click="entrarAlPanel"
            class="mt-2 bg-white text-[#1d6bbf] font-semibold text-sm px-7 py-2.5 rounded-lg border-none cursor-pointer hover:bg-blue-50 transition-colors"
          >
            Entrar al panel →
          </button>
        </div>
      </div>
    </transition>

    <div class="p-8">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-slate-800 m-0">Bienvenido, {{ auth.user?.name }}</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Panel de administración</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
          <span class="text-xs text-slate-400">Clientes</span>
          <span class="text-2xl font-semibold text-[#1d6bbf]">{{ totalClientes }}</span>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
          <span class="text-xs text-slate-400">Recepcionistas</span>
          <span class="text-2xl font-semibold text-[#1d6bbf]">{{ totalEmpleados }}</span>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
          <span class="text-xs text-slate-400">Veterinarios</span>
          <span class="text-2xl font-semibold text-[#1d6bbf]">{{ totalVeterinarios }}</span>
        </div>

        <router-link
          to="/admin/citas"
          class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 no-underline hover:border-[#1d6bbf] hover:shadow-sm transition-all"
        >
          <span class="text-xs text-slate-400">Citas totales</span>
          <span class="text-2xl font-semibold text-[#1d6bbf]">{{ totalCitas }}</span>
          <span class="text-xs text-slate-500">Ver y gestionar las citas registradas</span>
        </router-link>

        <router-link
          to="/admin/herramientas-bd"
          class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 no-underline hover:border-[#1d6bbf] hover:shadow-sm transition-all"
        >
          <span class="text-xs text-slate-400">Herramientas BD</span>
          <span class="text-lg font-semibold text-[#1d6bbf]">Reporte avanzado</span>
          <span class="text-xs text-slate-500">Ver métricas diarias, canceladas, completadas y walk-in</span>
        </router-link>
      </div>

      <div
        v-if="mensajeExito"
        class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between"
      >
        {{ mensajeExito }}
        <button
          @click="mensajeExito = ''"
          class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none"
        >
          ×
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700 m-0">Usuarios del sistema</h2>
          <router-link
            to="/admin/usuarios"
            class="text-xs text-[#1d6bbf] hover:underline no-underline transition-colors"
          >
            Gestionar →
          </router-link>
        </div>

        <p v-if="cargando" class="text-sm text-slate-400 text-center py-10">Cargando...</p>

        <table v-else class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Nombre</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Correo</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Rol</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Teléfono</th>
              <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dirección</th>
              <th class="text-xs text-slate-400 font-medium px-5 py-3">Activo</th>
              <th class="text-xs text-slate-400 font-medium px-5 py-3"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="usuario in usuarios"
              :key="usuario.id"
              class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
            >
              <td class="px-5 py-3 text-sm text-slate-800">{{ usuario.name }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ usuario.email }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ nombreRol(usuario.role_id) }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ usuario.phone ?? '—' }}</td>
              <td class="px-5 py-3 text-sm text-slate-500">{{ (usuario as any).address ?? '—' }}</td>
              <td class="px-5 py-3">
                <span
                  class="text-xs px-2 py-0.5 rounded"
                  :class="usuario.active ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'"
                >
                  {{ usuario.active ? 'Sí' : 'No' }}
                </span>
              </td>

              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <span v-if="usuario.role_id === 1" class="text-xs text-slate-300">—</span>

                  <template v-else>
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

                    <button
                      @click="toggleActivo(usuario)"
                      :title="usuario.active ? 'Desactivar' : 'Activar'"
                      class="p-1.5 rounded-md border cursor-pointer transition-colors flex items-center justify-center"
                      :class="usuario.active
                        ? 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'
                        : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'"
                    >
                      <svg v-if="usuario.active" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1 1l22 22" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>

                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <EditUserModal
    v-if="mostrarEdicionEmpleado && editarId"
    :id="editarId"
    @cerrar="mostrarEdicionEmpleado = false; editarId = null"
    @guardado="cerrarEdicionEmpleado"
  />

  <EditClientModal
    v-if="mostrarEdicionCliente && editarId"
    :id="editarId"
    @cerrar="mostrarEdicionCliente = false; editarId = null"
    @guardado="cerrarEdicionCliente"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>