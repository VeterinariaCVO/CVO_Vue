<template>
  <div>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="status-msg error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr class="thead-row">
          <th v-for="h in ['Foto','Nombre','Email','Telefono','Direccion','Sexo','Edad','Estado','Acciones']" :key="h" class="th">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id" class="tr">

          <!-- Foto -->
          <td class="td">
            <img v-if="employee.profile_photo" :src="employee.profile_photo" class="avatar" alt="foto" />
            <div v-else class="avatar-placeholder">{{ employee.name.charAt(0).toUpperCase() }}</div>
          </td>

          <td class="td">{{ employee.name }}</td>
          <td class="td muted">{{ employee.email }}</td>
          <td class="td muted">{{ employee.phone ?? '-' }}</td>
          <td class="td muted">{{ employee.address ?? '-' }}</td>

          <!-- Sexo -->
          <td class="td muted">{{ employee.gender ? capitalize(employee.gender) : '-' }}</td>

          <!-- Edad -->
          <td class="td muted">{{ employee.age != null ? employee.age + ' años' : '-' }}</td>

          <!-- Estado -->
          <td class="td">
            <span :class="employee.active ? 'badge-active' : 'badge-suspended'">
              {{ employee.active ? 'Activo' : 'Suspendido' }}
            </span>
          </td>

          <!-- Acciones: solo Editar y Eliminar -->
          <td class="td">
            <div class="actions">
              <button @click="$emit('edit', employee)" class="btn-edit">Editar</button>
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

defineProps<{
  employees: User[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  (e: 'edit',   employee: User): void
  (e: 'delete', employee: User): void
}>()

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
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

.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; border: 2px solid #e5e7eb; display: block;
}
.avatar-placeholder {
  width: 36px; height: 36px; border-radius: 50%;
  background-color: #3f98ff; color: white;
  font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

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

.actions { display: flex; gap: 4px; }
.btn-edit {
  background-color: #17a2b8; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-edit:hover { opacity: 0.85; }
.btn-delete {
  background-color: #dc3545; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-delete:hover { opacity: 0.85; }

.status-msg { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }
.status-msg.error { color: #ef4444; }
</style>