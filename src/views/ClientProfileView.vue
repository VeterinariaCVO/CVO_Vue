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
        <h1 class="hero-title">{{ client?.name ?? 'Perfil del Cliente' }}</h1>
        <p class="hero-sub">Informacion del cliente y gestion de sus mascotas.</p>
      </div>
    </div>

    <main class="container">
      <div v-if="loading" class="status-msg">Cargando...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>

      <template v-else>
        <div class="breadcrumb">
          <button @click="$router.push({ name: 'employee-clients' })" class="breadcrumb-link">
            Clientes
          </button>
          <span> / </span>
          <span class="breadcrumb-current">{{ client?.name }}</span>
        </div>

        <!-- Info cliente -->
        <div class="section-box client-section">
          <div class="client-avatar">{{ client?.name?.charAt(0) }}</div>
          <div class="client-info">
            <h2 class="client-name">{{ client?.name }}</h2>
            <p class="client-email">{{ client?.email }}</p>
            <div class="client-tags">
              <span v-if="client?.phone" class="tag">{{ client.phone }}</span>
              <span v-if="client?.address" class="tag">{{ client.address }}</span>
              <span :class="client?.active ? 'badge-active' : 'badge-suspended'">
                {{ client?.active ? 'Activo' : 'Suspendido' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mascotas -->
        <div class="section-box">
          <div class="section-header">
            <h3 class="section-title">
              Mascotas <span class="count-badge">{{ pets.length }}</span>
            </h3>
            <button @click="openCreate" class="btn-success">+ Agregar Mascota</button>
          </div>

          <div v-if="pets.length === 0" class="empty-msg">
            Este cliente no tiene mascotas registradas.
          </div>

          <div v-else class="pets-grid">
            <PetCard
              v-for="pet in pets"
              :key="pet.id"
              :pet="pet"
              @view="goToPetDetail"
              @edit="openEdit"
              @delete="openDelete"
            />
          </div>
        </div>
      </template>
    </main>

    <div v-if="toast" class="toast-msg">{{ toast }}</div>

    <PetModal
      :open="petModal.open"
      :edit-pet="petModal.editPet"
      :owner-id="clientId"
      @close="petModal.open = false"
      @saved="onPetSaved"
    />

    <PetDeleteModal
      :open="deleteModal.open"
      :loading="deleteModal.loading"
      :has-citas="false"
      @close="deleteModal.open = false"
      @confirm="confirmDelete"
    />

    <footer class="footer">
      <p>&copy; 2025 Veterinaria del Oriente. Panel de Empleado.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Pet } from '@/types/pet'
import type { User } from '@/types/user'
import PetCard from '@/components/employee/PetCard.vue'
import PetModal from '@/components/employee/PetModal.vue'
import PetDeleteModal from '@/components/employee/PetDeleteModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const API = 'http://127.0.0.1:8000/api'

const clientId = computed(() => Number(route.params.id))

const client = ref<User | null>(null)
const pets = ref<Pet[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const petModal = ref<{ open: boolean; editPet: Pet | null }>({ open: false, editPet: null })
const deleteModal = ref<{ open: boolean; loading: boolean; pet: Pet | null }>({
  open: false,
  loading: false,
  pet: null,
})

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json',
  }
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

async function fetchClient() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API}/empleado/clients/${clientId.value}`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Error del servidor (${res.status})`)
    }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar cliente')
    client.value = data.client
    pets.value = data.pets ?? []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchPets() {
  try {
    const res = await fetch(`${API}/pets?owner_id=${clientId.value}`, { headers: getHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Error')
    pets.value = data.pets
  } catch {
    showToast('Error al recargar mascotas')
  }
}

function openCreate() {
  petModal.value = { open: true, editPet: null }
}
function openEdit(pet: Pet) {
  petModal.value = { open: true, editPet: pet }
}
function openDelete(pet: Pet) {
  deleteModal.value = { open: true, loading: false, pet }
}
function goToPetDetail(pet: Pet) {
  router.push({ name: 'pet-detail', params: { id: pet.id } })
}

function onPetSaved(isEdit: boolean) {
  showToast(isEdit ? 'Mascota actualizada exitosamente.' : 'Mascota registrada exitosamente.')
  fetchPets()
}

async function confirmDelete() {
  if (!deleteModal.value.pet) return
  deleteModal.value.loading = true
  try {
    const res = await fetch(`${API}/pets/${deleteModal.value.pet.id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Error al eliminar')
    showToast('Mascota eliminada exitosamente.')
    deleteModal.value.open = false
    fetchPets()
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

onMounted(() => fetchClient())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page {
  min-height: 100vh;
  background: #f4f9ff;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: #3f98ff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 12px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-circle {
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #3f98ff;
  font-size: 13px;
}
.brand-name {
  color: white;
  font-weight: 700;
  font-size: 18px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  color: white;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Poppins', sans-serif;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #ffc107;
}
.btn-logout {
  background-color: #ffc107;
  color: #333;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-left: 8px;
  font-family: 'Poppins', sans-serif;
}

.hero {
  width: 100%;
  height: 250px;
  margin-top: 69px;
  background:
    linear-gradient(rgba(0, 123, 255, 0.7), rgba(0, 123, 255, 0.7)),
    url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 0 0 50% 50% / 0 0 10% 10%;
  margin-bottom: 40px;
}
.hero-title {
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.hero-sub {
  font-size: 14px;
  font-weight: 300;
  margin-top: 8px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 60px;
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 20px;
}
.breadcrumb-link {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
}
.breadcrumb-link:hover {
  color: #007bff;
}
.breadcrumb-current {
  color: #374151;
  font-weight: 600;
}

.section-box {
  background: #e6f3ff;
  padding: 32px;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.client-section {
  display: flex;
  align-items: center;
  gap: 24px;
}
.client-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #3f98ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  flex-shrink: 0;
}
.client-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
.client-email {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 10px;
}
.client-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  background: white;
  color: #374151;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
}
.badge-active {
  background-color: #28a745;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.badge-suspended {
  background-color: #6b7280;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #007bff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.count-badge {
  background: white;
  color: #007bff;
  font-size: 12px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid #b8d4f0;
}
.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}
.btn-success:hover {
  opacity: 0.9;
}

.empty-msg {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 13px;
  background: white;
  border-radius: 10px;
  border: 1px dashed #b8d4f0;
}
.pets-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-msg {
  text-align: center;
  padding: 60px;
  color: #6b7280;
  font-size: 13px;
}
.status-msg.error {
  color: #ef4444;
}

.toast-msg {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #16a34a;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.footer {
  background: #018abe;
  padding: 32px;
  color: white;
  text-align: center;
  font-size: 14px;
  margin-top: auto;
}
</style>
