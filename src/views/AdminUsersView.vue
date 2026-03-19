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
        <button @click="logout" class="btn-red">Cerrar sesion</button>
      </div>
    </nav>

    <div class="content">
      <h4 class="welcome">Bienvenido, {{ authStore.user?.name ?? 'Admin User' }}</h4>

      <div class="card">
        <div class="card-header">
          <h5 class="card-title">Gestion de Usuarios</h5>
          <button @click="openCreate" class="btn-create">+ Crear Nuevo Usuario</button>
        </div>

        <UserTabs
          :model-value="activeTab"
          :counts="tabCounts"
          @change="activeTab = $event"
        />

        <UserTable
          :users="filteredUsers"
          :loading="loading"
          :error="error"
          @edit="openEdit"
          @toggle="toggleActive"
        />
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <UserModal
      :open="modal.open"
      :edit-user="modal.editUser"
      @close="modal.open = false"
      @saved="onSaved"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'
import UserTabs  from '@/components/admin/UserTabs.vue'
import UserTable from '@/components/admin/UserTable.vue'
import UserModal from '@/components/admin/UserModal.vue'

const router    = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const { users, loading, error } = storeToRefs(userStore)

const toast     = ref<string | null>(null)
const activeTab = ref('todos')
const modal     = ref({ open: false, editUser: null as User | null })

const filteredUsers = computed(() => {
  if (activeTab.value === 'todos') return users.value
  return users.value.filter(u => u.role === activeTab.value)
})

const tabCounts = computed(() => ({
  todos:      users.value.length,
  Trabajador: users.value.filter(u => u.role === 'Trabajador').length,
  Cliente:    users.value.filter(u => u.role === 'Cliente').length,
}))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

function openCreate()      { modal.value = { open: true, editUser: null } }
function openEdit(u: User) { modal.value = { open: true, editUser: u } }

function onSaved(isEdit: boolean) {
  showToast(isEdit ? 'Usuario actualizado.' : 'Usuario registrado.')
  userStore.fetchUsers()
}

async function toggleActive(user: User) {
  const ok = await userStore.toggleActive(user)
  showToast(ok ? (user.active ? 'Usuario activado.' : 'Usuario suspendido.') : 'Error: ' + error.value)
}

function logout() {
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => {
  userStore.fetchUsers()
  const msg = sessionStorage.getItem('toast')
  if (msg) { showToast(msg); sessionStorage.removeItem('toast') }
})
</script>

<style scoped>

.page { @apply min-h-screen w-full bg-blue-50; }

.navbar { @apply bg-blue-500 px-8 py-2.5 flex items-center justify-between shadow-md w-full; }
.navbar-left { @apply flex items-center gap-3; }
.logo { @apply w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-500 text-sm; }
.brand { @apply text-white font-bold text-lg; }
.navbar-right { @apply flex items-center gap-1; }
.nav-btn { @apply text-white bg-transparent border-none px-3 py-1.5 rounded-md cursor-pointer text-sm hover:bg-white/20 font-sans; }
.btn-green { @apply bg-green-500 text-white border-none px-3 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-2; }
.btn-red { @apply bg-red-500 text-white border-none px-3 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-1; }

.content { @apply p-8; }
.welcome { @apply text-xl font-bold text-gray-800 mb-6; }

.card { @apply bg-white rounded-xl shadow-sm w-full overflow-x-auto; }
.card-header { @apply flex items-center justify-between px-5 pt-5; }
.card-title { @apply text-lg font-bold text-blue-600; }
.btn-create { @apply bg-green-500 text-white border-none px-4 py-2 rounded-md font-semibold text-sm cursor-pointer hover:opacity-90; }

.toast { @apply fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-lg z-50; }
</style>