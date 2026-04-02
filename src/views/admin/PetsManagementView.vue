<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { PetVet } from '@/types/pet'
import MascotasTable from '@/components/admin/PetTable.vue'
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
  if (!confirm('¿Seguro que quieres eliminar esta mascota?')) return
  const { execute } = ApiUseFetch(`pets/${id}`).delete().json()
  await execute()
  mensajeExito.value = 'Mascota eliminada'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  mensajeExito.value = 'Mascota registrada'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  mascotaEditarId.value = null
  mensajeExito.value = 'Mascota actualizada'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerMascotas()
}

onMounted(obtenerMascotas)
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Mascotas</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Administra todas las mascotas registradas</p>
      </div>
      <button
        @click="mostrarRegistro = true"
        class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Registrar mascota
      </button>
    </div>

    <!-- Éxito -->
    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none">×</button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-700 m-0">Lista de mascotas</h2>
        <span class="text-xs text-slate-400">{{ mascotas.length }} registros</span>
      </div>

      <p v-if="cargando" class="text-sm text-slate-400 text-center py-10">Cargando...</p>

      <MascotasTable
        v-else
        :mascotas="mascotas"
        @editar="abrirEdicion"
        @eliminar="eliminarMascota"
      />
    </div>
  </div>

  <RegisterPetAdminModal v-if="mostrarRegistro" @cerrar="mostrarRegistro = false" @guardado="cerrarRegistro" />
  <EditPetAdminModal v-if="mostrarEdicion && mascotaEditarId" :id="mascotaEditarId" @cerrar="mostrarEdicion = false; mascotaEditarId = null" @guardado="cerrarEdicion" />
</template>