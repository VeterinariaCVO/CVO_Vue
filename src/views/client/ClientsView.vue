<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'
import { getStorageUrl } from '@/utils/storageUrl'
import RegisterPetModal from '@/components/client/RegisterPetModal.vue'
import EditPetModal from '@/components/client/EditPetModal.vue'

const router = useRouter()

// Estados de Datos
const mascotas = ref<Pet[]>([])
const cargando = ref(true)
const historial = ref<any[]>([])

// Estados de Modales
const mostrarPerfil = ref(false)
const mostrarRegistro = ref(false)
const mostrarEdicion = ref(false)
const eliminando = ref(false)

// Referencias de Selección
const mascotaSeleccionada = ref<Pet>({} as Pet)
const mascotaEditarId = ref<number | null>(null)
const mascotaAEliminar = ref<Pet | null>(null)
const registroSeleccionado = ref<any>(null) // Controla el submodal de historial

const LIMITE_MASCOTAS = 8
const limiteAlcanzado = computed(() => mascotas.value.length >= LIMITE_MASCOTAS)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

const datosPerfil = computed(() => {
  const m = mascotaSeleccionada.value
  return [
    { label: 'Especie', valor: m.species ?? '—' },
    { label: 'Raza', valor: m.breed ?? 'Variedad común' },
    { label: 'Color', valor: m.color ?? '—' },
    { label: 'Marcas', valor: m.special_marks ?? 'Sin marcas' },
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
  if (años === 0) return `${m} MESES`
  if (m === 0) return `${años} AÑOS`
  return `${años} AÑOS Y ${m} MESES`
}

async function obtenerMascotas() {
  cargando.value = true
  try {
    const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
    await execute()
    mascotas.value = data.value?.data ?? []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function cargarHistorial() {
  try {
    const { data, execute } = ApiUseFetch('medical-records').get().json()
    await execute()
    historial.value = data.value?.data ?? []
  } catch (e) {
    console.error(e)
  }
}

function verPerfil(mascota: Pet) {
  registroSeleccionado.value = null // Limpiar selección previa
  mascotaSeleccionada.value = { ...mascota }
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
  try {
    const { execute } = ApiUseFetch(`mis-mascotas/${mascotaAEliminar.value.id}`).delete().json()
    await execute()
    obtenerMascotas()
  } finally {
    eliminando.value = false
    mascotaAEliminar.value = null
  }
}

onMounted(() => {
  obtenerMascotas()
  cargarHistorial()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 italic">
    <div class="max-w-[1600px] mx-auto px-10 py-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button
            @click="router.back()"
            class="group flex items-center gap-2 mb-6 text-slate-400 hover:text-[#3f98ff] transition-all cursor-pointer bg-transparent border-none p-0"
          >
            <svg
              class="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="text-[10px] font-black uppercase tracking-[0.2em]">Regresar</span>
          </button>
          <h1
            class="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none m-0"
          >
            Mis Mascotas
          </h1>
          <p class="text-[#3f98ff] text-[10px] font-bold uppercase tracking-[0.3em] mt-2 m-0">
            Expedientes Clínicos Activos
          </p>
        </div>

        <div class="flex flex-col items-end gap-3">
          <button
            @click="!limiteAlcanzado && (mostrarRegistro = true)"
            :disabled="limiteAlcanzado"
            class="px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 shadow-xl border-none cursor-pointer active:scale-95"
            :class="
              limiteAlcanzado
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#3f98ff] text-white shadow-blue-500/20 hover:scale-105'
            "
          >
            + Registrar Nueva
          </button>
          <div class="text-right px-2">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest m-0">
              Capacidad
            </p>
            <p
              class="text-[11px] font-black m-0"
              :class="limiteAlcanzado ? 'text-red-500' : 'text-slate-700'"
            >
              {{ mascotas.length }} / {{ LIMITE_MASCOTAS }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
        <div
          class="w-10 h-10 border-4 border-[#3f98ff] border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Sincronizando...
        </p>
      </div>

      <div
        v-else-if="mascotas.length === 0"
        class="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm"
      >
        <p class="text-slate-300 text-[12px] font-black uppercase tracking-[0.3em]">
          No hay pacientes registrados
        </p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="mascota in mascotas"
          :key="mascota.id"
          class="group bg-white rounded-[2.2rem] border border-slate-100 shadow-sm p-6 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 relative overflow-hidden"
        >
          <div
            class="absolute -right-4 -top-4 w-24 h-24 bg-[#3f98ff]/5 rounded-full blur-2xl group-hover:bg-[#3f98ff]/10 transition-colors"
          ></div>

          <div class="flex items-center gap-5 mb-6 relative z-10">
            <div class="shrink-0 relative">
              <img
                v-if="mascota.photo_url"
                :src="petPhotoUrl(mascota.photo_url)"
                class="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg group-hover:rotate-3 transition-transform duration-500"
              />
              <div
                v-else
                class="w-20 h-20 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shadow-lg text-white font-black text-xl uppercase italic"
              >
                {{ mascota.name.charAt(0) }}
              </div>
            </div>
            <div class="min-w-0">
              <h3
                class="text-slate-900 font-black text-lg uppercase tracking-tighter truncate m-0 leading-tight"
              >
                {{ mascota.name }}
              </h3>
              <p
                class="text-[#3f98ff] text-[9px] font-black uppercase tracking-widest mt-1 truncate"
              >
                {{ mascota.species }}
              </p>
              <p class="text-slate-400 text-[8px] font-bold uppercase tracking-widest truncate">
                {{ mascota.breed ?? 'Variedad común' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-auto relative z-10">
            <button
              @click="verPerfil(mascota)"
              class="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-[#3f98ff] hover:text-white transition-all duration-300 cursor-pointer border-none"
            >
              Ver Expediente
            </button>
            <div class="flex gap-2">
              <button
                @click="abrirEdicion(mascota)"
                class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-black uppercase text-[8px] tracking-[0.15em] hover:bg-slate-200 transition-all cursor-pointer border-none italic"
              >
                Editar
              </button>
              <button
                @click="confirmarEliminar(mascota)"
                class="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-black uppercase text-[8px] tracking-[0.15em] hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none italic"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarPerfil"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-6 italic"
    >
      <div
        class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
      >
        <div class="relative p-10 bg-slate-900 text-white flex items-center gap-8">
          <button
            @click="mostrarPerfil = false"
            class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-all"
          >
            ✕
          </button>
          <img
            v-if="mascotaSeleccionada.photo_url"
            :src="petPhotoUrl(mascotaSeleccionada.photo_url)"
            class="w-32 h-32 rounded-[2rem] object-cover border-4 border-[#3f98ff] shadow-2xl"
          />
          <div
            v-else
            class="w-32 h-32 rounded-[2rem] bg-[#3f98ff]/20 flex items-center justify-center border-4 border-[#3f98ff]/30 text-4xl font-black italic"
          >
            {{ mascotaSeleccionada.name.charAt(0) }}
          </div>
          <div>
            <div class="flex items-center gap-4 mb-2">
              <h2 class="text-4xl font-black uppercase tracking-tighter m-0">
                {{ mascotaSeleccionada.name }}
              </h2>
              <span
                class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic"
                :class="
                  mascotaSeleccionada.sex === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-pink-500 text-white'
                "
              >
                {{ mascotaSeleccionada.sex === 'male' ? 'Macho' : 'Hembra' }}
              </span>
            </div>
            <p class="text-[#3f98ff] text-[10px] font-bold uppercase tracking-[0.4em] m-0">
              Paciente Registrado
            </p>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-5 gap-10 no-scrollbar"
        >
          <div class="lg:col-span-2 space-y-6">
            <h3
              class="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-3 italic"
            >
              Detalles Generales
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="(item, i) in datosPerfil"
                :key="i"
                class="bg-[#f8fafc] p-4 rounded-2xl border border-slate-50"
              >
                <p class="text-[8px] font-black text-[#3f98ff] uppercase tracking-widest m-0">
                  {{ item.label }}
                </p>
                <p class="text-[12px] font-black text-slate-800 uppercase italic mt-1 m-0">
                  {{ item.valor }}
                </p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-3 space-y-6">
            <h3
              class="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-3 italic"
            >
              Historial Clínico
            </h3>
            <div
              v-if="historialMascota.length === 0"
              class="py-10 text-center bg-[#f8fafc] rounded-[2rem] border-2 border-dashed border-slate-100"
            >
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                Sin registros médicos previos
              </p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="registro in historialMascota"
                :key="registro.id"
                @click="registroSeleccionado = registro"
                class="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-[#3f98ff] hover:bg-[#3f98ff]/5 transition-all cursor-pointer shadow-sm"
              >
                <div class="flex justify-between items-start">
                  <p class="text-slate-900 font-black text-xs uppercase italic m-0">
                    {{ registro.diagnosis ?? 'Consulta General' }}
                  </p>
                  <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">{{
                    registro.created_at
                  }}</span>
                </div>
                <p class="text-slate-400 text-[9px] mt-2 font-bold uppercase italic m-0">
                  Click para ver detalles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="registroSeleccionado"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[300] p-6"
      @click.self="registroSeleccionado = null"
    >
      <div
        class="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
      >
        <div class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <p class="text-[#3f98ff] text-[10px] font-black uppercase tracking-[0.3em] m-0">
              Detalles Médicos
            </p>
            <h3
              class="text-xl font-black text-slate-900 uppercase tracking-tighter m-0 mt-1 italic"
            >
              {{ registroSeleccionado.diagnosis ?? 'Consulta General' }}
            </h3>
          </div>
          <button
            @click="registroSeleccionado = null"
            class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div class="p-8 overflow-y-auto max-h-[60vh] space-y-8 no-scrollbar">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                Fecha
              </p>
              <p class="text-sm font-black text-slate-800">{{ registroSeleccionado.created_at }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                Veterinario
              </p>
              <p class="text-sm font-black text-slate-800 uppercase italic">
                {{ registroSeleccionado.veterinarian?.name ?? 'Clínica' }}
              </p>
            </div>
          </div>
          <div class="space-y-6">
            <div
              v-if="registroSeleccionado.symptoms"
              class="bg-slate-50 p-6 rounded-2xl border border-slate-100"
            >
              <p class="text-[9px] font-black text-[#3f98ff] uppercase tracking-widest mb-2 italic">
                Síntomas
              </p>
              <p class="text-xs text-slate-600 font-bold leading-relaxed italic m-0">
                {{ registroSeleccionado.symptoms }}
              </p>
            </div>
            <div
              v-if="registroSeleccionado.treatment"
              class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100"
            >
              <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">
                Tratamiento
              </p>
              <p class="text-xs text-slate-700 font-bold leading-relaxed italic m-0">
                {{ registroSeleccionado.treatment }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 text-center">
          <button
            @click="registroSeleccionado = null"
            class="px-10 py-3 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-none cursor-pointer italic"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mascotaAEliminar"
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[300] p-6 italic"
    >
      <div
        class="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center border-t-4 border-red-500"
      >
        <h3 class="text-xl font-black text-slate-900 uppercase tracking-tighter m-0">
          ¿Confirmar Baja?
        </h3>
        <p
          class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed italic"
        >
          Eliminarás a <span class="text-red-500">{{ mascotaAEliminar.name }}</span> de forma
          permanente.
        </p>
        <div class="flex gap-3 mt-8">
          <button
            @click="mascotaAEliminar = null"
            class="flex-1 py-4 rounded-xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] border-none cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="ejecutarEliminar"
            :disabled="eliminando"
            class="flex-1 py-4 rounded-xl bg-red-50 text-red-500 font-black uppercase text-[10px] border-none cursor-pointer"
          >
            {{ eliminando ? '...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <RegisterPetModal v-if="mostrarRegistro" @cerrar="cerrarRegistro" @guardado="obtenerMascotas" />
    <EditPetModal
      v-if="mostrarEdicion && mascotaEditarId"
      :id="mascotaEditarId"
      @cerrar="cerrarEdicion"
      @guardado="obtenerMascotas"
    />
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
