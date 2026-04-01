<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import type { User } from '@/types/user'

const auth = useAuthStore()
const router = useRouter()

// Pantalla de bienvenida
const mostrarBienvenida = ref(true)

const usuarios = ref<User[]>([])
const cargando = ref(true)
const mensajeExito = ref('')
const totalClientes = ref(0)
const totalEmpleados = ref(0)
const totalVeterinarios = ref(0)
const totalCitas = ref(0)

async function cargarDatos() {
  cargando.value = true

  const { data: dataUsuarios, execute: execUsuarios } = ApiUseFetch('admin/users').get().json()
  await execUsuarios()
  const todos: User[] = dataUsuarios.value?.data ?? []
  usuarios.value = todos

  totalClientes.value = todos.filter((u) => u.role_id === 3).length
  totalEmpleados.value = todos.filter((u) => u.role_id === 2).length
  totalVeterinarios.value = todos.filter((u) => u.role_id === 4).length

  const { data: dataCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
  await execCitas()
  totalCitas.value = dataCitas.value?.data?.length ?? 0

  cargando.value = false
}

function entrarAlPanel() {
  mostrarBienvenida.value = false
}

async function toggleActivo(usuario: User) {
  const { execute } = ApiUseFetch(`admin/users/${usuario.id}`).put({ active: !usuario.active }).json()
  await execute()
  mensajeExito.value = usuario.active ? 'Usuario desactivado correctamente' : 'Usuario reactivado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  cargarDatos()
}

function nombreRol(roleId: number) {
  if (roleId === 1) return 'Admin'
  if (roleId === 2) return 'Trabajador'
  if (roleId === 3) return 'Cliente'
  if (roleId === 4) return 'Veterinario'
  return '—'
}

onMounted(cargarDatos)
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />

    <!-- Pantalla de bienvenida -->
    <transition name="fade">
      <div
        v-if="mostrarBienvenida"
        class="fixed inset-0 bg-[#1d6bbf] flex flex-col items-center justify-center z-50"
      >
        <div class="flex flex-col items-center gap-6 text-center px-8">
          <!-- Logo -->
          <div class="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center">
            <svg viewBox="0 0 60 60" fill="none" class="w-16 h-16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" fill="#e8f0fa" stroke="#1d6bbf" stroke-width="2"/>
              <path d="M20 38c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#1d6bbf" stroke-width="2" stroke-linecap="round"/>
              <circle cx="30" cy="22" r="5" fill="#1d6bbf"/>
              <path d="M16 30c1.5-3.5 3.5-5 5-5M44 30c-1.5-3.5-3.5-5-5-5" stroke="#1d6bbf" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>

          <div>
            <p class="text-white/70 text-sm font-medium mb-1 uppercase tracking-widest">Sistema CVO</p>
            <h1 class="text-4xl font-bold text-white m-0">
              Bienvenido, {{ auth.user?.name }}
            </h1>
            <p class="text-white/60 text-base mt-2">Panel de Administración</p>
          </div>

          <button
            @click="entrarAlPanel"
            class="mt-4 bg-white text-[#1d6bbf] font-bold text-sm px-8 py-3 rounded-xl border-none cursor-pointer shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200"
          >
            Entrar al panel →
          </button>
        </div>
      </div>
    </transition>

    <!-- Contenido principal -->
    <div class="p-8">
      <h1 class="text-2xl font-bold text-[#1e3a5f] mb-6">
        Bienvenido, {{ auth.user?.name }}
      </h1>

      <!-- Cards resumen -->
      <div class="grid grid-cols-4 gap-5 mb-8">
        <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm p-5 flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clientes</span>
          <span class="text-3xl font-bold text-[#1d6bbf]">{{ totalClientes }}</span>
          <router-link to="/admin/clientes" class="text-xs text-[#1d6bbf] no-underline hover:underline mt-1">Ver todos →</router-link>
        </div>
        <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm p-5 flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recepcionistas</span>
          <span class="text-3xl font-bold text-[#1d6bbf]">{{ totalEmpleados }}</span>
          <router-link to="/admin/empleados" class="text-xs text-[#1d6bbf] no-underline hover:underline mt-1">Ver todos →</router-link>
        </div>
        <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm p-5 flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Veterinarios</span>
          <span class="text-3xl font-bold text-[#1d6bbf]">{{ totalVeterinarios }}</span>
          <router-link to="/admin/empleados" class="text-xs text-[#1d6bbf] no-underline hover:underline mt-1">Ver todos →</router-link>
        </div>
        <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm p-5 flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Citas totales</span>
          <span class="text-3xl font-bold text-[#1d6bbf]">{{ totalCitas }}</span>
          <router-link to="/admin/citas" class="text-xs text-[#1d6bbf] no-underline hover:underline mt-1">Ver todas →</router-link>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#dce6f0]">
          <h2 class="text-base font-bold text-[#1d6bbf] m-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke-linecap="round"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke-linecap="round"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke-linecap="round"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke-linecap="round"/>
            </svg>
            Gestión de Usuarios
          </h2>
          <router-link
            to="/admin/empleados"
            class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg no-underline transition-colors flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
            </svg>
            Crear Nuevo Usuario
          </router-link>
        </div>

        <!-- Mensaje éxito -->
        <div v-if="mensajeExito" class="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          {{ mensajeExito }}
          <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 font-bold text-base leading-none">×</button>
        </div>

        <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando usuarios...</p>

        <table v-else class="w-full border-collapse">
          <thead>
            <tr class="border-b border-[#dce6f0]">
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Nombre</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Email</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Rol</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Teléfono</th>
              <th class="text-left text-xs font-semibold text-slate-500 px-6 py-3">Dirección</th>
              <th class="text-center text-xs font-semibold text-slate-500 px-6 py-3">Activo</th>
              <th class="text-center text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="usuario in usuarios"
              :key="usuario.id"
              class="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors duration-150"
            >
              <td class="px-6 py-3 text-sm font-semibold text-[#1e3a5f]">{{ usuario.name }}</td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ usuario.email }}</td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ nombreRol(usuario.role_id) }}</td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ usuario.phone ?? '—' }}</td>
              <td class="px-6 py-3 text-sm text-slate-600">{{ usuario.address ?? '—' }}</td>
              <td class="px-6 py-3 text-center">
                <span
                  class="text-xs font-bold px-2.5 py-1 rounded"
                  :class="usuario.active ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600'"
                >
                  {{ usuario.active ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <span v-if="usuario.role_id === 1" class="text-xs text-slate-400">Tú</span>
                <div v-else class="flex items-center justify-center gap-2">
                  <router-link
                    to="/admin/empleados"
                    class="bg-[#1d6bbf] hover:bg-[#155fa8] text-white w-7 h-7 rounded flex items-center justify-center no-underline transition-colors"
                    title="Editar"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </router-link>
                  <button
                    @click="toggleActivo(usuario)"
                    class="bg-yellow-400 hover:bg-yellow-500 text-white w-7 h-7 rounded border-none cursor-pointer flex items-center justify-center transition-colors"
                    title="Activar/Desactivar"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke-linecap="round"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
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