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
      <h1 class="hero-title">{{ pet?.name ?? 'Perfil de Mascota' }}</h1>
      <p class="hero-sub">Informacion completa y historial de citas.</p>
    </div>

    <main class="container">
      <div v-if="loading" class="status-msg">Cargando...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>

      <template v-else>
        <div class="breadcrumb">
          <button @click="$router.push({ name: 'employee-clients' })" class="breadcrumb-link">Clientes</button>
          <span class="text-gray-400"> / </span>
          <button @click="$router.push({ name: 'client-profile', params: { id: pet?.owner_id } })" class="breadcrumb-link">Perfil del Cliente</button>
          <span class="text-gray-400"> / </span>
          <span class="breadcrumb-current">{{ pet?.name }}</span>
        </div>

        <div class="section-box pet-header">
          <div class="pet-photo">
            <img v-if="pet?.photo_path" :src="`http://127.0.0.1:8000/storage/${pet.photo_path}`" :alt="pet.name" class="w-full h-full object-cover" />
            <div v-else class="text-4xl">🐾</div>
          </div>
          <div class="flex-1">
            <h2 class="pet-name">{{ pet?.name }}</h2>
            <p class="pet-species">{{ pet?.species }}{{ pet?.breed ? ` · ${pet.breed}` : '' }}</p>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <span class="tag">{{ pet?.sex === 'male' ? 'Macho' : 'Hembra' }}</span>
              <span v-if="pet?.age"    class="tag">{{ pet.age }} años</span>
              <span v-if="pet?.color"  class="tag">{{ pet.color }}</span>
              <span v-if="pet?.weight" class="tag">{{ pet.weight }} kg</span>
              <span :class="pet?.active ? 'badge-active' : 'badge-inactive'">{{ pet?.active ? 'Activo' : 'Inactivo' }}</span>
            </div>
            <p v-if="pet?.special_marks" class="text-xs text-gray-400 italic">Marcas especiales: {{ pet.special_marks }}</p>
          </div>
          <div class="flex flex-col gap-2 flex-shrink-0">
            <button @click="openEdit"   class="btn-edit">Editar</button>
            <button @click="openDelete" class="btn-delete">Eliminar</button>
          </div>
        </div>

        <div class="section-box">
          <h3 class="section-title">Historial de Citas</h3>
          <div v-if="loadingCitas" class="status-msg">Cargando citas...</div>
          <div v-else-if="citas.length === 0" class="empty-msg">Sin citas registradas.</div>
          <div v-else class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr class="thead-blue">
                  <th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cita in citas" :key="cita.id" class="tr">
                  <td>{{ formatDate(cita.date) }}</td>
                  <td>{{ cita.time }}</td>
                  <td>{{ cita.reason ?? '-' }}</td>
                  <td><span :class="getStatusClass(cita.status)">{{ cita.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </main>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <PetModal :open="petModal.open" :edit-pet="pet" :owner-id="pet?.owner_id ?? 0" @close="petModal.open = false" @saved="onPetSaved" />
    <PetDeleteModal :open="deleteModal.open" :loading="deleteModal.loading" :has-citas="citas.length > 0" @close="deleteModal.open = false" @confirm="confirmDelete" />

    <footer class="footer"><p>&copy; 2025 Veterinaria del Oriente. Panel de Empleado.</p></footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import PetModal       from '@/components/employee/PetModal.vue'
import PetDeleteModal from '@/components/employee/PetDeleteModal.vue'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const petStore  = usePetStore()
const { pet, citas, loading, error } = storeToRefs(petStore)

const petId        = computed(() => Number(route.params.id))
const loadingCitas = ref(false)
const toast        = ref<string | null>(null)
const petModal     = ref({ open: false })
const deleteModal  = ref({ open: false, loading: false })

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
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

function openEdit()   { petModal.value.open   = true }
function openDelete() { deleteModal.value.open = true }

function onPetSaved() {
  showToast('Mascota actualizada.')
  petStore.fetchPet(petId.value)
}

async function confirmDelete() {
  deleteModal.value.loading = true
  const ok = await petStore.deletePet(petId.value)
  deleteModal.value.loading = false
  if (ok) {
    showToast('Mascota eliminada.')
    setTimeout(() => router.push({ name: 'client-profile', params: { id: pet.value?.owner_id } }), 1000)
  } else showToast('Error: ' + error.value)
}

function logout() {
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(async () => {
  await petStore.fetchPet(petId.value)
  await petStore.fetchCitas(petId.value)
})
</script>

<style scoped>

.page    { @apply min-h-screen bg-blue-50 flex flex-col; }

.navbar       { @apply fixed top-0 w-full z-50 bg-blue-500 shadow-md px-8 py-3 flex items-center justify-between; }
.navbar-brand { @apply flex items-center gap-2.5; }
.logo         { @apply w-11 h-11 bg-white rounded-full flex items-center justify-center font-bold text-blue-500 text-sm; }
.brand        { @apply text-white font-bold text-lg; }
.nav-links    { @apply flex items-center gap-2; }
.nav-link     { @apply text-white bg-transparent border-none text-sm font-medium cursor-pointer px-3 py-1.5 rounded hover:text-yellow-300; }
.btn-logout   { @apply bg-yellow-400 text-gray-800 border-none px-4 py-1.5 rounded-md font-semibold text-sm cursor-pointer ml-2 hover:bg-yellow-500; }

.hero       { @apply w-full h-64 mt-[69px] flex flex-col items-center justify-center text-center text-white mb-10; background: linear-gradient(rgba(0,123,255,0.7), rgba(0,123,255,0.7)), url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200') center/cover; border-radius: 0 0 50% 50% / 0 0 10% 10%; }
.hero-title { @apply text-4xl font-bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.hero-sub   { @apply text-sm font-light mt-2; }

.container  { @apply max-w-5xl mx-auto px-6 pb-16 flex-1; }

.breadcrumb         { @apply flex items-center gap-1.5 text-sm text-gray-400 mb-5; }
.breadcrumb-link    { @apply bg-transparent border-none text-gray-400 cursor-pointer text-sm hover:text-blue-500; }
.breadcrumb-current { @apply text-gray-700 font-semibold; }

.section-box { @apply bg-blue-100 p-8 rounded-2xl shadow-md mb-8; }
.pet-header  { @apply flex gap-6 items-start; }
.pet-photo   { @apply w-24 h-24 rounded-xl bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-blue-200; }
.pet-name    { @apply text-2xl font-bold text-gray-800 mb-1; }
.pet-species { @apply text-sm text-gray-500 mb-3; }
.tag         { @apply bg-white text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200; }
.badge-active    { @apply bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-inactive  { @apply bg-gray-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-pending   { @apply bg-yellow-400 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-completed { @apply bg-cyan-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.btn-edit   { @apply bg-cyan-500 text-white border-none px-5 py-1.5 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90; }
.btn-delete { @apply bg-red-500 text-white border-none px-5 py-1.5 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90; }

.section-title { @apply text-lg font-bold text-blue-600 mb-5; }
.table         { @apply w-full border-collapse text-sm bg-white rounded-lg overflow-hidden; }
.thead-blue    { @apply bg-blue-600 text-white; }
.thead-blue th { @apply px-4 py-3 font-semibold; }
.tr            { @apply border-b border-gray-100 hover:bg-blue-50 transition-colors; }
.tr td         { @apply px-4 py-3 text-gray-700; }
.empty-msg     { @apply text-center py-8 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-blue-200; }

.status-msg       { @apply text-center py-16 text-gray-500 text-sm; }
.status-msg.error { @apply text-red-500; }
.toast  { @apply fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-lg z-50; }
.footer { @apply bg-cyan-600 py-8 text-white text-center text-sm mt-auto; }
</style>