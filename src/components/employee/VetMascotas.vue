<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { getStorageUrl } from '@/utils/storageUrl'

import type { PetVet } from '@/types/pet.ts'
import { useRouter } from 'vue-router'

const router = useRouter()

const pets = ref<PetVet[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const search = ref('')
const selected = ref<PetVet | null>(null)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

function loadPets() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch('/pets').get().json()

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

/*function expedientepet(){
  isLoading.value= true

  const { data, onFetchResponse, onFetchError, execute}= ApiUseFetch('/veterinario/expediente/:id')
}*/

const filtered = computed(() => {
  if (!search.value.trim()) return pets.value
  const q = search.value.toLowerCase()
  return pets.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      (p.breed && p.breed.toLowerCase().includes(q)),
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
  if (sex === 'male') {
    return ' Macho'
  } else {
    return ' Hembra'
  }
}

function speciesIcon(species: string) {
  const s = species.toLowerCase()

  if (s.includes('perro') || s.includes('dog')) {
    return '🐾'
  }
  if (s.includes('gato') || s.includes('cat')) {
    return '🐾'
  }
  if (s.includes('ave') || s.includes('bird')) {
    return '🐾'
  }
  if (s.includes('conejo') || s.includes('rabbit')) {
    return '🐾'
  }

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
          :key="pet.id"
          @click="selected = pet"
          class="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-200 cursor-pointer group"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-blue-100 transition-colors overflow-hidden"
            >
              <img
                v-if="pet.photo_url"
                :src="petPhotoUrl(pet.photo_url)"
                :alt="pet.name"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ speciesIcon(pet.species) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-800 text-base">{{ pet.name }}</h3>
              <p class="text-slate-400 text-xs mt-0.5">
                {{ pet.species }}{{ pet.breed ? ' · ' + pet.breed : '' }}
              </p>
              <p
                class="text-xs mt-1"
                :class="pet.sex === 'male' ? 'text-blue-500' : 'text-pink-400'"
              >
                {{ sexLabel(pet.sex) }}
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400"
          >
            <span>🎂 {{ pet.age ?? '—' }} años</span>
            <span>⚖️ {{ pet.weight ? pet.weight + ' kg' : '—' }}</span>
            <span>👤 {{ pet.owner?.name }}</span>
          </div>
        </div>
      </div>

      <p v-if="filtered.length > 0" class="text-center text-sm text-slate-400 mt-8">
        {{ filtered.length }} mascota{{ filtered.length !== 1 ? 's' : '' }} encontrada{{
          filtered.length !== 1 ? 's' : ''
        }}
      </p>
    </div>

    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(15, 30, 60, 0.45); backdrop-filter: blur(4px)"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
          <button
            @click="selected = null"
            class="absolute top-5 right-5 text-slate-300 hover:text-slate-500 text-xl"
          >
            ✕
          </button>

          <div
            class="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl mx-auto mb-5 overflow-hidden"
          >
            <img
              v-if="selected.photo_url"
              :src="petPhotoUrl(selected.photo_url)"
              :alt="selected.name"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ speciesIcon(selected.species) }}</span>
          </div>

          <h2 class="text-xl font-bold text-slate-800 text-center mb-1">{{ selected.name }}</h2>
          <p class="text-slate-400 text-sm text-center mb-6">
            {{ selected.species }}{{ selected.breed ? ' · ' + selected.breed : '' }}
          </p>

          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400 mb-1">Sexo</p>
              <p class="font-bold text-slate-700 text-sm">{{ sexLabel(selected.sex) }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400 mb-1">Edad</p>
              <p class="font-bold text-slate-700 text-sm">{{ selected.age ?? '—' }} años</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400 mb-1">Peso</p>
              <p class="font-bold text-slate-700 text-sm">
                {{ selected.weight ? selected.weight + ' kg' : '—' }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-slate-400 mb-1">Color</p>
              <p class="font-bold text-slate-700 text-sm">{{ selected.color ?? '—' }}</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p class="text-xs text-slate-400 font-semibold mb-2">DUEÑO</p>
            <p class="font-bold text-slate-700">{{ selected.owner?.name }}</p>
            <p class="text-sm text-slate-400">{{ selected.owner?.email }}</p>
            <p class="text-sm text-slate-400">{{ selected.owner?.phone }}</p>
          </div>

          <div
            v-if="selected.special_marks"
            class="mt-3 bg-yellow-50 rounded-xl p-4 border border-yellow-100"
          >
            <p class="text-xs text-yellow-600 font-semibold mb-1">MARCAS ESPECIALES</p>
            <p class="text-sm text-slate-600">{{ selected.special_marks }}</p>
          </div>
        </div>
        <div class="mt-4">
          <button
            @click="router.push(`/veterinario/mascotas/${selected.id}/historial`)"
            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            📋 Ver historial médico
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
