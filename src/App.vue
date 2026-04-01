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
    <!-- IZQUIERDA -->
    <div class="flex items-center gap-4">
      <!-- CLIENTE -->
      <RouterLink
        to="/cliente/perfil"
        v-if="auth.isCliente"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Mi Perfil
      </RouterLink>

      <!-- ADMIN -->
      <RouterLink
        to="/admin/citas"
        v-if="auth.isAdmin"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Citas
      </RouterLink>

      <RouterLink
        to="/admin/empleados"
        v-if="auth.isAdmin"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Gestión Empleados
      </RouterLink>

      <!-- EMPLEADO -->
      <RouterLink
        to="/empleado/registrar-cliente"
        v-if="auth.isRecepcionista"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Registrar Cliente
      </RouterLink>

      <RouterLink
        to="/recepcionista/citas"
        v-if="auth.isRecepcionista"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
        >Citas</RouterLink>

      <!-- VETERINARIO -->
      <RouterLink
        to="/veterinario/agenda"
        v-if="auth.isVeterinario"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Mi Agenda
      </RouterLink>

      <RouterLink
        to="/veterinario/mascotas"
        v-if="auth.isVeterinario"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Mascotas
      </RouterLink>
    </div>

    <!-- DERECHA -->
    <div class="flex items-center gap-4">
      <span v-if="auth.user" class="text-blue-100 text-sm">
        {{ auth.user.name }} · {{ auth.roleName }}
      </span>

      <RouterLink
        v-if="!auth.isAuthenticated"
        to="/login"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      >
        Login
      </RouterLink>

      <button
        v-if="auth.isAuthenticated"
        @click="cerrarSesion"
        class="text-sm px-3 py-1.5 rounded-lg bg-white text-blue-500 font-medium hover:bg-blue-50 transition"
      >
        Cerrar sesión
      </button>

      <span class="text-white font-semibold text-sm hidden sm:block">
        Veterinaria del Oriente
      </span>
    </div>
  </nav>

  <RouterView />
</template>
