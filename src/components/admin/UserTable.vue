<template>
  <div>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="status-msg error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr class="thead-row">
          <th v-for="h in ['Nombre','Email','Rol','Telefono','Direccion','Estado','Acciones']" :key="h" class="th">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="tr">
          <td class="td">{{ user.name }}</td>
          <td class="td muted">{{ user.email }}</td>
          <td class="td">{{ user.role ?? '-' }}</td>
          <td class="td muted">{{ user.phone ?? '-' }}</td>
          <td class="td muted">{{ user.address ?? '-' }}</td>
          <td class="td">
            <span :class="user.active ? 'badge-active' : 'badge-suspended'">
              {{ user.active ? 'Activo' : 'Suspendido' }}
            </span>
          </td>
          <td class="td">
            <span v-if="user.role === 'Admin'" class="text-gray-400 text-xs italic">Tu</span>
            <div v-else class="flex gap-1">
              <button @click="$emit('edit', user)"   class="btn-edit">Editar</button>
              <button @click="$emit('toggle', user)" :class="user.active ? 'btn-suspend' : 'btn-activate'">
                {{ user.active ? 'Suspender' : 'Activar' }}
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="7" class="status-msg">No hay usuarios en esta categoria.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'
defineProps<{ users: User[]; loading: boolean; error: string | null }>()
defineEmits<{ (e: 'edit', user: User): void; (e: 'toggle', user: User): void }>()
</script>

<style scoped>

.table     { @apply w-full border-collapse text-sm; }
.thead-row { @apply bg-gray-50; }
.th        { @apply text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap; }
.tr        { @apply border-b border-gray-100 hover:bg-gray-50 transition-colors; }
.td        { @apply px-4 py-3 text-gray-700 whitespace-nowrap; }
.muted     { @apply text-gray-400; }

.badge-active    { @apply bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-suspended { @apply bg-gray-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }

.btn-edit     { @apply bg-cyan-500 text-white border-none px-2.5 py-1 rounded text-xs cursor-pointer hover:opacity-85; }
.btn-suspend  { @apply bg-yellow-400 text-white border-none px-2.5 py-1 rounded text-xs cursor-pointer hover:opacity-85; }
.btn-activate { @apply bg-green-500 text-white border-none px-2.5 py-1 rounded text-xs cursor-pointer hover:opacity-85; }

.status-msg       { @apply text-center py-10 text-gray-400 text-sm; }
.status-msg.error { @apply text-red-500; }
</style>