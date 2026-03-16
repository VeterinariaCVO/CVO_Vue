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
        <h1 class="hero-title">{{ pet?.name ?? 'Perfil de Mascota' }}</h1>
        <p class="hero-sub">Informacion completa y historial de citas.</p>
      </div>
    </div>

    <main class="container">

      <div v-if="loading" class="status-msg">Cargando...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>

      <template v-else>

        <div class="breadcrumb">
          <button @click="$router.push({ name: 'employee-clients' })" class="breadcrumb-link">Clientes</button>
          <span> / </span>
          <button @click="$router.push({ name: 'client-profile', params: { id: pet?.owner_id } })" class="breadcrumb-link">
            Perfil del Cliente
          </button>
          <span> / </span>
          <span class="breadcrumb-current">{{ pet?.name }}</span>
        </div>

        <!-- Info mascota -->
        <div class="section-box pet-header">
          <div class="pet-photo">
            <img v-if="pet?.photo_path"
              :src="`http://127.0.0.1:8000/storage/${pet.photo_path}`"
              :alt="pet.name" />
            <div v-else class="pet-icon">🐾</div>
          </div>
          <div class="pet-info">
            <h2 class="pet-name">{{ pet?.name }}</h2>
            <p class="pet-species">{{ pet?.species }}{{ pet?.breed ? ` · ${pet.breed}` : '' }}</p>
            <div class="pet-tags">
              <span class="tag">{{ pet?.sex === 'male' ? 'Macho' : 'Hembra' }}</span>
              <span v-if="pet?.age"    class="tag">{{ pet.age }} años</span>
              <span v-if="pet?.color"  class="tag">{{ pet.color }}</span>
              <span v-if="pet?.weight" class="tag">{{ pet.weight }} kg</span>
              <span :class="pet?.active ? 'badge-active' : 'badge-inactive'">
                {{ pet?.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <p v-if="pet?.special_marks" class="special-marks">
              Marcas especiales: {{ pet.special_marks }}
            </p>
          </div>
          <div class="pet-actions">
            <button @click="openEdit" class="btn-edit">Editar</button>
            <button @click="openDelete" class="btn-delete">Eliminar</button>
          </div>
        </div>

        <!-- Historial citas -->
        <div class="section-box">
          <h3 class="section-title">Historial de Citas</h3>

          <div v-if="loadingCitas" class="status-msg">Cargando citas...</div>

          <div v-else-if="citas.length === 0" class="empty-msg">
            Sin citas registradas.
          </div>

          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr class="thead-blue">
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cita in citas" :key="cita.id" class="tr">
                  <td>{{ formatDate(cita.date) }}</td>
                  <td>{{ cita.time }}</td>
                  <td>{{ cita.reason ?? '-' }}</td>
                  <td>
                    <span :class="getStatusClass(cita.status)">{{ cita.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </main>

    <div v-if="toast" class="toast-msg">{{ toast }}</div>

    <PetModal
      :open="petModal.open"
      :edit-pet="pet"
      :owner-id="pet?.owner_id ?? 0"
      @close="petModal.open = false"
      @saved="onPetSaved"
    />

    <PetDeleteModal
      :open="deleteModal.open"
      :loading="deleteModal.loading"
      :has-citas="citas.length > 0"
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
import PetModal       from '@/components/employee/PetModal.vue'
import PetDeleteModal from '@/components/employee/PetDeleteModal.vue'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const API       = 'http://127.0.0.1:8000/api'

const petId = computed(() => Number(route.params.id))

const pet          = ref<Pet | null>(null)
const citas        = ref<any[]>([])
const loading      = ref(true)
const loadingCitas = ref(false)
const error        = ref<string | null>(null)
const toast        = ref<string | null>(null)

const petModal    = ref({ open: false })
const deleteModal = ref({ open: false, loading: false })

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

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    pendiente:  'badge-pending',
    confirmada: 'badge-active',
    cancelada:  'badge-inactive',
    completada: 'badge-completed',
  }
  return map[status?.toLowerCase()] ?? 'badge-pending'
}

async function fetchPet() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${API}/pets/${petId.value}`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar mascota')
    pet.value = data.pet
    fetchCitas()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchCitas() {
  loadingCitas.value = true
  try {
    const res  = await fetch(`${API}/appointments?pet_id=${petId.value}`, { headers: getHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Error')
    citas.value = data.data ?? data.appointments ?? []
  } catch {
    citas.value = []
  } finally {
    loadingCitas.value = false
  }
}

function openEdit()   { petModal.value.open    = true }
function openDelete() { deleteModal.value.open = true }

function onPetSaved() {
  showToast('Mascota actualizada exitosamente.')
  fetchPet()
}

async function confirmDelete() {
  deleteModal.value.loading = true
  try {
    const res  = await fetch(`${API}/pets/${petId.value}`, {
      method: 'DELETE', headers: getHeaders()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Error al eliminar')
    showToast('Mascota eliminada.')
    setTimeout(() => {
      router.push({ name: 'client-profile', params: { id: pet.value?.owner_id } })
    }, 1000)
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

onMounted(() => fetchPet())
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

.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #9ca3af; margin-bottom: 20px;
}
.breadcrumb-link {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif;
}
.breadcrumb-link:hover { color: #007bff; }
.breadcrumb-current { color: #374151; font-weight: 600; }

.section-box {
  background: #e6f3ff; padding: 32px; border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1); margin-bottom: 30px;
}

.pet-header { display: flex; gap: 24px; align-items: flex-start; }
.pet-photo {
  width: 100px; height: 100px; border-radius: 12px;
  background: white; overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #b8d4f0;
}
.pet-photo img { width: 100%; height: 100%; object-fit: cover; }
.pet-icon { font-size: 40px; }

.pet-info { flex: 1; }
.pet-name { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.pet-species { font-size: 14px; color: #6b7280; margin-bottom: 12px; }
.pet-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.tag {
  background: white; color: #374151;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 999px;
  border: 1px solid #d1d5db;
}
.badge-active {
  background-color: #28a745; color: white;
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
}
.badge-inactive {
  background-color: #6b7280; color: white;
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
}
.badge-pending {
  background-color: #ffc107; color: #333;
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
}
.badge-completed {
  background-color: #17a2b8; color: white;
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
}
.special-marks { font-size: 12px; color: #6b7280; font-style: italic; }

.pet-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
.btn-edit {
  background-color: #17a2b8; color: white; border: none;
  padding: 7px 20px; border-radius: 6px; font-size: 13px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-edit:hover { opacity: 0.9; }
.btn-delete {
  background-color: #dc3545; color: white; border: none;
  padding: 7px 20px; border-radius: 6px; font-size: 13px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-delete:hover { opacity: 0.9; }

.section-title { font-size: 18px; font-weight: 700; color: #007bff; margin-bottom: 20px; }

.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; background: white; border-radius: 8px; overflow: hidden; }
.thead-blue { background-color: #007bff; color: white; }
.thead-blue th { padding: 12px 16px; font-weight: 600; }
.tr { border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.tr:hover { background-color: #f0f7ff; }
.tr td { padding: 12px 16px; color: #374151; }

.empty-msg {
  text-align: center; padding: 30px;
  color: #6b7280; font-size: 13px;
  background: white; border-radius: 10px;
  border: 1px dashed #b8d4f0;
}

.status-msg { text-align: center; padding: 60px; color: #6b7280; font-size: 13px; }
.status-msg.error { color: #ef4444; }

.toast-msg {
  position: fixed; bottom: 20px; right: 20px;
  background-color: #16a34a; color: white;
  padding: 12px 20px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;
}

.footer {
  background: #018ABE; padding: 32px;
  color: white; text-align: center; font-size: 14px;
  margin-top: auto;
}
</style>