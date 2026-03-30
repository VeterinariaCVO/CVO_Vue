<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'
import RegisterPetModal from '@/components/client/RegisterPetModal.vue'
import EditPetModal from '@/components/client/EditPetModal.vue'

const mascotas = ref<Pet[]>([])
const cargando = ref(true)

const mostrarPerfil = ref(false)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)

const mascotaSeleccionada = ref<Pet>({} as Pet)
const mascotaEditarId = ref<number | null>(null)

async function obtenerMascotas() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value.data
  cargando.value = false
}
const datosPerfil = computed(() => {
  const m = mascotaSeleccionada.value

  return [
    { label: 'Especie', valor: m.species ? m.species : '—' },
    { label: 'Raza', valor: m.breed ? m.breed : '—' },
    { label: 'Color', valor: m.color ? m.color : '—' },
    { label: 'Marcas especiales', valor: m.special_marks ? m.special_marks : '—' },
    { label: 'Edad', valor: m.age ? m.age + ' años' : '—' },
    { label: 'Peso', valor: m.weight ? m.weight + ' kg' : '—' },
  ]
})
function verPerfil(mascota: Pet) {
  mascotaSeleccionada.value = mascota
  mostrarPerfil.value = true
}
function abrirEdicion(mascota: Pet) {
  mascotaEditarId.value = mascota.id
  mostrarEdicion.value = true
}

function cerrarRegistro() {
  mostrarRegistro.value = false
  obtenerMascotas()
}
function cerrarEdicion() {
  mostrarEdicion.value = false
  obtenerMascotas()
}

async function eliminarMascota(id: number) {
  const confirmar = confirm('¿Seguro que quieres eliminar esta mascota?')
  if (!confirmar) return

  const { execute } = ApiUseFetch(`mis-mascotas/${id}`).delete().json()
  await execute()
  obtenerMascotas()
}

onMounted(obtenerMascotas)
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-2xl font-bold text-[#1e3a5f] m-0">Mis Mascotas</h1>
        <p class="text-sm text-slate-500 mt-1 mb-0">Gestiona las mascotas registradas</p>
      </div>
      <button
        @click="mostrarRegistro = true"
        class="bg-[#1d6bbf] hover:bg-[#155fa8] text-white font-semibold text-sm px-5 py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
      >
        + Registrar Mascota
      </button>
    </div>

    <!-- Estados -->
    <p v-if="cargando" class="text-center text-slate-400 py-10">Cargando mascotas...</p>
    <p v-else-if="mascotas.length === 0" class="text-center text-slate-400 py-10">
      No hay mascotas registradas.
    </p>

    <!-- Grid de tarjetas -->
    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      <div
        v-for="mascota in mascotas"
        :key="mascota.id"
        class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm p-5 flex flex-col gap-4 transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(29,107,191,0.12)]"
      >
        <!-- Cabecera de tarjeta -->
        <div class="flex items-center gap-3">
          <img
            v-if="mascota.photo_path"
            :src="mascota.photo_path"
            class="w-12 h-12 rounded-full object-cover border-2 border-[#dce6f0] shrink-0"
          />
          <div
            v-else
            class="w-12 h-12 rounded-full bg-[#e8f0fa] flex items-center justify-center text-xl border-2 border-[#dce6f0] shrink-0"
          >
            🐾
          </div>
          <div>
            <p class="font-bold text-base text-[#1e3a5f] m-0">{{ mascota.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5 mb-0">{{ mascota.species }}</p>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-2 border-t border-slate-100 pt-3">
          <button
            @click="verPerfil(mascota)"
            class="flex-1 text-xs font-semibold py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-blue-100 text-blue-700"
          >
            Ver
          </button>
          <button
            @click="abrirEdicion(mascota)"
            class="flex-1 text-xs font-semibold py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-yellow-100 text-yellow-800"
          >
            Editar
          </button>
          <button
            @click="eliminarMascota(mascota.id)"
            class="flex-1 text-xs font-semibold py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-red-100 text-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: VER PERFIL -->
  <div
    v-if="mostrarPerfil"
    class="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999]"
  >
    <div
      class="bg-white rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
    >
      <!-- Cabecera del perfil -->
      <div class="flex flex-col items-center gap-2 mb-5">
        <img
          v-if="mascotaSeleccionada.photo_path"
          :src="mascotaSeleccionada.photo_path"
          class="w-22 h-22 rounded-full object-cover border-[3px] border-blue-200"
        />
        <div
          v-else
          class="w-22 h-22 rounded-full bg-[#e8f0fa] flex items-center justify-center text-4xl border-[3px] border-blue-200"
        >
          🐾
        </div>
        <h2 class="text-xl font-bold text-[#1e3a5f] m-0">{{ mascotaSeleccionada.name }}</h2>
        <span
          class="inline-block text-xs font-semibold px-3 py-0.5 rounded-full"
          :class="
            mascotaSeleccionada.sex === 'male'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-pink-100 text-pink-700'
          "
        >
          {{ mascotaSeleccionada.sex === 'male' ? '♂ Macho' : '♀ Hembra' }}
        </span>
      </div>

      <!-- Datos -->
      <div class="flex flex-col gap-2.5 mb-5">
        <div
          v-for="(item, i) in datosPerfil"
          :key="i"
          class="flex justify-between items-center py-2 border-b border-slate-100 last:border-none"
        >
          <span class="text-xs font-semibold text-slate-500">{{ item.label }}</span>
          <span class="text-sm text-[#1e3a5f] font-medium">{{ item.valor }}</span>
        </div>
      </div>

      <button
        @click="mostrarPerfil = false"
        class="w-full bg-[#e8f0fa] hover:bg-blue-100 text-[#1d6bbf] font-semibold text-sm py-2.5 border-none rounded-xl cursor-pointer transition-colors duration-200"
      >
        Cerrar
      </button>
    </div>
  </div>

  <!-- MODAL: REGISTRAR -->
  <RegisterPetModal v-if="mostrarRegistro" @cerrar="cerrarRegistro" @guardado="obtenerMascotas" />

  <!-- MODAL: EDITAR -->
  <EditPetModal
    v-if="mostrarEdicion && mascotaEditarId"
    :id="mascotaEditarId!"
    @cerrar="cerrarEdicion"
    @guardado="obtenerMascotas"
  />
</template>
