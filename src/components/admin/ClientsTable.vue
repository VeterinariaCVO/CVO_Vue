<script setup lang="ts">
import type { Client } from '@/types/client'

defineProps<{ clientes: Client[] }>()
const emit = defineEmits<{
  (e: 'editar', id: number): void
  (e: 'eliminar', id: number): void
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <p v-if="clientes.length === 0" class="text-sm text-slate-400 text-center py-10">No hay clientes registrados.</p>
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="border-b border-slate-100">
          <th class="text-left text-xs text-slate-400 font-medium px-4 py-3">Nombre</th>
          <th class="text-left text-xs text-slate-400 font-medium px-4 py-3">Correo</th>
          <th class="text-left text-xs text-slate-400 font-medium px-4 py-3">Teléfono</th>
          <th class="text-left text-xs text-slate-400 font-medium px-4 py-3">Dirección</th>
          <th class="text-xs text-slate-400 font-medium px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente.id" class="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <img v-if="cliente.profile_photo" :src="cliente.profile_photo" class="w-7 h-7 rounded-full object-cover shrink-0" />
              <div v-else class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="text-sm text-slate-800">{{ cliente.name }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-slate-500">{{ cliente.email }}</td>
          <td class="px-4 py-3 text-sm text-slate-500">{{ cliente.phone ?? '—' }}</td>
          <td class="px-4 py-3 text-sm text-slate-500">{{ cliente.address ?? '—' }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-1">
              <button
                @click="emit('editar', cliente.id)"
                title="Editar"
                class="p-1.5 rounded-md text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                @click="emit('eliminar', cliente.id)"
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
</template>