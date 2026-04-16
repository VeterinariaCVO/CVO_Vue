<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const auth   = useAuthStore()
const router = useRouter()
const route = useRoute()

const linkBase = "text-white/70 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-2 rounded-xl transition-all no-underline whitespace-nowrap flex items-center gap-1.5"
const linkActive = "!text-white bg-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"

async function cerrarSesion() {
  await auth.logout()
  router.push('/login')
}

function fotoPerfilUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) {
    return path.replace('api.natita.me/storage/', 'natita.me/storage/')
  }
  const storageBase = (import.meta.env.VITE_STORAGE_URL as string).replace(/\/$/, '')
  const pathLimpio = path.replace(/^\/storage\//, '').replace(/^storage\//, '')
  return `${storageBase}/${pathLimpio}`
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-[100] bg-[#3f98ff] h-[64px] px-6 md:px-12 flex items-center justify-between shadow-lg border-b border-white/10 italic">

    <!-- LOGO -->
    <div class="flex items-center gap-3 shrink-0 cursor-pointer group" @click="router.push('/')">
      <div
        class="bg-white p-1 rounded-lg shadow-md rotate-2 group-hover:rotate-0 transition-transform duration-300"
      >
        <img src="/logo.jpg" width="32" class="rounded-md" alt="Logo" />
      </div>
      <div class="hidden sm:block leading-none">
        <h3 class="text-white font-black text-xl tracking-tighter uppercase">
          {{ auth.isAdmin ? 'Panel Admin' : 'Veterinaria' }}
        </h3>
        <p
          v-if="!auth.isAdmin"
          class="text-blue-100 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5"
        >
          Del Oriente
        </p>
      </div>
    </div>

    <!-- LINKS -->
    <div class="flex items-center gap-0.5 overflow-x-auto no-scrollbar mx-4">

      <!-- ADMIN -->
      <template v-if="auth.isAdmin">
        <router-link to="/admin/dashboard" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Inicio
        </router-link>
        <router-link to="/admin/empleados" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Usuarios
        </router-link>
        <router-link to="/admin/mascotas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/><circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/><circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mascotas
        </router-link>
        <router-link to="/admin/citas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Citas
        </router-link>
        <router-link to="/admin/servicios" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Servicios
        </router-link>
        <router-link to="/admin/calendario" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Calendario
        </router-link>
        <router-link to="/admin/historial" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Historial
        </router-link>
        <router-link to="/admin/walk-in" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Walk-in
        </router-link>
        <router-link to="/perfil" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Perfil
        </router-link>
      </template>

      <!-- RECEPCIONISTA -->
      <template v-if="auth.isRecepcionista">
        <router-link to="/recepcionista/dashboard" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Inicio
        </router-link>
        <router-link to="/recepcionista/citas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Citas
        </router-link>
        <router-link to="/recepcionista/clientes" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Clientes
        </router-link>
        <router-link to="/recepcionista/walk-in" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Walk-in
        </router-link>
      </template>

      <!-- VETERINARIO -->
      <template v-if="auth.isVeterinario">
        <router-link to="/veterinario/agenda" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mi Agenda
        </router-link>
        <router-link to="/veterinario/mascotas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/><circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/><circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mascotas
        </router-link>
      </template>

      <!-- CLIENTE -->
      <template v-if="auth.isCliente">
        <router-link to="/client/dashboard" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Inicio
        </router-link>
        <router-link to="/client/citas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mis Citas
        </router-link>
        <router-link to="/client/mascotas" :class="linkBase" :active-class="linkActive">
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="9" cy="4" r="1.5" fill="currentColor"/><circle cx="15" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="5" cy="8" r="1.5" fill="currentColor"/><circle cx="19" cy="8" r="1.5" fill="currentColor"/>
            <path d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mis Mascotas
        </router-link>
        <router-link to="/cliente/perfil" :class="linkBase" :active-class="linkActive">
          <img
            v-if="auth.user?.profile_photo"
            :src="fotoPerfilUrl(auth.user.profile_photo) ?? ''"
            class="w-4 h-4 rounded-full object-cover border border-white/30"
          />
          <svg v-else class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mi Perfil
        </router-link>
      </template>
    </div>

    <!-- DERECHA -->
    <div class="flex items-center gap-3 shrink-0">
      <div v-if="auth.isAuthenticated" class="hidden lg:flex flex-col items-end leading-none gap-1 mr-1">
        <span class="text-white font-black text-xs uppercase tracking-tighter">{{ auth.user?.name }}</span>
        <span class="text-blue-100 text-[9px] font-black uppercase tracking-widest">{{ auth.roleName }}</span>
      </div>

      <div class="flex items-center gap-2">
        <NotificationBell
          v-if="auth.isAuthenticated"
          class="text-white hover:scale-110 transition-transform"
        />

        <router-link
          v-if="auth.isAuthenticated"
          :to="auth.isCliente ? '/cliente/perfil' : '/perfil'"
          class="group"
        >
          <div class="w-9 h-9 rounded-xl border-2 border-white/20 overflow-hidden group-hover:border-white transition-all shadow-lg bg-blue-400/30 flex items-center justify-center">
            <img v-if="auth.user?.profile_photo" :src="fotoPerfilUrl(auth.user.profile_photo) ?? ''" class="w-full h-full object-cover" />
            <span v-else class="text-white font-black text-xs uppercase">{{ auth.user?.name?.charAt(0) }}</span>
          </div>
        </router-link>

        <button
          v-if="auth.isAuthenticated"
          @click="cerrarSesion"
          class="bg-red-500/10 hover:bg-red-500 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all border border-white/10 cursor-pointer"
        >
          Salir
        </button>
        <router-link
          v-if="!auth.isAuthenticated && (route.path === '/login' || route.path === '/register')"
          to="/"
          class="text-white font-black text-[10px] uppercase tracking-[0.15em] hover:text-blue-200 transition no-underline"
        >
          Inicio
        </router-link>

        <router-link
          v-if="!auth.isAuthenticated && route.path !== '/login' && route.path !== '/register'"
          to="/login"
          class="text-white font-black text-[10px] uppercase tracking-[0.15em] hover:text-blue-200 transition no-underline"
        >
          Login
        </router-link>
      </div>
    </div>
  </nav>

  <div class="h-[64px] w-full"></div>

  <RouterView />
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
