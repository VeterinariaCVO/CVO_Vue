<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { getStorageUrl } from '@/utils/storageUrl'

const mascotas = ref<any[]>([])
const cargando = ref(true)
const busqueda = ref('')
const mensajeExito = ref('')
const mensajeError = ref('')

const mostrarConfirmarEliminar = ref(false)
const mascotaAEliminar = ref<any | null>(null)
const eliminando = ref(false)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

const mascotasFiltradas = computed(() => {
  if (!busqueda.value.trim()) return mascotas.value
  const q = busqueda.value.toLowerCase()
  return mascotas.value.filter(
    (m) =>
      m.nombre?.toLowerCase().includes(q) ||
      m.especie?.toLowerCase().includes(q) ||
      m.dueno_nombre?.toLowerCase().includes(q),
  )
})

async function cargarMascotas() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('/admin/pets').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargando.value = false
}

async function toggleActive(mascota: any) {
  const accion = mascota.activa ? 'desactivar' : 'activar'
  const { data, execute } = ApiUseFetch(`/admin/pets/${mascota.mascota_id}/toggle-active`)
    .patch({ accion })
    .json()
  await execute()

  if (data.value?.success) {
    mensajeExito.value = accion === 'activar' ? 'Mascota activada' : 'Mascota desactivada'
    setTimeout(() => (mensajeExito.value = ''), 3000)
    await cargarMascotas()
  }
}

function confirmarEliminar(mascota: any) {
  mascotaAEliminar.value = mascota
  mostrarConfirmarEliminar.value = true
}

async function ejecutarEliminar() {
  if (!mascotaAEliminar.value) return
  eliminando.value = true
  const { execute } = ApiUseFetch(`/admin/pets/${mascotaAEliminar.value.mascota_id}`)
    .delete()
    .json()
  await execute()
  eliminando.value = false
  mostrarConfirmarEliminar.value = false
  mascotaAEliminar.value = null
  mensajeExito.value = 'Mascota eliminada correctamente'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  await cargarMascotas()
}

onMounted(cargarMascotas)
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Mascotas</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Gestión de mascotas registradas</p>
      </div>
    </div>

    <div
      v-if="mensajeExito"
      class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm"
    >
      {{ mensajeExito }}
    </div>
    <div
      v-if="mensajeError"
      class="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm"
    >
      {{ mensajeError }}
    </div>

    <!-- Búsqueda -->
    <div class="mb-4">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por nombre, especie o dueño..."
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors w-full max-w-sm"
      />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="cargando" class="flex justify-center py-14">
        <div
          class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"
        ></div>
      </div>
      <p
        v-else-if="mascotasFiltradas.length === 0"
        class="text-center text-sm text-slate-400 py-12"
      >
        No hay mascotas registradas.
      </p>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Mascota</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Especie / Raza</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Dueño</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Sexo</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
            <th class="text-xs text-slate-400 font-medium px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mascota in mascotasFiltradas"
            :key="mascota.mascota_id"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="mascota.foto"
                  :src="petPhotoUrl(mascota.foto)"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm"
                >
                  🐾
                </div>
                <span class="text-sm font-medium text-slate-800">{{ mascota.nombre }}</span>
              </div>
            </td>
            <td class="px-5 py-3">
              <p class="text-sm text-slate-800 m-0">{{ mascota.especie }}</p>
              <p class="text-xs text-slate-400 m-0">{{ mascota.raza ?? 'Sin raza' }}</p>
            </td>
            <td class="px-5 py-3">
              <p class="text-sm text-slate-800 m-0">{{ mascota.dueno_nombre }}</p>
              <p class="text-xs text-slate-400 m-0">{{ mascota.dueno_email }}</p>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">
              {{ mascota.sexo === 'male' ? '♂ Macho' : '♀ Hembra' }}
            </td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2 py-1 rounded-md font-medium"
                :class="mascota.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'"
              >
                {{ mascota.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="toggleActive(mascota)"
                  title="Activar/Desactivar"
                  class="p-1.5 rounded-md text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors text-xs"
                >
                  {{ mascota.activa ? 'Desactivar' : 'Activar' }}
                </button>
                <button
                  @click="confirmarEliminar(mascota)"
                  title="Eliminar"
                  class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path d="M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Confirmar Eliminar -->
    <Teleport to="body">
      <div
        v-if="mostrarConfirmarEliminar"
        class="fixed inset-0 flex items-center justify-center z-50"
        style="background: rgba(0, 0, 0, 0.25)"
        @click.self="mostrarConfirmarEliminar = false"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-6 max-w-xs w-11/12">
          <p class="text-sm font-semibold text-slate-800 m-0 mb-1">¿Eliminar mascota?</p>
          <p class="text-sm text-slate-400 m-0 mb-5">
            Se eliminará a
            <span class="text-slate-600 font-medium">{{ mascotaAEliminar?.nombre }}</span
            >. Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="mostrarConfirmarEliminar = false"
              class="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-transparent text-slate-500 cursor-pointer hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarEliminar"
              :disabled="eliminando"
              class="text-sm px-3 py-1.5 rounded-lg border-none bg-red-500 hover:bg-red-600 text-white cursor-pointer disabled:opacity-50"
            >
              {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
