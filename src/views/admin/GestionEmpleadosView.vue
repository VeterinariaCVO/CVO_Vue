<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { User } from '@/types/user'
import EmpleadosTable from '@/components/admin/EmpleadosTable.vue'
import RegisterUserModal from '@/components/admin/RegisterUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'

const empleados = ref<User[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const empleadoEditarId = ref<number | null>(null)

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
  const { execute } = ApiUseFetch(`admin/users/${empleado.id}`).put({
    active: !empleado.active,
  }).json()
  await execute()
  obtenerEmpleados()
}

async function eliminarEmpleado(id: number) {
  const confirmar = confirm('¿Seguro que quieres eliminar este empleado?')
  if (!confirmar) return
  const { execute } = ApiUseFetch(`admin/users/${id}`).delete().json()
  await execute()
  obtenerEmpleados()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  obtenerEmpleados()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  empleadoEditarId.value = null
  obtenerEmpleados()
}

onMounted(obtenerEmpleados)
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Empleados</h1>
        <p class="text-sm text-slate-500 mt-1 mb-0">Administra los empleados y veterinarios del sistema</p>
      </div>
      <button
        @click="mostrarRegistro = true"
        class="bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm px-5 py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
      >
        + Registrar Empleado
      </button>
    </div>

    <!-- Estado cargando -->
    <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando empleados...</p>

    <!-- Tabla -->
    <EmpleadosTable
      v-else
      :empleados="empleados"
      @editar="abrirEdicion"
      @eliminar="eliminarEmpleado"
      @toggleActivo="toggleActivo"
    />
  </div>

  <!-- Modal Registrar -->
  <RegisterUserModal
    v-if="mostrarRegistro"
    @cerrar="cerrarRegistro"
    @guardado="cerrarRegistro"
  />

  <!-- Modal Editar -->
  <EditUserModal
    v-if="mostrarEdicion && empleadoEditarId"
    :id="empleadoEditarId"
    @cerrar="cerrarEdicion"
    @guardado="cerrarEdicion"
  />
</template>