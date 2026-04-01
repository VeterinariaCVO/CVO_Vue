<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { User } from '@/types/user'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import EmpleadosTable from '@/components/admin/EmployeeTable.vue'
import RegisterUserModal from '@/components/admin/RegisterUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'

const empleados = ref<User[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const empleadoEditarId = ref<number | null>(null)
const mensajeExito = ref('')

async function obtenerEmpleados() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('admin/employees').get().json()
  await execute()
  empleados.value = data.value?.data ?? []
  cargando.value = false
}

function abrirEdicion(id: number) {
  empleadoEditarId.value = id
  mostrarEdicion.value = true
}

async function toggleActivo(empleado: User) {
  const { execute } = ApiUseFetch(`admin/users/${empleado.id}`).put({ active: !empleado.active }).json()
  await execute()
  mensajeExito.value = empleado.active ? 'Usuario desactivado correctamente' : 'Usuario reactivado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerEmpleados()
}

async function eliminarEmpleado(id: number) {
  const confirmar = confirm('¿Seguro que quieres eliminar este empleado?')
  if (!confirmar) return
  const { execute } = ApiUseFetch(`admin/users/${id}`).delete().json()
  await execute()
  mensajeExito.value = 'Empleado eliminado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerEmpleados()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  mensajeExito.value = 'Empleado registrado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerEmpleados()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  empleadoEditarId.value = null
  mensajeExito.value = 'Empleado actualizado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerEmpleados()
}

onMounted(obtenerEmpleados)
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />

    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Empleados</h1>
          <p class="text-sm text-slate-500 mt-1 mb-0">Administra los empleados y veterinarios del sistema</p>
        </div>
        <button
          @click="mostrarRegistro = true"
          class="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2 border-none rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Registrar Empleado
        </button>
      </div>

      <!-- Mensaje éxito -->
      <div v-if="mensajeExito" class="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
        {{ mensajeExito }}
        <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 font-bold text-base leading-none">×</button>
      </div>

      <!-- Card tabla -->
      <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#dce6f0]">
          <h2 class="text-base font-bold text-[#1d6bbf] m-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Lista de Empleados y Veterinarios
          </h2>
          <span class="text-xs text-slate-400 font-medium">{{ empleados.length }} registros</span>
        </div>

        <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando empleados...</p>

        <EmpleadosTable
          v-else
          :empleados="empleados"
          @editar="abrirEdicion"
          @eliminar="eliminarEmpleado"
          @toggleActivo="toggleActivo"
        />
      </div>
    </div>
  </div>

  <RegisterUserModal
    v-if="mostrarRegistro"
    @cerrar="mostrarRegistro = false"
    @guardado="cerrarRegistro"
  />

  <EditUserModal
    v-if="mostrarEdicion && empleadoEditarId"
    :id="empleadoEditarId"
    @cerrar="mostrarEdicion = false; empleadoEditarId = null"
    @guardado="cerrarEdicion"
  />
</template>