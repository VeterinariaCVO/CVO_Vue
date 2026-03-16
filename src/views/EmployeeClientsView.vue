<template>
  <div class="page">

    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo-circle">VO</div>
        <span class="brand-name">Veterinaria del Oriente</span>
      </div>
      <div class="nav-links">
        <button class="nav-link" @click="$router.push({ name: 'home' })">Panel Principal</button>
        <button class="nav-link">Servicios</button>
        <button class="nav-link">Finanzas</button>
        <button class="btn-logout" @click="logout">Cerrar sesion</button>
      </div>
    </nav>

    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Clientes Registrados</h1>
        <p class="hero-sub">Busca y gestiona el perfil de cada cliente y sus mascotas.</p>
      </div>
    </div>

    <main class="container">
      <div class="section-box">
        <div class="section-header">
          <h3 class="section-title">Lista de Clientes</h3>
          <input v-model="search" placeholder="Buscar cliente..." class="search-input" />
        </div>

        <div v-if="loading" class="status-msg">Cargando...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr class="thead-blue">
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Direccion</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in filteredClients" :key="client.id" class="tr">
                <td>{{ client.name }}</td>
                <td class="muted">{{ client.email }}</td>
                <td class="muted">{{ client.phone ?? '-' }}</td>
                <td class="muted">{{ client.address ?? '-' }}</td>
                <td>
                  <span :class="client.active ? 'badge-active' : 'badge-suspended'">
                    {{ client.active ? 'Activo' : 'Suspendido' }}
                  </span>
                </td>
                <td>
                  <button
                    @click="$router.push({ name: 'client-profile', params: { id: client.id } })"
                    class="btn-info-sm">
                    Ver Perfil
                  </button>
                </td>
              </tr>
              <tr v-if="filteredClients.length === 0">
                <td colspan="6" class="status-msg">No se encontraron clientes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; 2025 Veterinaria del Oriente. Panel de Empleado.</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

const router    = useRouter()
const authStore = useAuthStore()
const API       = 'http://127.0.0.1:8000/api'

const clients = ref<User[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)
const search  = ref('')

function getHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${authStore.token}`,
    'Accept':        'application/json',
  }
}

const filteredClients = computed(() =>
  clients.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function fetchClients() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${API}/empleado/clients`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar clientes')
    clients.value = data.clients
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function logout() {
  fetch(`${API}/logout`, { method: 'POST', headers: getHeaders() })
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => fetchClients())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.page { min-height: 100vh; background: #f4f9ff; display: flex; flex-direction: column; }

.navbar {
  position: fixed; top: 0; width: 100%; z-index: 1000;
  background-color: #3f98ff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 12px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.navbar-brand { display: flex; align-items: center; gap: 10px; }
.logo-circle {
  width: 45px; height: 45px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #3f98ff; font-size: 13px;
}
.brand-name { color: white; font-weight: 700; font-size: 18px; }
.nav-links { display: flex; align-items: center; gap: 8px; }
.nav-link {
  color: white; background: transparent; border: none;
  font-size: 14px; font-weight: 500; cursor: pointer;
  padding: 6px 12px; border-radius: 4px;
  font-family: 'Poppins', sans-serif; transition: color 0.2s;
}
.nav-link:hover { color: #ffc107; }
.btn-logout {
  background-color: #ffc107; color: #333; border: none;
  padding: 6px 16px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; margin-left: 8px;
  font-family: 'Poppins', sans-serif;
}
.btn-logout:hover { background-color: #e0a800; }

.hero {
  width: 100%; height: 250px; margin-top: 69px;
  background: linear-gradient(rgba(0,123,255,0.7), rgba(0,123,255,0.7)),
              url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200') center/cover;
  display: flex; align-items: center; justify-content: center;
  text-align: center; color: white;
  border-radius: 0 0 50% 50% / 0 0 10% 10%;
  margin-bottom: 40px;
}
.hero-title { font-size: 2rem; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.hero-sub { font-size: 14px; font-weight: 300; margin-top: 8px; }

.container { max-width: 1100px; margin: 0 auto; padding: 0 24px 60px; flex: 1; }

.section-box {
  background: #e6f3ff; padding: 32px; border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1); margin-bottom: 30px;
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.section-title { font-size: 18px; font-weight: 700; color: #007bff; }
.search-input {
  border: 1px solid #b8d4f0; border-radius: 6px;
  padding: 7px 12px; font-size: 13px; font-family: 'Poppins', sans-serif;
  outline: none; width: 220px; background: white;
}
.search-input:focus { border-color: #3b82f6; }

.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; background: white; border-radius: 8px; overflow: hidden; }
.thead-blue { background-color: #007bff; color: white; }
.thead-blue th { padding: 12px 16px; font-weight: 600; }
.tr { border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.tr:hover { background-color: #f0f7ff; }
.tr td { padding: 12px 16px; color: #374151; }
.muted { color: #9ca3af; }

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
.btn-info-sm {
  background-color: #17a2b8; color: white; border: none;
  padding: 4px 14px; border-radius: 4px; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-info-sm:hover { opacity: 0.9; }

.status-msg { text-align: center; padding: 40px; color: #6b7280; font-size: 13px; }
.status-msg.error { color: #ef4444; }

.footer {
  background: #018ABE; padding: 32px;
  color: white; text-align: center; font-size: 14px;
  margin-top: auto;
}
</style>