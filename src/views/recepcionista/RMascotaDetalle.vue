<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import type { PetVet } from '@/types/pet'

const route = useRoute()
const router = useRouter()

const pet = ref<PetVet | null>(null)
const isLoading = ref(true)
const isError = ref(false)

const fotoUrl = computed(() => {
  if (!pet.value?.photo_url) return null
  const storageUrl = import.meta.env.VITE_STORAGE_URL as string
  return `${storageUrl}${pet.value.photo_url}`
})

const petId = Number(route.params.id)

function formatoFecha(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const sexLabel = (sex: string) => sex === 'male' ? 'Macho' : 'Hembra'
const sexColor = (sex: string) => sex === 'male'
  ? 'bg-blue-50 text-blue-600 border-blue-100'
  : 'bg-pink-50 text-pink-600 border-pink-100'

async function cargarMascota() {
  isLoading.value = true
  isError.value = false

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/pets/${petId}`)
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    pet.value = data.value?.data ?? null
  })

  onFetchError(() => {
    isLoading.value = false
    isError.value = true
  })

  execute()
}

onMounted(() => cargarMascota())

defineOptions({ name: 'RMascotaDetalle' })
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <main class="p-8 max-w-4xl mx-auto space-y-6">

      <!-- Header -->
      <header class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#1d6bbf] hover:border-[#1d6bbf]/30 transition-all shadow-sm"
        >
          ←
        </button>
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">
            {{ isLoading ? '...' : (pet?.name ?? 'Mascota') }}
          </h1>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Ficha de paciente · Solo lectura
          </p>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-24">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-[#1d6bbf] rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="bg-red-50 border border-red-100 rounded-2xl px-6 py-5 text-center">
        <p class="text-sm font-black text-red-500 uppercase tracking-widest">No se pudo cargar la ficha</p>
        <button
          @click="cargarMascota"
          class="mt-3 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest underline"
        >
          Reintentar
        </button>
      </div>

      <template v-else-if="pet">

        <!-- Foto + info principal -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">

            <!-- Avatar -->
            <div class="shrink-0">
              <img
                v-if="fotoUrl"
                :src="fotoUrl"
                :alt="pet.name"
                class="w-20 h-20 rounded-2xl object-cover border border-slate-200"
              />
              <div
                v-else
                class="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl"
              >
                🐾
              </div>
            </div>

            <!-- Nombre + badges -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h2 class="text-2xl font-black text-slate-900 tracking-tighter uppercase">{{ pet.name }}</h2>
                <span class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  :class="sexColor(pet.sex)">
                  {{ sexLabel(pet.sex) }}
                </span>
                <span
                  class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  :class="pet.active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-red-50 text-red-500 border-red-100'"
                >
                  {{ pet.active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {{ pet.species }} {{ pet.breed ? '· ' + pet.breed : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Grid de datos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Datos físicos -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
              Datos Físicos
            </p>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Edad</p>
                <p class="text-xl font-black text-slate-700 tracking-tighter">
                  {{ pet.age != null ? pet.age + ' años' : '—' }}
                </p>
              </div>
              <div class="bg-slate-50 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                <p class="text-xl font-black text-slate-700 tracking-tighter">
                  {{ pet.weight != null ? pet.weight + ' kg' : '—' }}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-slate-50">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color</span>
                <span class="text-xs font-bold text-slate-700">{{ pet.color ?? '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-50">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marcas especiales</span>
                <span class="text-xs font-bold text-slate-700">{{ pet.special_marks ?? '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Datos del dueño -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
              Propietario
            </p>

            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-slate-50">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre</span>
                <span class="text-xs font-bold text-slate-700">{{ pet.owner?.name ?? '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-50">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                <span class="text-xs font-bold text-slate-700">{{ pet.owner?.phone ?? '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-50">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                <span class="text-xs font-bold text-slate-700 truncate max-w-[160px]">{{ pet.owner?.email ?? '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrado</span>
                <span class="text-xs font-bold text-slate-700">{{ formatoFecha(pet.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Acceso al historial -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Historial Clínico</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Consulta los expedientes médicos registrados</p>
          </div>
          <button
            @click="router.push(`/recepcionista/mascotas/${petId}/historial`)"
            class="shrink-0 inline-flex items-center gap-2 bg-[#1d6bbf] hover:bg-[#16569a] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Ver Historial
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>

      </template>
    </main>
  </div>
</template>
