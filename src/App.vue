<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import NotificationBell from '@/components/notifications/NotificationBell.vue'


const auth = useAuthStore()
const router = useRouter()

async function cerrarSesion() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="w-full bg-[#1d6bbf] px-8 py-0 flex items-center justify-between shadow-md h-14">

    <!-- IZQUIERDA: Logo + Nombre -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow">
        <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="#e8f0fa" stroke="#1d6bbf" stroke-width="1.5"/>
          <path d="M12 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#1d6bbf" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="18" cy="13" r="3" fill="#1d6bbf"/>
          <path d="M10 18c1-2 2-3 3-3M26 18c-1-2-2-3-3-3" stroke="#1d6bbf" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="text-white font-bold text-base tracking-wide">
        {{ auth.isAdmin ? 'Panel Admin' : 'Veterinaria del Oriente' }}
      </span>
    </div>

    <!-- CENTRO: Links por rol -->
    <div class="flex items-center gap-1">

      <!-- ── ADMINISTRADOR ── -->
      <template v-if="auth.isAdmin">
        <router-link to="/admin/dashboard"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Inicio
        </router-link>

        <router-link to="/admin/empleados"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Usuarios
        </router-link>

        <router-link to="/admin/citas"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Citas
        </router-link>

        <!-- Servicios -->
        <router-link to="/admin/servicios"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Servicios
        </router-link>

        <!-- Perfil -->
        <router-link to="/perfil"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Perfil
          </router-link>
      </template> 
          
      <!-- ── RECEPCIONISTA ── -->
      <template v-if="auth.isRecepcionista">
        <router-link to="/recepcionista/citas"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Citas
        </router-link>

        <router-link to="/empleado/registrar-cliente"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Registrar Cliente
        </router-link>

        <!-- Atención sin Cita — próximamente -->
        <span class="text-white/35 text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none" title="Próximamente">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Atención sin Cita
        </span>

        <!-- Mascotas — próximamente -->
        <span class="text-white/35 text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none" title="Próximamente">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mascotas
        </span>

        <!-- Perfil — próximamente -->
        <span class="text-white/35 text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none" title="Próximamente">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Perfil
        </span>
      </template>

      <!-- ── VETERINARIO ── -->
      <template v-if="auth.isVeterinario">
        <router-link to="/veterinario/agenda"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mi Agenda
        </router-link>

        <router-link to="/veterinario/mascotas"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mascotas
        </router-link>

        <!-- Perfil — próximamente -->
        <span class="text-white/35 text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none" title="Próximamente">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Perfil
        </span>
      </template>

      <!-- ── CLIENTE ── -->
      <template v-if="auth.isCliente">
        <router-link to="/client/citas"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mis Citas
        </router-link>

        <router-link to="/client/mascotas"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mis Mascotas
        </router-link>

        <router-link to="/cliente/perfil"
          class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
          active-class="!text-white !bg-white/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mi Perfil
        </router-link>
      </template>

    </div>

      <!-- DERECHA -->
    <div class="flex items-center gap-4">

      <!-- Nombre · rol -->
      <span v-if="auth.user" class="text-white/80 text-sm">
        {{ auth.user.name }} · {{ auth.roleName }}
      </span>

      <NotificationBell v-if="auth.isAuthenticated" />

      <RouterLink
        v-if="!auth.isAuthenticated"
        to="/login"
        class="text-white text-sm font-medium hover:text-blue-100 transition"
      <!-- Separador vertical -->
      <div v-if="auth.isAuthenticated" class="w-px h-5 bg-white/20 mx-1"></div>

      <!-- Calendario — próximamente (sin router-link) -->
      <span
        v-if="auth.isAdmin"
        class="bg-green-500/40 text-white/50 text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none"
        title="Próximamente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Calendario
      </span>

      <!-- Cerrar sesión -->
      <button
        v-if="auth.isAuthenticated"
        @click="cerrarSesion"
        class="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg border-none cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Cerrar sesión
      </button>

      <!-- Login si no autenticado -->
      <router-link
        v-if="!auth.isAuthenticated"
        to="/login"
        class="text-white/80 hover:text-white text-sm font-medium no-underline transition"
      >
        Login
      </router-link>

    </div>

  </nav>

  <RouterView />
</template>