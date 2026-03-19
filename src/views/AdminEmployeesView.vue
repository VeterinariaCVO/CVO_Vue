<template>
  <div class="page">
    <nav class="navbar">
      <div class="navbar-left">
        <div class="logo">VO</div>
        <span class="brand">Panel Admin</span>
      </div>
      <div class="navbar-right">
        <button v-for="item in ['Inicio', 'Usuarios', 'Empleados', 'Reportes', 'Perfil']" :key="item"
          @click="item === 'Empleados' ? $router.push({ name: 'admin-employees' }) : item === 'Usuarios' ? $router.push({ name: 'admin-users' }) : null"
          class="nav-btn">{{ item }}</button>
        <button class="btn-green">Editar Calendario</button>
        <button @click="logout" class="btn-red">Cerrar sesion</button>
      </div>
    </nav>

    <div class="content">
      <h4 class="welcome">Bienvenido, {{ authStore.user?.name ?? 'Admin User' }}</h4>
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">Gestion de Empleados</h5>
          <button @click="openCreate" class="btn-create">+ Registrar Empleado</button>
        </div>
        <EmployeeTable :employees="employees" :loading="loading" :error="error" @edit="openEdit" @toggle="toggleActive" @delete="openDelete" />
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <EmployeeModal :open="modal.open" :edit-employee="modal.editEmployee" @close="modal.open = false" @saved="onSaved" />
    <EmployeeDeleteModal :open="deleteModal.open" :loading="deleteModal.loading" :employee="deleteModal.employee" @close="deleteModal.open = false" @confirm="confirmDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useEmployeeStore } from '@/stores/employee'
import type { User } from '@/types/user'
import EmployeeTable       from '@/components/admin/EmployeeTable.vue'
import EmployeeModal       from '@/components/admin/EmployeeModal.vue'
import EmployeeDeleteModal from '@/components/admin/EmployeeDeleteModal.vue'

const router        = useRouter()
const authStore     = useAuthStore()
const employeeStore = useEmployeeStore()
const { employees, loading, error } = storeToRefs(employeeStore)

const toast       = ref<string | null>(null)
const modal       = ref({ open: false, editEmployee: null as User | null })
const deleteModal = ref({ open: false, loading: false, employee: null as User | null })

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

function openCreate()        { modal.value = { open: true, editEmployee: null } }
function openEdit(e: User)   { modal.value = { open: true, editEmployee: e } }
function openDelete(e: User) { deleteModal.value = { open: true, loading: false, employee: e } }

function onSaved(isEdit: boolean) {
  showToast(isEdit ? 'Empleado actualizado.' : 'Empleado registrado.')
  employeeStore.fetchEmployees()
}

async function toggleActive(employee: User) {
  const ok = await employeeStore.toggleActive(employee)
  showToast(ok ? (employee.active ? 'Empleado activado.' : 'Empleado suspendido.') : 'Error: ' + error.value)
}

async function confirmDelete() {
  if (!deleteModal.value.employee) return
  deleteModal.value.loading = true
  const ok = await employeeStore.deleteEmployee(deleteModal.value.employee.id)
  deleteModal.value.loading = false
  if (ok) { showToast('Empleado eliminado.'); deleteModal.value.open = false }
  else showToast('Error: ' + error.value)
}

function logout() {
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => employeeStore.fetchEmployees())
</script>

<style scoped>

.page         { @apply min-h-screen w-full bg-blue-50; }
.navbar       { @apply bg-blue-500 px-8 py-2.5 flex items-center justify-between shadow-md w-full; }
.navbar-left  { @apply flex items-center gap-3; }
.logo         { @apply w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-500 text-sm; }
.brand        { @apply text-white font-bold text-lg; }
.navbar-right { @apply flex items-center gap-1; }
.nav-btn      { @apply text-white bg-transparent border-none px-3 py-1.5 rounded-md cursor-pointer text-sm hover:bg-white/20; }
.btn-green    { @apply bg-green-500 text-white px-3 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-2; }
.btn-red      { @apply bg-red-500 text-white px-3 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-1; }
.content      { @apply p-8; }
.welcome      { @apply text-xl font-bold text-gray-800 mb-6; }
.card         { @apply bg-white rounded-xl shadow-sm w-full overflow-x-auto; }
.card-header  { @apply flex items-center justify-between p-5; }
.card-title   { @apply text-lg font-bold text-blue-600; }
.btn-create   { @apply bg-green-500 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer hover:opacity-90; }
.toast        { @apply fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-lg z-50; }
</style>