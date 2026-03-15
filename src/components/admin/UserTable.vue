<template>
  <div>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="status-msg error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr class="thead-row">
          <th v-for="h in ['Nombre','Email','Rol','Telefono','Direccion','Estado','Acciones']" :key="h" class="th">
            {{ h }}
          </th>
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
            <span v-if="user.role === 'Admin'" class="you">Tu</span>
            <div v-else class="actions">
              <button @click="$emit('edit', user)" class="btn-edit">Editar</button>
              <button @click="$emit('toggle', user)"
                :class="user.active ? 'btn-suspend' : 'btn-activate'">
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

defineProps<{
  users: User[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  (e: 'edit',   user: User): void
  (e: 'toggle', user: User): void
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.thead-row { background-color: #f8f9fa; }
.th {
  text-align: left; padding: 12px 16px;
  font-weight: 600; color: #6b7280;
  border-bottom: 1px solid #e5e7eb; white-space: nowrap;
}
.tr { border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
.tr:hover { background-color: #f9fafb; }
.td { padding: 12px 16px; color: #374151; white-space: nowrap; }
.td.muted { color: #9ca3af; }

.badge-active {
  background-color: #28a745; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 10px; border-radius: 999px;
}
.badge-suspended {
  background-color: #6b7280; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 10px; border-radius: 999px;
}
.you { color: #9ca3af; font-size: 11px; font-style: italic; }

.actions { display: flex; gap: 4px; }
.btn-edit {
  background-color: #17a2b8; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-suspend {
  background-color: #ffc107; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-activate {
  background-color: #28a745; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.status-msg { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }
.status-msg.error { color: #ef4444; }
</style>