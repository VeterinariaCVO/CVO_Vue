<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{
  empleados: User[]
}>()

const emit = defineEmits<{
  (e: 'editar', id: number): void
  (e: 'eliminar', id: number): void
  (e: 'toggleActivo', empleado: User): void
}>()

function nombreRol(roleId: number) {
  if (roleId === 2) return 'Recepcionista'
  if (roleId === 4) return 'Veterinario'
  return 'Empleado'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#dce6f0] shadow-sm overflow-hidden">
    <!-- Sin empleados -->
    <p v-if="empleados.length === 0" class="text-center text-slate-400 py-10">
      No hay empleados registrados.
    </p>

    <!-- Tabla -->
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="bg-[#f0f5fb] border-b border-[#dce6f0]">
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Nombre</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Correo</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Rol</th>
          <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Teléfono</th>
          <th class="text-center text-xs font-semibold text-slate-500 px-5 py-3">Estado</th>
          <th class="text-center text-xs font-semibold text-slate-500 px-5 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="empleado in empleados"
          :key="empleado.id"
          class="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors duration-150"
        >
          <td class="px-5 py-3">
            <div class="flex items-center gap-3">
              <img
                v-if="empleado.profile_photo"
                :src="empleado.profile_photo"
                class="w-8 h-8 rounded-full object-cover border border-[#dce6f0] shrink-0"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-[#e8f0fa] flex items-center justify-center text-sm shrink-0"
              >
                👤
              </div>
              <span class="text-sm font-semibold text-[#1e3a5f]">{{ empleado.name }}</span>
            </div>
          </td>
          <td class="px-5 py-3 text-sm text-slate-600">{{ empleado.email }}</td>
          <td class="px-5 py-3">
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="empleado.role_id === 4 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ nombreRol(empleado.role_id) }}
            </span>
          </td>
          <td class="px-5 py-3 text-sm text-slate-600">{{ empleado.phone ?? '—' }}</td>
          <td class="px-5 py-3 text-center">
            <button
              @click="emit('toggleActivo', empleado)"
              class="text-xs font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer transition-opacity duration-150 hover:opacity-80"
              :class="empleado.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            >
              {{ empleado.active ? 'Activo' : 'Inactivo' }}
            </button>
          </td>
          <td class="px-5 py-3">
            <div class="flex items-center justify-center gap-2">
              <button
                @click="emit('editar', empleado.id)"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 bg-yellow-100 text-yellow-800"
              >
                Editar
              </button>
              <button
                @click="emit('eliminar', empleado.id)"
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