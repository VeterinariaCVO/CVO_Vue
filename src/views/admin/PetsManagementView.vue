<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { PetVet } from '@/types/pet'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import MascotasTable from '@/components/admin/MascotasTable.vue'
import RegisterPetAdminModal from '@/components/admin/RegisterPetModal.vue'
import EditPetAdminModal from '@/components/admin/EditPetModal.vue'

const mascotas = ref<PetVet[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const mascotaEditarId = ref<number | null>(null)
const mensajeExito = ref('')

async function obtenerMascotas() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('pets').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargando.value = false
}

function abrirEdicion(id: number) {
  mascotaEditarId.value = id
  mostrarEdicion.value = true
}

async function eliminarMascota(id: number) {
  const confirmar = confirm('¿Seguro que quieres eliminar esta mascota?')
  if (!confirmar) return
  const { execute } = ApiUseFetch(`pets/${id}`).delete().json()
  await execute()
  mensajeExito.value = 'Mascota eliminada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  mensajeExito.value = 'Mascota registrada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  mascotaEditarId.value = null
  mensajeExito.value = 'Mascota actualizada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

onMounted(obtenerMascotas)
</script>

<template>
  <div class="min-h-screen bg-[#eaf1fb]">
    <AdminNavbar />

    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Mascotas</h1>
          <p class="text-sm text-slate-500 mt-1 mb-0">Administra todas las mascotas registradas en el sistema</p>
        </div>
        <button
          @click="mostrarRegistro = true"
          class="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2 border-none rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          Registrar Mascota
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
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Lista de Mascotas
          </h2>
          <span class="text-xs text-slate-400 font-medium">{{ mascotas.length }} registros</span>
        </div>

        <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando mascotas...</p>

        <MascotasTable
          v-else
          :mascotas="mascotas"
          @editar="abrirEdicion"
          @eliminar="eliminarMascota"
        />
      </div>
    </div>
  </div>

  <RegisterPetAdminModal
    v-if="mostrarRegistro"
    @cerrar="mostrarRegistro = false"
    @guardado="cerrarRegistro"
  />

  <EditPetAdminModal
    v-if="mostrarEdicion && mascotaEditarId"
    :id="mascotaEditarId"
    @cerrar="mostrarEdicion = false; mascotaEditarId = null"
    @guardado="cerrarEdicion"
  />
</template>