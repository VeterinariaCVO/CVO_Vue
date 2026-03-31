<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Client } from '@/types/client'
import ClientsTable from '@/components/admin/ClientsTable.vue'
import RegisterClientModal from '@/components/admin/RegisterClientModal.vue'
import EditClientModal from '@/components/admin/EditClientModal.vue'

const clientes = ref<Client[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const clienteEditarId = ref<number | null>(null)

async function obtenerClientes() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('admin/users').get().json()
  await execute()
  const todos: Client[] = data.value?.data ?? []
  clientes.value = todos.filter((u) => u.role_id === 3)
  cargando.value = false
}

function abrirEdicion(id: number) {
  clienteEditarId.value = id
  mostrarEdicion.value = true
}

async function eliminarCliente(id: number) {
  const confirmar = confirm('¿Seguro que quieres eliminar este cliente?')
  if (!confirmar) return
  const { execute } = ApiUseFetch(`admin/users/${id}`).delete().json()
  await execute()
  obtenerClientes()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  obtenerClientes()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  clienteEditarId.value = null
  obtenerClientes()
}

onMounted(obtenerClientes)
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Clientes</h1>
        <p class="text-sm text-slate-500 mt-1 mb-0">Administra los clientes registrados en el sistema</p>
      </div>
      <button
        @click="mostrarRegistro = true"
        class="bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm px-5 py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
      >
        + Registrar Cliente
      </button>
    </div>

    <!-- Estado cargando -->
    <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando clientes...</p>

    <!-- Tabla -->
    <ClientsTable
      v-else
      :clientes="clientes"
      @editar="abrirEdicion"
      @eliminar="eliminarCliente"
    />
  </div>

  <!-- Modal Registrar -->
  <RegisterClientModal
    v-if="mostrarRegistro"
    @cerrar="cerrarRegistro"
    @guardado="cerrarRegistro"
  />

  <!-- Modal Editar -->
  <EditClientModal
    v-if="mostrarEdicion && clienteEditarId"
    :id="clienteEditarId"
    @cerrar="cerrarEdicion"
    @guardado="cerrarEdicion"
  />
</template>