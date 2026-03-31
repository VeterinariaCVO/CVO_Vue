<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { PetVet } from '@/types/pet'
import MascotasTable from '@/components/admin/MascotasTable.vue'
import RegisterPetAdminModal from '@/components/admin/RegisterPetModal.vue'
import EditPetAdminModal from '@/components/admin/EditPetModal.vue'

const mascotas = ref<PetVet[]>([])
const cargando = ref(true)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const mascotaEditarId = ref<number | null>(null)

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
  obtenerMascotas()
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  obtenerMascotas()
}

function cerrarEdicion() {
  mostrarEdicion.value = false
  mascotaEditarId.value = null
  obtenerMascotas()
}

onMounted(obtenerMascotas)
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Gestión de Mascotas</h1>
        <p class="text-sm text-slate-500 mt-1 mb-0">Administra todas las mascotas registradas en el sistema</p>
      </div>
      <button
        @click="mostrarRegistro = true"
        class="bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm px-5 py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
      >
        + Registrar Mascota
      </button>
    </div>

    <!-- Estado cargando -->
    <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando mascotas...</p>

    <!-- Tabla -->
    <MascotasTable
      v-else
      :mascotas="mascotas"
      @editar="abrirEdicion"
      @eliminar="eliminarMascota"
    />
  </div>

  <!-- Modal Registrar -->
  <RegisterPetAdminModal
    v-if="mostrarRegistro"
    @cerrar="cerrarRegistro"
    @guardado="cerrarRegistro"
  />

  <!-- Modal Editar -->
  <EditPetAdminModal
    v-if="mostrarEdicion && mascotaEditarId"
    :id="mascotaEditarId"
    @cerrar="cerrarEdicion"
    @guardado="cerrarEdicion"
  />
</template>