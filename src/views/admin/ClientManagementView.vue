<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Client } from '@/types/client'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import ClientsTable from '@/components/admin/ClientsTable.vue'
import RegisterClientModal from '@/components/admin/RegisterClientModal.vue'
import EditClientModal from '@/components/admin/EditClientModal.vue'

const clientes = ref<Client[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const clienteEditarId = ref<number | null>(null)
const mensajeExito = ref('')

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
  mensajeExito.value = 'Cliente eliminado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerClientes()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  mensajeExito.value = 'Cliente registrado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerClientes()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  clienteEditarId.value = null
  mensajeExito.value = 'Cliente actualizado correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerClientes()
}

onMounted(obtenerClientes)
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />

    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Clientes</h1>
          <p class="text-sm text-slate-500 mt-1 mb-0">Administra los clientes registrados en el sistema</p>
        </div>
        <button
          @click="mostrarRegistro = true"
          class="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2 border-none rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Registrar Cliente
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
            Lista de Clientes
          </h2>
          <span class="text-xs text-slate-400 font-medium">{{ clientes.length }} registros</span>
        </div>

        <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando clientes...</p>

        <ClientsTable
          v-else
          :clientes="clientes"
          @editar="abrirEdicion"
          @eliminar="eliminarCliente"
        />
      </div>
    </div>
  </div>

  <RegisterClientModal
    v-if="mostrarRegistro"
    @cerrar="mostrarRegistro = false"
    @guardado="cerrarRegistro"
  />

  <EditClientModal
    v-if="mostrarEdicion && clienteEditarId"
    :id="clienteEditarId"
    @cerrar="mostrarEdicion = false; clienteEditarId = null"
    @guardado="cerrarEdicion"
  />
</template>