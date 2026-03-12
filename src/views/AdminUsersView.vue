<template>
  <div class="page">

    <nav class="navbar">
      <div class="navbar-left">
        <div class="logo">VO</div>
        <span class="brand">Panel Admin</span>
      </div>
      <div class="navbar-right">
        <button v-for="item in ['Inicio', 'Usuarios', 'Reportes', 'Perfil']" :key="item"
          @click="item === 'Usuarios' && $router.push({ name: 'admin-users' })"
          class="nav-btn">{{ item }}</button>
        <button class="btn-green">Editar Calendario</button>
        <button class="btn-red" @click="logout">Cerrar sesion</button>
      </div>
    </nav>

    <div class="content">
      <h4 class="welcome">Bienvenido, {{ authStore.user?.name ?? 'Admin User' }}</h4>

      <div class="card">

        <div class="card-header">
          <h5 class="card-title">Gestion de Usuarios</h5>
          <button @click="$router.push({ name: 'register-user' })" class="btn-create">
            + Crear Nuevo Usuario
          </button>
        </div>

        <div v-if="loading" class="status-msg">Cargando...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>

        <table v-else class="table">
          <thead>
            <tr class="thead-row">
              <th v-for="h in ['Nombre','Email','Rol','Telefono','Direccion','Activo','Acciones']" :key="h" class="th">
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
                <span :class="user.active ? 'badge-active' : 'badge-inactive'">
                  {{ user.active ? 'Si' : 'No' }}
                </span>
              </td>
              <td class="td">
                <span v-if="user.role === 'Admin'" class="you">Tu</span>
                <div v-else class="actions">
                  <button @click="$router.push({ name: 'register-user', query: { id: user.id } })"
                    class="btn-edit">Editar</button>
                  <button @click="toggleActive(user)" class="btn-lock">
                    {{ user.active ? 'Bloquear' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const API = 'http://127.0.0.1:8000/api'

interface User {
  id: number
  name: string
  email: string
  role: string | null
  role_id: number
  phone: string | null
  address: string | null
  active: boolean
}

const users   = ref<User[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)
const toast   = ref<string | null>(null)

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authStore.token}`,
    'Accept': 'application/json',
  }
}

async function fetchUsers() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${API}/admin/users`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Error del servidor (${res.status})`)
    }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar usuarios')
    users.value = data.users
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function toggleActive(user: User) {
  try {
    const res = await fetch(`${API}/admin/users/${user.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        name:    user.name,
        email:   user.email,
        role_id: user.role_id,
        phone:   user.phone,
        address: user.address,
        active:  !user.active,
      }),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al actualizar')
    user.active = !user.active
    showToast(user.active ? 'Usuario activado.' : 'Usuario bloqueado.')
  } catch (e: any) {
    showToast('Error: ' + e.message)
  }
}

function logout() {
  fetch(`${API}/logout`, { method: 'POST', headers: getHeaders() })
  authStore.clear()
  router.push({ name: 'home' })
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

onMounted(() => {
  fetchUsers()
  const msg = sessionStorage.getItem('toast')
  if (msg) { showToast(msg); sessionStorage.removeItem('toast') }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.page { min-height: 100vh; width: 100%; background-color: #eaf4fb; }

.navbar {
  background-color: #3f98ff;
  padding: 10px 32px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
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
  width: 100%; overflow-x: auto; padding: 20px;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.card-title { font-size: 17px; font-weight: 700; color: #007bff; }
.btn-create {
  background-color: #28a745; color: white; border: none;
  padding: 8px 16px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-create:hover { opacity: 0.9; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.thead-row { background-color: #f8f9fa; }
.th {
  text-align: left; padding: 12px 16px;
  font-weight: 600; color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.tr { border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
.tr:hover { background-color: #f9fafb; }
.td { padding: 12px 16px; color: #374151; white-space: nowrap; }
.td.muted { color: #9ca3af; }

.badge-active {
  background-color: #28a745; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px;
}
.badge-inactive {
  background-color: #dc3545; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px;
}
.you { color: #9ca3af; font-size: 11px; font-style: italic; }

.actions { display: flex; gap: 4px; }
.btn-edit {
  background-color: #17a2b8; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-lock {
  background-color: #ffc107; color: white; border: none;
  padding: 4px 10px; border-radius: 4px; font-size: 11px;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}

.status-msg { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }
.status-msg.error { color: #ef4444; }

.toast {
  position: fixed; bottom: 20px; right: 20px;
  background-color: #16a34a; color: white;
  padding: 12px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 50;
}
</style>