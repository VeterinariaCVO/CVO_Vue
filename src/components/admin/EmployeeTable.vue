<template>
  <div>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="status-msg error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr class="thead-row">
          <th v-for="h in ['Foto','Nombre','Email','Telefono','Direccion','Sexo','Edad','Estado','Acciones']" :key="h" class="th">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id" class="tr">
          <td class="td">
            <img v-if="employee.profile_photo" :src="employee.profile_photo" class="avatar" alt="foto" />
            <div v-else class="avatar-placeholder">{{ employee.name.charAt(0).toUpperCase() }}</div>
          </td>
          <td class="td">{{ employee.name }}</td>
          <td class="td muted">{{ employee.email }}</td>
          <td class="td muted">{{ employee.phone ?? '-' }}</td>
          <td class="td muted">{{ employee.address ?? '-' }}</td>
          <td class="td muted">{{ employee.gender ? capitalize(employee.gender) : '-' }}</td>
          <td class="td muted">{{ employee.age != null ? employee.age + ' años' : '-' }}</td>
          <td class="td">
            <span :class="employee.active ? 'badge-active' : 'badge-suspended'">
              {{ employee.active ? 'Activo' : 'Suspendido' }}
            </span>
          </td>
          <td class="td">
            <div class="flex gap-1">
              <button @click="$emit('edit', employee)"   class="btn-edit">Editar</button>
              <button @click="$emit('delete', employee)" class="btn-delete">Eliminar</button>
            </div>
          </td>
        </tr>
        <tr v-if="employees.length === 0">
          <td colspan="9" class="status-msg">No hay empleados registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'
defineProps<{ employees: User[]; loading: boolean; error: string | null }>()
defineEmits<{ (e: 'edit', employee: User): void; (e: 'delete', employee: User): void }>()
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
</script>

<style scoped>

.table     { @apply w-full border-collapse text-sm; }
.thead-row { @apply bg-gray-50; }
.th        { @apply text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap; }
.tr        { @apply border-b border-gray-100 hover:bg-gray-50 transition-colors; }
.td        { @apply px-4 py-3 text-gray-700 whitespace-nowrap; }
.muted     { @apply text-gray-400; }

.avatar             { @apply w-9 h-9 rounded-full object-cover border-2 border-gray-200 block; }
.avatar-placeholder { @apply w-9 h-9 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center; }

.badge-active    { @apply bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-suspended { @apply bg-gray-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }

.btn-edit   { @apply bg-cyan-500 text-white border-none px-2.5 py-1 rounded text-xs cursor-pointer hover:opacity-85; }
.btn-delete { @apply bg-red-500 text-white border-none px-2.5 py-1 rounded text-xs cursor-pointer hover:opacity-85; }

.status-msg       { @apply text-center py-10 text-gray-400 text-sm; }
.status-msg.error { @apply text-red-500; }
</style>