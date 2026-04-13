<template>
  <div class="min-h-screen bg-[#f0f4ff] font-sans antialiased">
    <div class="max-w-[1600px] mx-auto px-10 py-8">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <button
            @click="router.back()"
            class="group flex items-center gap-2 mb-4 bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-[#0056c2] text-slate-600 hover:text-[#0056c2] text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Regresar
          </button>
          <h1 class="text-3xl font-bold text-slate-800 m-0">Mis Mascotas</h1>
          <p class="text-slate-400 text-sm mt-1 m-0">
            Gestiona las mascotas registradas para Veterinaria del Oriente.
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button
            @click="!limiteAlcanzado && (mostrarRegistro = true)"
            :disabled="limiteAlcanzado"
            class="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full border-none cursor-pointer transition-colors shadow-sm"
            :class="
              limiteAlcanzado
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#0056c2] hover:bg-[#004baa] text-white'
            "
          >
            Registrar Mascota
          </button>
          <div class="text-right">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">
              Capacidad del Plan
            </p>
            <p
              class="text-sm font-bold m-0"
              :class="limiteAlcanzado ? 'text-red-500' : 'text-slate-700'"
            >
              {{ mascotas.length }} / {{ LIMITE_MASCOTAS }} mascotas
            </p>
          </div>
        </div>
      </div>

      <!-- Alerta límite -->
      <div
        v-if="limiteAlcanzado"
        class="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3 text-sm mb-6 flex items-center gap-2"
      >
        Has alcanzado el límite de {{ LIMITE_MASCOTAS }} mascotas.
      </div>

      <p v-if="cargando" class="text-center text-slate-400 py-16">Cargando mascotas...</p>
      <p v-else-if="mascotas.length === 0" class="text-center text-slate-400 py-16">
        No hay mascotas registradas.
      </p>

      <!-- Grid de tarjetas -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        <div
          v-for="mascota in mascotas"
          :key="mascota.id"
          class="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="mascota.photo_url"
              :src="petPhotoUrl(mascota.photo_url)"
              class="w-16 h-16 rounded-2xl object-cover shadow-sm"
            />
            <div
              v-else
              class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm"
            >
              <svg
                class="w-7 h-7 text-[#0056c2]/40"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 21c-4.97 0-9-3.134-9-7 0-1.914.96-3.64 2.5-4.9C6.5 7.69 8 5.5 8 3.5c0 0 1 1.5 1 3 .667-.333 2-1.5 2-3 0 0 1 1.5 1 3 .667-.333 2-1.5 2-3 0 2 1.5 4.19 2.5 5.6C18.04 10.36 19 12.086 19 14c0 3.866-4.03 7-7 7z"
                />
              </svg>
            </div>
            <div>
              <p class="font-bold text-lg text-slate-800 m-0">{{ mascota.name }}</p>
              <p class="text-[#0056c2] text-sm font-medium m-0">
                {{ mascota.species }} ({{ mascota.breed ?? 'Sin raza' }})
              </p>
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              @click="verPerfil(mascota)"
              class="text-slate-500 hover:text-[#0056c2] text-sm font-semibold bg-transparent border-none cursor-pointer p-0 transition-colors"
            >
              Ver perfil
            </button>
            <div class="flex items-center gap-2">
              <button
                @click="abrirEdicion(mascota)"
                class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border-none cursor-pointer transition-colors"
              >
                Editar
              </button>
              <button
                @click="confirmarEliminar(mascota)"
                class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold border-none cursor-pointer transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: VER PERFIL -->
    <div
      v-if="mostrarPerfil"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div
          class="relative p-8 rounded-t-3xl overflow-hidden"
          style="background: linear-gradient(135deg, #0056c2, #3b82f6)"
        >
          <button
            @click="mostrarPerfil = false"
            class="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white border-none cursor-pointer flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
          <div class="flex items-center gap-6">
            <img
              v-if="mascotaSeleccionada.photo_url"
              :src="petPhotoUrl(mascotaSeleccionada.photo_url)"
              class="w-28 h-28 rounded-2xl object-cover shadow-xl border-4 border-white/30"
            />
            <div
              v-else
              class="w-28 h-28 rounded-2xl bg-white/20 flex items-center justify-center shadow-xl"
            >
              <svg
                class="w-12 h-12 text-white/60"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 21c-4.97 0-9-3.134-9-7 0-1.914.96-3.64 2.5-4.9C6.5 7.69 8 5.5 8 3.5c0 0 1 1.5 1 3 .667-.333 2-1.5 2-3 0 0 1 1.5 1 3 .667-.333 2-1.5 2-3 0 2 1.5 4.19 2.5 5.6C18.04 10.36 19 12.086 19 14c0 3.866-4.03 7-7 7z"
                />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-3xl font-bold text-white m-0">{{ mascotaSeleccionada.name }}</h2>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                  :class="
                    mascotaSeleccionada.sex === 'male'
                      ? 'bg-green-400 text-white'
                      : 'bg-pink-400 text-white'
                  "
                >
                  {{ mascotaSeleccionada.sex === 'male' ? 'Macho' : 'Hembra' }}
                </span>
              </div>
              <p class="text-blue-100 text-base m-0">
                Un compañero leal que forma parte de nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Información General -->
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-5 m-0">Información General</h3>
            <div class="flex flex-col gap-4">
              <div
                v-for="(item, i) in datosPerfil"
                :key="i"
                class="flex justify-between items-center border-b border-slate-100 pb-3 last:border-none last:pb-0"
              >
                <span class="text-slate-400 text-sm">{{ item.label }}</span>
                <span class="text-slate-800 font-semibold text-sm">{{ item.valor }}</span>
              </div>
            </div>
          </div>
          <!-- Historial Clínico -->
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-5 m-0">Historial Clínico</h3>
            <p v-if="historialMascota.length === 0" class="text-slate-400 text-sm text-center py-4">
              Sin registros médicos.
            </p>
            <div v-else class="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              <div
                v-for="registro in historialMascota"
                :key="registro.id"
                class="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors"
                @click="registroSeleccionado = registro"
              >
                <div class="flex items-start justify-between mb-1">
                  <p class="text-[#0056c2] font-bold text-sm m-0">
                    {{ registro.diagnosis ?? 'Sin diagnóstico' }}
                  </p>
                  <span
                    class="text-slate-400 text-[10px] font-semibold uppercase ml-2 flex-shrink-0"
                    >{{ registro.created_at ?? '—' }}</span
                  >
                </div>
                <p class="text-slate-400 text-xs m-0">Toca para ver detalles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUBMODAL: DETALLE DE REGISTRO CLÍNICO -->
    <div
      v-if="registroSeleccionado"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div
          class="p-6 flex items-center justify-between"
          style="background: linear-gradient(135deg, #0056c2, #3b82f6)"
        >
          <div>
            <h3 class="text-white font-bold text-lg m-0">Expediente Clínico</h3>
            <p class="text-blue-100 text-xs mt-1 m-0">
              {{ registroSeleccionado.created_at ?? '—' }}
            </p>
          </div>
          <button
            @click="registroSeleccionado = null"
            class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white border-none cursor-pointer flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div class="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          <div v-if="registroSeleccionado.diagnosis" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Diagnóstico</span
            >
            <p class="text-slate-800 text-sm font-semibold m-0">
              {{ registroSeleccionado.diagnosis }}
            </p>
          </div>
          <div v-if="registroSeleccionado.symptoms" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Síntomas</span
            >
            <p class="text-slate-600 text-sm m-0">{{ registroSeleccionado.symptoms }}</p>
          </div>
          <div v-if="registroSeleccionado.treatment" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Tratamiento</span
            >
            <p class="text-slate-600 text-sm m-0">{{ registroSeleccionado.treatment }}</p>
          </div>
          <div v-if="registroSeleccionado.prescriptions" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Prescripciones</span
            >
            <p class="text-slate-600 text-sm m-0">{{ registroSeleccionado.prescriptions }}</p>
          </div>
          <div v-if="registroSeleccionado.observations" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Observaciones</span
            >
            <p class="text-slate-600 text-sm m-0">{{ registroSeleccionado.observations }}</p>
          </div>
          <div v-if="registroSeleccionado.next_visit" class="flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >Próxima visita</span
            >
            <p class="text-[#0056c2] font-bold text-sm m-0">
              {{ registroSeleccionado.next_visit }}
            </p>
          </div>
          <div
            v-if="
              !registroSeleccionado.diagnosis &&
              !registroSeleccionado.symptoms &&
              !registroSeleccionado.treatment &&
              !registroSeleccionado.prescriptions
            "
          >
            <p class="text-slate-400 text-sm text-center py-4">Sin información adicional.</p>
          </div>
        </div>
        <div class="p-4 border-t border-slate-100">
          <button
            @click="registroSeleccionado = null"
            class="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: CONFIRMAR ELIMINAR -->
    <div
      v-if="mascotaAEliminar"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        <div class="text-center mb-6">
          <h3 class="text-lg font-bold text-slate-800 m-0">¿Eliminar mascota?</h3>
          <p class="text-slate-400 text-sm mt-2 m-0">
            Estás por eliminar a <strong class="text-slate-700">{{ mascotaAEliminar.name }}</strong
            >. Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="mascotaAEliminar = null"
            class="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="ejecutarEliminar"
            :disabled="eliminando"
            class="flex-1 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition-colors"
            :class="
              eliminando
                ? 'bg-red-300 text-white cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            "
          >
            {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'
import { getStorageUrl } from '@/utils/storageUrl'
import RegisterPetModal from '@/components/client/RegisterPetModal.vue'
import EditPetModal from '@/components/client/EditPetModal.vue'

const router = useRouter()

const mascotas = ref<Pet[]>([])
const cargando = ref(true)
const historial = ref<any[]>([])

const mostrarPerfil = ref(false)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const eliminando = ref(false)

const mascotaSeleccionada = ref<Pet>({} as Pet)
const mascotaEditarId = ref<number | null>(null)
const mascotaAEliminar = ref<Pet | null>(null)
const registroSeleccionado = ref<any>(null)

const LIMITE_MASCOTAS = 8
const limiteAlcanzado = computed(() => mascotas.value.length >= LIMITE_MASCOTAS)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

const datosPerfil = computed(() => {
  const m = mascotaSeleccionada.value
  return [
    { label: 'Especie', valor: m.species ?? '—' },
    { label: 'Raza', valor: m.breed ?? '—' },
    { label: 'Color', valor: m.color ?? '—' },
    { label: 'Marcas', valor: m.special_marks ?? '—' },
    { label: 'Edad', valor: m.age ? formatearEdad(m.age) : '—' },
    { label: 'Peso', valor: m.weight ? m.weight + ' kg' : '—' },
  ]
})

const historialMascota = computed(() =>
  historial.value.filter((r: any) => r.pet?.id === mascotaSeleccionada.value.id),
)

function formatearEdad(meses: number): string {
  if (!meses) return '—'
  const años = Math.floor(meses / 12)
  const m = meses % 12
  if (años === 0) return `${m} meses`
  if (m === 0) return `${años} años`
  return `${años} años, ${m} meses`
}

async function obtenerMascotas() {
  cargando.value = true
  const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargando.value = false
}

async function cargarHistorial() {
  const { data, execute } = ApiUseFetch('medical-records').get().json()
  await execute()
  historial.value = data.value?.data ?? []
}

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

function confirmarEliminar(mascota: Pet) {
  mascotaAEliminar.value = mascota
}

async function ejecutarEliminar() {
  if (!mascotaAEliminar.value) return
  eliminando.value = true
  const { execute } = ApiUseFetch(`mis-mascotas/${mascotaAEliminar.value.id}`).delete().json()
  await execute()
  eliminando.value = false
  mascotaAEliminar.value = null
  obtenerMascotas()
}

onMounted(() => {
  obtenerMascotas()
  cargarHistorial()
})
</script>
