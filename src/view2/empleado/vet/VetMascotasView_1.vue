<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { getStorageUrl } from '@/utils/storageUrl'
import { useRouter } from 'vue-router'

const router = useRouter()

const pets = ref<any[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const search = ref('')
const selected = ref<any | null>(null)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

function loadPets() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch('/vet/pets').get().json()

  onFetchResponse(() => {
    isLoading.value = false
    pets.value = data.value?.data ?? []
  })

  onFetchError(() => {
    isLoading.value = false
    showMsg('No se pudieron cargar las mascotas', true)
  })

  execute()
}

loadPets()

const filtered = computed(() => {
  if (!search.value.trim()) return pets.value
  const q = search.value.toLowerCase()
  return pets.value.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(q) ||
      p.especie?.toLowerCase().includes(q) ||
      (p.raza && p.raza.toLowerCase().includes(q)),
  )
})

function showMsg(text: string, error: boolean) {
  message.value = text
  isError.value = error
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function sexLabel(sex: string) {
  return sex === 'male' ? ' Macho' : ' Hembra'
}

function speciesIcon(species: string) {
  const s = species?.toLowerCase() ?? ''
  if (s.includes('perro') || s.includes('dog')) return '🐾'
  if (s.includes('gato') || s.includes('cat')) return '🐾'
  if (s.includes('ave') || s.includes('bird')) return '🐾'
  if (s.includes('conejo') || s.includes('rabbit')) return '🐾'
  return '🐾'
}

defineOptions({ name: 'VetMascotas' })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-700">Mascotas</h1>
      <p class="text-sm text-slate-400 mt-0.5">Consulta el registro de pacientes</p>
    </div>

    <div
      v-if="message"
      class="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
      :class="
        isError
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-green-50 border border-green-200 text-green-700'
      "
    >
      <span>{{ isError ? '⚠' : '✓' }}</span> {{ message }}
    </div>

    <div class="relative mb-6 max-w-md">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre, especie o raza..."
        class="w-full pl-10 pr-4 py-3 rounded-2xl border border-blue-100 bg-white shadow-sm text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 animate-pulse"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-slate-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="filtered.length === 0" class="text-center py-20 text-slate-400">
        <p class="text-5xl mb-4">🐾</p>
        <p class="font-medium text-lg">No se encontraron mascotas</p>
        <p class="text-sm mt-1">Intenta con otro término de búsqueda</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="pet in filtered"
          :key="pet.mascota_id"
          @click="selected = pet"
          class="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-200 cursor-pointer group"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-blue-100 transition-colors overflow-hidden"
            >
              <img
                v-if="pet.foto"
                :src="petPhotoUrl(pet.foto)"
                :alt="pet.nombre"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ speciesIcon(pet.especie) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-800 text-base">{{ pet.nombre }}</h3>
              <p class="text-slate-400 text-xs mt-0.5">
                {{ pet.especie }}{{ pet.raza ? ' · ' + pet.raza : '' }}
              </p>
              <p
                class="text-xs mt-1"
                :class="pet.sexo === 'male' ? 'text-blue-500' : 'text-pink-400'"
              >
                {{ sexLabel(pet.sexo) }}
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400"
          >
            <span>🎂 {{ pet.edad_meses ?? '—' }} meses</span>
            <span>⚖️ {{ pet.peso_kg ? pet.peso_kg + ' kg' : '—' }}</span>
            <span>👤 {{ pet.dueno_nombre }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal detalle mascota -->
    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(15, 30, 60, 0.4); backdrop-filter: blur(4px)"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
          <button
            @click="selected = null"
            class="absolute top-4 right-4 text-slate-300 hover:text-slate-500 text-xl"
          >
            ✕
          </button>

          <div class="text-center mb-4">
            <div
              class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl mx-auto mb-3 overflow-hidden"
            >
              <img
                v-if="selected.foto"
                :src="petPhotoUrl(selected.foto)"
                :alt="selected.nombre"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ speciesIcon(selected.especie) }}</span>
            </div>
            <h2 class="font-bold text-slate-800 text-lg">{{ selected.nombre }}</h2>
            <p class="text-sm text-slate-400">
              {{ selected.especie }} {{ selected.raza ? '· ' + selected.raza : '' }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Sexo</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">{{ sexLabel(selected.sexo) }}</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Edad</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">
                {{ selected.edad_meses ?? '—' }} meses
              </p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Peso</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">
                {{ selected.peso_kg ? selected.peso_kg + ' kg' : '—' }}
              </p>
            </div>
            <div class="bg-slate-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400">Dueño</p>
              <p class="font-bold text-slate-700 text-sm mt-0.5">{{ selected.dueno_nombre }}</p>
            </div>
          </div>

          <button
            @click="router.push(`/veterinario/mascotas/${selected.mascota_id}/historial`)"
            class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Ver historial médico
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
