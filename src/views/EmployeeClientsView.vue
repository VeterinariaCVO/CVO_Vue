<template>
  <div class="page">
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo">VO</div>
        <span class="brand">Veterinaria del Oriente</span>
      </div>
      <div class="nav-links">
        <button class="nav-link" @click="$router.push({ name: 'home' })">Panel Principal</button>
        <button class="nav-link">Servicios</button>
        <button class="nav-link">Finanzas</button>
        <button class="btn-logout" @click="logout">Cerrar sesion</button>
      </div>
    </nav>

    <div class="hero">
      <h1 class="hero-title">Clientes Registrados</h1>
      <p class="hero-sub">Busca y gestiona el perfil de cada cliente y sus mascotas.</p>
    </div>

    <main class="container">
      <div class="section-box">
        <div class="section-header">
          <h3 class="section-title">Lista de Clientes</h3>
          <input v-model="search" placeholder="Buscar cliente..." class="search-input" />
        </div>

        <div v-if="loading" class="status-msg">Cargando...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>

        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr class="thead-blue">
                <th>Nombre</th><th>Email</th><th>Telefono</th>
                <th>Direccion</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in filteredClients" :key="client.id" class="tr">
                <td>{{ client.name }}</td>
                <td class="muted">{{ client.email }}</td>
                <td class="muted">{{ client.phone ?? '-' }}</td>
                <td class="muted">{{ client.address ?? '-' }}</td>
                <td><span :class="client.active ? 'badge-active' : 'badge-suspended'">{{ client.active ? 'Activo' : 'Suspendido' }}</span></td>
                <td>
                  <button @click="$router.push({ name: 'client-profile', params: { id: client.id } })" class="btn-info">
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
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'

const router      = useRouter()
const authStore   = useAuthStore()
const clientStore = useClientStore()
const { clients, loading, error } = storeToRefs(clientStore)

const search = ref('')

const filteredClients = computed(() =>
  clients.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

function logout() {
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => clientStore.fetchClients())
</script>

<style scoped>

.page    { @apply min-h-screen bg-blue-50 flex flex-col; }

.navbar  { @apply fixed top-0 w-full z-50 bg-blue-500 shadow-md px-8 py-3 flex items-center justify-between; }
.navbar-brand { @apply flex items-center gap-2.5; }
.logo    { @apply w-11 h-11 bg-white rounded-full flex items-center justify-center font-bold text-blue-500 text-sm; }
.brand   { @apply text-white font-bold text-lg; }
.nav-links { @apply flex items-center gap-2; }
.nav-link  { @apply text-white bg-transparent border-none text-sm font-medium cursor-pointer px-3 py-1.5 rounded hover:text-yellow-300; }
.btn-logout { @apply bg-yellow-400 text-gray-800 border-none px-4 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-2 hover:bg-yellow-500; }

.hero      { @apply w-full h-64 mt-[69px] flex items-center justify-center text-center text-white mb-10; background: linear-gradient(rgba(0,123,255,0.7), rgba(0,123,255,0.7)), url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200') center/cover; border-radius: 0 0 50% 50% / 0 0 10% 10%; }
.hero-title { @apply text-4xl font-bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.hero-sub   { @apply text-sm font-light mt-2; }

.container   { @apply max-w-5xl mx-auto px-6 pb-16 flex-1; }
.section-box { @apply bg-blue-100 p-8 rounded-2xl shadow-md mb-8; }
.section-header { @apply flex items-center justify-between mb-5; }
.section-title  { @apply text-lg font-bold text-blue-600; }
.search-input   { @apply border border-blue-200 rounded-md px-3 py-1.5 text-sm outline-none w-56 bg-white focus:border-blue-400; }

.table      { @apply w-full border-collapse text-sm bg-white rounded-lg overflow-hidden; }
.thead-blue { @apply bg-blue-600 text-white; }
.thead-blue th { @apply px-4 py-3 font-semibold; }
.tr         { @apply border-b border-gray-100 hover:bg-blue-50 transition-colors; }
.tr td      { @apply px-4 py-3 text-gray-700; }
.muted      { @apply text-gray-400; }

.badge-active    { @apply bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-suspended { @apply bg-gray-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.btn-info        { @apply bg-cyan-500 text-white border-none px-3 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90; }

.status-msg       { @apply text-center py-10 text-gray-500 text-sm; }
.status-msg.error { @apply text-red-500; }

.footer { @apply bg-cyan-600 py-8 text-white text-center text-sm mt-auto; }
</style>