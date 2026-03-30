<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function cerrarSesion() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="bg-blue-500 px-6 py-3 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-4">
      <RouterLink to="/" class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Home</RouterLink
      >

      <RouterLink
        to="/client/citas"
        v-if="auth.isCliente"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Mis Citas</RouterLink
      >
      <RouterLink
        to="/client/perfil"
        v-if="auth.isCliente"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Mi Perfil</RouterLink
      >

      <RouterLink
        to="/admin/citas"
        v-if="auth.isAdmin"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Citas</RouterLink
      >

      <RouterLink
        to="/empleado/registrar-cliente"
        v-if="auth.isVeterinario"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Registrar Cliente</RouterLink
      >
    </div>

    <div class="flex items-center gap-4">
      <span v-if="auth.user" class="text-blue-100 text-sm">
        {{ auth.user.name }} · {{ auth.roleName }}
      </span>

      <RouterLink
        v-if="!auth.isAuthenticated"
        to="/login"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Login</RouterLink
      >

      <button
        v-if="auth.isAuthenticated"
        @click="cerrarSesion"
        class="text-sm px-3 py-1.5 rounded-lg bg-white text-blue-500 font-medium hover:bg-blue-50 transition"
      >
        Cerrar sesión
      </button>

      <span class="text-white font-semibold text-sm hidden sm:block">Veterinaria del Oriente</span>
    </div>
  </nav>

  <RouterView />
</template>
