<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const esAdmin = computed(() => auth.user?.role_id === 1)

const servicios = ref<any[]>([])
const cargando = ref(true)
const mensajeExito = ref('')
const mostrarModal = ref(false)
const modoEdicion = ref(false)
const servicioEditando = ref<any>(null)
const filtro = ref<'todos' | 'activos' | 'inactivos'>('todos')

const nombre = ref('')
const descripcion = ref('')
const precio = ref('')
const duracion = ref('')
const cargandoGuardar = ref(false)
const errores = ref<any>({})

const serviciosFiltrados = computed(() => {
  if (filtro.value === 'activos') return servicios.value.filter(s => s.active)
  if (filtro.value === 'inactivos') return servicios.value.filter(s => !s.active)
  return servicios.value
})

async function obtenerServicios() {
  cargando.value = true
  const url = esAdmin.value ? '/services?all=1' : '/services'
  const { data, execute } = ApiUseFetch(url).get().json()
  await execute()
  servicios.value = data.value?.data ?? []
  cargando.value = false
}

function abrirCrear() {
  modoEdicion.value = false
  servicioEditando.value = null
  nombre.value = ''
  descripcion.value = ''
  precio.value = ''
  duracion.value = ''
  errores.value = {}
  mostrarModal.value = true
}

function abrirEditar(servicio: any) {
  modoEdicion.value = true
  servicioEditando.value = servicio
  nombre.value = servicio.name
  descripcion.value = servicio.description ?? ''
  precio.value = servicio.price
  duracion.value = servicio.duration
  errores.value = {}
  mostrarModal.value = true
}

async function guardar() {
  errores.value = {}
  cargandoGuardar.value = true
  const payload = {
    name: nombre.value,
    description: descripcion.value || null,
    price: parseFloat(precio.value),
    duration: parseInt(duracion.value),
  }
  const req = modoEdicion.value
    ? ApiUseFetch(`/services/${servicioEditando.value.id}`).put(payload).json()
    : ApiUseFetch('/services').post({ ...payload, active: true }).json()
  const { data, execute } = req
  await execute()
  cargandoGuardar.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  mostrarModal.value = false
  mensajeExito.value = modoEdicion.value ? 'Servicio actualizado' : 'Servicio creado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerServicios()
}

async function toggleActivo(servicio: any) {
  const { execute } = ApiUseFetch(`/services/${servicio.id}`).put({ active: !servicio.active }).json()
  await execute()
  mensajeExito.value = servicio.active ? 'Servicio desactivado' : 'Servicio activado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerServicios()
}

async function eliminar(servicio: any) {
  if (!confirm(`¿Seguro que quieres eliminar el servicio "${servicio.name}"?`)) return
  const { execute } = ApiUseFetch(`/services/${servicio.id}`).delete().json()
  await execute()
  mensajeExito.value = 'Servicio eliminado'
  setTimeout(() => (mensajeExito.value = ''), 3000)
  obtenerServicios()
}

onMounted(obtenerServicios)
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Servicios</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">{{ esAdmin ? 'Administra el catálogo de servicios veterinarios' : 'Servicios disponibles' }}</p>
      </div>
      <button
        v-if="esAdmin"
        @click="abrirCrear"
        class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 border-none rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Nuevo servicio
      </button>
    </div>

    <div v-if="mensajeExito" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
      {{ mensajeExito }}
      <button @click="mensajeExito = ''" class="bg-transparent border-none cursor-pointer text-green-500 text-base leading-none">×</button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">

      <!-- Filtros admin -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div v-if="esAdmin" class="flex gap-1.5">
          <button
            v-for="f in [{ key: 'todos', label: 'Todos' }, { key: 'activos', label: 'Activos' }, { key: 'inactivos', label: 'Inactivos' }]"
            :key="f.key"
            @click="filtro = f.key as any"
            :class="filtro === f.key ? 'bg-[#1d6bbf] text-white' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-lg text-xs border-none transition-colors cursor-pointer"
          >{{ f.label }}</button>
        </div>
        <span v-else class="text-sm font-semibold text-slate-700">Catálogo disponible</span>
        <span class="text-xs text-slate-400">{{ serviciosFiltrados.length }} servicios</span>
      </div>

      <div v-if="cargando" class="flex justify-center py-14">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#1d6bbf]"></div>
      </div>
      <p v-else-if="serviciosFiltrados.length === 0" class="text-center text-sm text-slate-400 py-12">No hay servicios registrados.</p>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Servicio</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Descripción</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Precio</th>
            <th class="text-left text-xs text-slate-400 font-medium px-5 py-3">Duración</th>
            <th v-if="esAdmin" class="text-left text-xs text-slate-400 font-medium px-5 py-3">Estado</th>
            <th v-if="esAdmin" class="text-xs text-slate-400 font-medium px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="servicio in serviciosFiltrados"
            :key="servicio.id"
            class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
            :class="{ 'opacity-50': !servicio.active }"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-800">{{ servicio.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500 max-w-xs truncate">{{ servicio.description ?? '—' }}</td>
            <td class="px-5 py-3 text-sm text-slate-800 font-medium">${{ Number(servicio.price).toFixed(2) }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ servicio.duration }} min</td>
            <td v-if="esAdmin" class="px-5 py-3">
              <button
                @click="toggleActivo(servicio)"
                class="text-xs px-2 py-1 rounded border-none cursor-pointer transition-colors"
                :class="servicio.active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'"
              >{{ servicio.active ? 'Activo' : 'Inactivo' }}</button>
            </td>
            <td v-if="esAdmin" class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="abrirEditar(servicio)"
                  title="Editar"
                  class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button
                  @click="eliminar(servicio)"
                  title="Eliminar"
                  class="p-1.5 rounded-md text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal crear/editar -->
  <div v-if="mostrarModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="mostrarModal = false">
    <div class="bg-white rounded-xl w-full max-w-lg p-7 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-base font-semibold text-slate-800">{{ modoEdicion ? 'Editar servicio' : 'Nuevo servicio' }}</h2>
        <button @click="mostrarModal = false" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nombre del servicio</label>
          <input v-model="nombre" type="text" placeholder="Ej. Consulta médica general" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Descripción <span class="text-slate-400">(opcional)</span></label>
          <textarea v-model="descripcion" rows="2" placeholder="Descripción breve del servicio..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors resize-none"></textarea>
          <span v-if="errores.description" class="text-xs text-red-500">{{ errores.description }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500">Precio (MXN)</label>
            <input v-model="precio" type="number" min="0" step="0.01" placeholder="250.00" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <span v-if="errores.price" class="text-xs text-red-500">{{ errores.price }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500">Duración (minutos)</label>
            <input v-model="duracion" type="number" min="1" placeholder="30" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
            <span v-if="errores.duration" class="text-xs text-red-500">{{ errores.duration }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button @click="mostrarModal = false" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
        <button @click="guardar" :disabled="cargandoGuardar" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
          {{ cargandoGuardar ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear servicio' }}
        </button>
      </div>
    </div>
  </div>
</template>