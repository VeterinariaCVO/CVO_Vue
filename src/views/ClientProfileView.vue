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
      <h1 class="hero-title">{{ client?.name ?? 'Perfil del Cliente' }}</h1>
      <p class="hero-sub">Informacion del cliente y gestion de sus mascotas.</p>
    </div>

    <main class="container">
      <div v-if="loading" class="status-msg">Cargando...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>

      <template v-else>
        <div class="breadcrumb">
          <button @click="$router.push({ name: 'employee-clients' })" class="breadcrumb-link">Clientes</button>
          <span class="text-gray-400"> / </span>
          <span class="breadcrumb-current">{{ client?.name }}</span>
        </div>

        <div class="section-box client-section">
          <div class="client-avatar">{{ client?.name?.charAt(0) }}</div>
          <div>
            <h2 class="client-name">{{ client?.name }}</h2>
            <p class="client-email">{{ client?.email }}</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-if="client?.phone"   class="tag">{{ client.phone }}</span>
              <span v-if="client?.address" class="tag">{{ client.address }}</span>
              <span :class="client?.active ? 'badge-active' : 'badge-suspended'">
                {{ client?.active ? 'Activo' : 'Suspendido' }}
              </span>
            </div>
          </div>
        </div>

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

          <div v-else class="flex flex-col gap-3">
            <PetCard v-for="pet in pets" :key="pet.id" :pet="pet" @view="goToPetDetail" @edit="openEdit" @delete="openDelete" />
          </div>
        </div>
      </template>
    </main>

    <div v-if="toast" class="toast">{{ toast }}</div>

    <PetModal :open="petModal.open" :edit-pet="petModal.editPet" :owner-id="clientId" @close="petModal.open = false" @saved="onPetSaved" />
    <PetDeleteModal :open="deleteModal.open" :loading="deleteModal.loading" :has-citas="false" @close="deleteModal.open = false" @confirm="confirmDelete" />

    <footer class="footer"><p>&copy; 2025 Veterinaria del Oriente. Panel de Empleado.</p></footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import type { Pet } from '@/types/pet'
import PetCard        from '@/components/employee/PetCard.vue'
import PetModal       from '@/components/employee/PetModal.vue'
import PetDeleteModal from '@/components/employee/PetDeleteModal.vue'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const petStore  = usePetStore()
const { client, pets, loading, error } = storeToRefs(petStore)

const clientId    = computed(() => Number(route.params.id))
const toast       = ref<string | null>(null)
const petModal    = ref({ open: false, editPet: null as Pet | null })
const deleteModal = ref({ open: false, loading: false, pet: null as Pet | null })

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = null), 3000)
}

function openCreate()       { petModal.value = { open: true, editPet: null } }
function openEdit(p: Pet)   { petModal.value = { open: true, editPet: p } }
function openDelete(p: Pet) { deleteModal.value = { open: true, loading: false, pet: p } }
function goToPetDetail(pet: Pet) { router.push({ name: 'pet-detail', params: { id: pet.id } }) }

function onPetSaved(isEdit: boolean) {
  showToast(isEdit ? 'Mascota actualizada.' : 'Mascota registrada.')
  petStore.fetchPetsByClient(clientId.value)
}

async function confirmDelete() {
  if (!deleteModal.value.pet) return
  deleteModal.value.loading = true
  const ok = await petStore.deletePet(deleteModal.value.pet.id)
  deleteModal.value.loading = false
  if (ok) { showToast('Mascota eliminada.'); deleteModal.value.open = false }
  else showToast('Error: ' + error.value)
}

function logout() {
  authStore.clear()
  router.push({ name: 'home' })
}

onMounted(() => petStore.fetchClientWithPets(clientId.value))
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

.hero       { @apply w-full h-64 mt-[69px] flex items-center justify-center text-center text-white mb-10 flex-col; background: linear-gradient(rgba(0,123,255,0.7), rgba(0,123,255,0.7)), url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200') center/cover; border-radius: 0 0 50% 50% / 0 0 10% 10%; }
.hero-title { @apply text-4xl font-bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.hero-sub   { @apply text-sm font-light mt-2; }

.container  { @apply max-w-5xl mx-auto px-6 pb-16 flex-1; }

.breadcrumb      { @apply flex items-center gap-1.5 text-sm text-gray-400 mb-5; }
.breadcrumb-link { @apply bg-transparent border-none text-gray-400 cursor-pointer text-sm hover:text-blue-500; }
.breadcrumb-current { @apply text-gray-700 font-semibold; }

.section-box    { @apply bg-blue-100 p-8 rounded-2xl shadow-md mb-8; }
.client-section { @apply flex items-center gap-6; }
.client-avatar  { @apply w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0; }
.client-name    { @apply text-xl font-bold text-gray-800; }
.client-email   { @apply text-sm text-gray-500 my-1; }
.tag            { @apply bg-white text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200; }
.badge-active   { @apply bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }
.badge-suspended { @apply bg-gray-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full; }

.section-header { @apply flex items-center justify-between mb-5; }
.section-title  { @apply text-lg font-bold text-blue-600 flex items-center gap-2; }
.count-badge    { @apply bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200; }
.btn-success    { @apply bg-green-500 text-white border-none px-4 py-2 rounded-md font-semibold text-sm cursor-pointer hover:opacity-90; }
.empty-msg      { @apply text-center py-10 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-blue-200; }

.status-msg       { @apply text-center py-16 text-gray-500 text-sm; }
.status-msg.error { @apply text-red-500; }

.toast  { @apply fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-lg z-50; }
.footer { @apply bg-cyan-600 py-8 text-white text-center text-sm mt-auto; }
</style>