<script setup lang="ts">
import type { PetVet } from '@/types/pet'

defineProps<{
  mascotas: PetVet[]
}>()

const emit = defineEmits<{
  (e: 'editar', id: number): void
  (e: 'eliminar', id: number): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
    <!-- Sin mascotas -->
    <p v-if="mascotas.length === 0" class="text-center text-slate-400 py-10">
      No hay mascotas registradas.
    </p>

    <!-- Tabla -->
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="bg-[#f0f5fb] border-b border-[#dce6f0]">
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Mascota</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Especie</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Raza</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Dueño</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Sexo</th>
          <th class="text-center text-xs font-semibold text-slate-500 px-5 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mascota in mascotas"
          :key="mascota.id"
          class="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors duration-150"
        >
          <td class="px-5 py-3">
            <div class="flex items-center gap-3">
              <img
                v-if="mascota.photo_url"
                :src="mascota.photo_url"
                class="w-8 h-8 rounded-full object-cover border border-[#dce6f0] shrink-0"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-[#e8f0fa] flex items-center justify-center text-sm shrink-0"
              >
                🐾
              </div>
              <span class="text-sm font-semibold text-[#1e3a5f]">{{ mascota.name }}</span>
            </div>
          </td>
          <td class="px-5 py-3 text-sm text-slate-600">{{ mascota.species }}</td>
          <td class="px-5 py-3 text-sm text-slate-600">{{ mascota.breed ?? '—' }}</td>
          <td class="px-5 py-3 text-sm text-slate-600">{{ mascota.owner?.name ?? '—' }}</td>
          <td class="px-5 py-3">
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="mascota.sex === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'"
            >
              {{ mascota.sex === 'male' ? '♂ Macho' : '♀ Hembra' }}
            </span>
          </td>
          <td class="px-5 py-3">
            <div class="flex items-center justify-center gap-2">
              <button
                @click="emit('editar', mascota.id)"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-yellow-100 text-yellow-800"
              >
                Editar
              </button>
              <button
                @click="emit('eliminar', mascota.id)"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-red-100 text-red-700"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>