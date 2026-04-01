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
  <nav class="w-full bg-[#1d6bbf] px-8 py-0 flex items-center justify-between shadow-md h-14">
    <!-- Logo + Nombre -->
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow">
        <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="#e8f0fa" stroke="#1d6bbf" stroke-width="1.5"/>
          <path d="M12 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#1d6bbf" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="18" cy="13" r="3" fill="#1d6bbf"/>
          <path d="M10 18c1-2 2-3 3-3M26 18c-1-2-2-3-3-3" stroke="#1d6bbf" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="text-white font-bold text-base tracking-wide">Panel Admin</span>
    </div>

    <!-- Links -->
    <div class="flex items-center gap-1">
      <router-link
        to="/admin/dashboard"
        class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
        active-class="!text-white !bg-white/20"
      >
        <!-- Home icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Inicio
      </router-link>

      <router-link
        to="/admin/empleados"
        class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
        active-class="!text-white !bg-white/20"
      >
        <!-- Users icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Usuarios
      </router-link>

      <router-link
        to="/admin/citas"
        class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
        active-class="!text-white !bg-white/20"
      >
        <!-- Chart icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M18 20V10M12 20V4M6 20v-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Reportes
      </router-link>

      <router-link
        to="/admin/perfil"
        class="text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5"
        active-class="!text-white !bg-white/20"
      >
        <!-- User icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Perfil
      </router-link>

      <router-link
        to="/admin/calendario"
        class="ml-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors no-underline flex items-center gap-1.5"
      >
        <!-- Calendar icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Editar Calendario
      </router-link>

      <button
        @click="cerrarSesion"
        class="ml-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg border-none cursor-pointer transition-colors flex items-center gap-1.5"
      >
        <!-- Logout icon -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>