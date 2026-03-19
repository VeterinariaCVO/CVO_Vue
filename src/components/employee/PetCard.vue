<template>
  <div class="card">
    <div class="pet-photo">
      <img v-if="pet.photo_path"
        :src="`http://127.0.0.1:8000/storage/${pet.photo_path}`"
        :alt="pet.name" class="w-full h-full object-cover" />
      <div v-else class="text-3xl">🐾</div>
    </div>
    <div class="pet-info">
      <h3 class="pet-name">{{ pet.name }}</h3>
      <p class="pet-species">{{ pet.species }}{{ pet.breed ? ` · ${pet.breed}` : '' }}</p>
      <div class="flex flex-wrap gap-1 mb-1.5">
        <span class="tag">{{ pet.sex === 'male' ? 'Macho' : 'Hembra' }}</span>
        <span v-if="pet.age"    class="tag">{{ pet.age }} años</span>
        <span v-if="pet.color"  class="tag">{{ pet.color }}</span>
        <span v-if="pet.weight" class="tag">{{ pet.weight }} kg</span>
      </div>
      <p v-if="pet.special_marks" class="text-xs text-gray-400">{{ pet.special_marks }}</p>
    </div>
    <div class="flex flex-col gap-1.5 flex-shrink-0">
      <button @click="$emit('view',   pet)" class="btn-view">Ver Detalle</button>
      <button @click="$emit('edit',   pet)" class="btn-edit">Editar</button>
      <button @click="$emit('delete', pet)" class="btn-delete">Eliminar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pet } from '@/types/pet'
defineProps<{ pet: Pet }>()
defineEmits<{
  (e: 'view',   pet: Pet): void
  (e: 'edit',   pet: Pet): void
  (e: 'delete', pet: Pet): void
}>()
</script>

<style scoped>

.card       { @apply bg-white rounded-xl border border-blue-200 shadow-sm p-4 flex gap-4 items-start hover:shadow-md transition-shadow; }
.pet-photo  { @apply w-16 h-16 rounded-xl bg-blue-100 overflow-hidden flex-shrink-0 flex items-center justify-center; }
.pet-info   { @apply flex-1; }
.pet-name   { @apply text-sm font-bold text-gray-800 mb-0.5; }
.pet-species { @apply text-xs text-gray-500 mb-2; }
.tag        { @apply bg-blue-50 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full; }
.btn-view   { @apply bg-blue-600 text-white border-none px-3.5 py-1 rounded-md text-xs font-semibold cursor-pointer hover:opacity-90; }
.btn-edit   { @apply bg-cyan-500 text-white border-none px-3.5 py-1 rounded-md text-xs font-semibold cursor-pointer hover:opacity-90; }
.btn-delete { @apply bg-red-500 text-white border-none px-3.5 py-1 rounded-md text-xs font-semibold cursor-pointer hover:opacity-90; }
</style>