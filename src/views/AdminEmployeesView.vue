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
        <button class="btn-red" @click="logout">Cerrar sesion</button>
      </div>
    </nav>

    <div class="content">
      <h4 class="welcome">Bienvenido, {{ authStore.user?.name ?? 'Admin User' }}</h4>

      <div class="card">

        <div class="card-header">
          <h5 class="card-title">Gestion de Empleados</h5>
          <button @click="openCreate" class="btn-create">+ Registrar Empleado</button>
        </div>

        <EmployeeTable
          :employees="employees"
          :loading="loading"
          :error="error"
          @edit="openEdit"
          @toggle="toggleActive"
          @delete="openDelete"
        />

      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <EmployeeModal
      :open="modal.open"
      :edit-employee="modal.editEmployee"
      @close="modal.open = false"
      @saved="onSaved"
    />

    <EmployeeDeleteModal
      :open="deleteModal.open"
      :loading="deleteModal.loading"
      :employee="deleteModal.employee"
      @close="deleteModal.open = false"
      @confirm="confirmDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'
import EmployeeTable       from '@/components/admin/EmployeeTable.vue'
import EmployeeModal       from '@/components/admin/EmployeeModal.vue'
import EmployeeDeleteModal from '@/components/admin/EmployeeDeleteModal.vue'

const router    = useRouter()
const authStore = useAuthStore()
const API       = 'http://127.0.0.1:8000/api'

const employees = ref<User[]>([])
const loading   = ref(true)
const error     = ref<string | null>(null)
const toast     = ref<string | null>(null)

const modal = ref<{ open: boolean; editEmployee: User | null }>({ open: false, editEmployee: null })
const deleteModal = ref<{ open: boolean; loading: boolean; employee: User | null }>({
  open: false, loading: false, employee: null
})

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${authStore.token}`,
    'Accept':        'application/json',
  }
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

async function fetchEmployees() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${API}/admin/employees`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar empleados')
    employees.value = data.employees
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  modal.value = { open: true, editEmployee: null }
}

function openEdit(employee: User) {
  modal.value = { open: true, editEmployee: employee }
}

function openDelete(employee: User) {
  deleteModal.value = { open: true, loading: false, employee }
}

function onSaved(isEdit: boolean) {
  showToast(isEdit ? 'Empleado actualizado exitosamente.' : 'Empleado registrado exitosamente.')
  fetchEmployees()
}

async function toggleActive(employee: User) {
  try {
    const res = await fetch(`${API}/admin/employees/${employee.id}`, {
      method:  'PUT',
      headers: getHeaders(),
      body:    JSON.stringify({
        name:    employee.name,
        email:   employee.email,
        role_id: employee.role_id,
        phone:   employee.phone,
        address: employee.address,
        active:  !employee.active,
      }),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al actualizar')
    employee.active = !employee.active
    showToast(employee.active ? 'Empleado activado.' : 'Empleado suspendido.')
  } catch (e: any) {
    showToast('Error: ' + e.message)
  }
}

async function confirmDelete() {
  if (!deleteModal.value.employee) return
  deleteModal.value.loading = true
  try {
    const res  = await fetch(`${API}/admin/employees/${deleteModal.value.employee.id}`, {
      method: 'DELETE', headers: getHeaders()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Error al eliminar')
    showToast('Empleado eliminado exitosamente.')
    deleteModal.value.open = false
    await fetchEmployees()
  } catch (e: any) {
    showToast('Error: ' + e.message)
  } finally {
    deleteModal.value.loading = false
  }
}

function logout() {
  fetch(`${API}/logout`, { method: 'POST', headers: getHeaders() })
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => fetchEmployees())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.page { min-height: 100vh; width: 100%; background-color: #eaf4fb; }

.navbar {
  background-color: #3f98ff; padding: 10px 32px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%;
}
.navbar-left { display: flex; align-items: center; gap: 12px; }
.logo {
  width: 40px; height: 40px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #3f98ff; font-size: 13px;
}
.brand { color: white; font-weight: 700; font-size: 17px; }
.navbar-right { display: flex; align-items: center; gap: 4px; }
.nav-btn {
  color: white; background: transparent; border: none;
  padding: 6px 12px; border-radius: 6px; cursor: pointer;
  font-size: 13px; font-family: 'Poppins', sans-serif;
}
.nav-btn:hover { background: rgba(255,255,255,0.2); }
.btn-green {
  background-color: #28a745; color: white; border: none;
  padding: 6px 14px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; margin-left: 8px;
  font-family: 'Poppins', sans-serif;
}
.btn-red {
  background-color: #dc3545; color: white; border: none;
  padding: 6px 14px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; margin-left: 4px;
  font-family: 'Poppins', sans-serif;
}

.content { padding: 32px; }
.welcome { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 24px; }

.card {
  background: white; border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  width: 100%; overflow-x: auto;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px 20px;
}
.card-title { font-size: 17px; font-weight: 700; color: #007bff; }
.btn-create {
  background-color: #28a745; color: white; border: none;
  padding: 8px 16px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-create:hover { opacity: 0.9; }

.toast {
  position: fixed; bottom: 20px; right: 20px;
  background-color: #16a34a; color: white;
  padding: 12px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;
}
</style>