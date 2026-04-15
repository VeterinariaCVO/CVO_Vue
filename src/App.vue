<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const auth = useAuthStore()
const router = useRouter()

// 👇 CLASES DE TAILWIND GUARDADAS EN VARIABLES PARA EVITAR EL ERROR @apply 👇
const linkBase = "text-white/70 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl transition-all no-underline whitespace-nowrap"
const linkActive = "!text-white bg-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"

async function cerrarSesion() {
  await auth.logout()
  router.push('/login')
}

function fotoPerfilUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = (import.meta.env.VITE_API_URL as string).replace('/api', '')
  if (path.startsWith('/storage/')) return `${base}${path}`
  return `${base}/storage/${path}`
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-[100] bg-[#3f98ff] h-[64px] px-6 md:px-12 flex items-center justify-between shadow-lg border-b border-white/10 italic">

    <div class="flex items-center gap-3 shrink-0 cursor-pointer group" @click="router.push('/')">
      <div class="bg-white p-1 rounded-lg shadow-md rotate-2 group-hover:rotate-0 transition-transform duration-300">
        <img src="/logo.jpg" width="32" class="rounded-md" alt="Logo" />
      </div>
      <div class="hidden sm:block leading-none">
        <h3 class="text-white font-black text-xl tracking-tighter uppercase">
          {{ auth.isAdmin ? 'Panel Admin' : 'Veterinaria' }}
        </h3>
        <p v-if="!auth.isAdmin" class="text-blue-100 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
          Del Oriente
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1 overflow-x-auto no-scrollbar mx-4">

      <template v-if="auth.isAdmin">
        <router-link to="/admin/dashboard" :class="linkBase" :active-class="linkActive">Dashboard</router-link>
        <router-link to="/admin/empleados" :class="linkBase" :active-class="linkActive">Usuarios</router-link>
        <router-link to="/admin/mascotas" :class="linkBase" :active-class="linkActive">Mascotas</router-link>
        <router-link to="/admin/citas" :class="linkBase" :active-class="linkActive">Citas</router-link>
      </template>

      <template v-if="auth.isRecepcionista">
        <router-link to="/recepcionista/dashboard" :class="linkBase" :active-class="linkActive">Inicio</router-link>
        <router-link to="/recepcionista/citas" :class="linkBase" :active-class="linkActive">Citas</router-link>
        <router-link to="/recepcionista/clientes" :class="linkBase" :active-class="linkActive">Clientes</router-link>
      </template>

      <template v-if="auth.isVeterinario">
        <router-link to="/veterinario/agenda" :class="linkBase" :active-class="linkActive">Agenda</router-link>
        <router-link to="/veterinario/mascotas" :class="linkBase" :active-class="linkActive">Pacientes</router-link>
      </template>

      <template v-if="auth.isCliente">
        <router-link to="/client/dashboard" :class="linkBase" :active-class="linkActive">Inicio</router-link>
        <router-link to="/client/citas" :class="linkBase" :active-class="linkActive">Mis Citas</router-link>
        <router-link to="/client/mascotas" :class="linkBase" :active-class="linkActive">Mascotas</router-link>
      </template>
    </div>

    <div class="flex items-center gap-3 shrink-0">

      <div v-if="auth.isAuthenticated" class="hidden lg:flex flex-col items-end leading-none gap-1 mr-2">
        <span class="text-white font-black text-xs uppercase tracking-tighter">{{ auth.user?.name }}</span>
        <span class="text-blue-200 text-[9px] font-black uppercase tracking-widest">{{ auth.roleName }}</span>
      </div>

      <div class="flex items-center gap-2">
        <NotificationBell v-if="auth.isAuthenticated" class="text-white hover:scale-110 transition-transform" />

        <router-link v-if="auth.isAuthenticated" :to="auth.isCliente ? '/cliente/perfil' : '/perfil'" class="group">
          <div class="w-9 h-9 rounded-xl border-2 border-white/20 overflow-hidden group-hover:border-white transition-all shadow-lg bg-blue-400/30 flex items-center justify-center">
            <img v-if="auth.user?.profile_photo" :src="fotoPerfilUrl(auth.user.profile_photo) ?? ''" class="w-full h-full object-cover" />
            <span v-else class="text-white font-black text-xs uppercase">{{ auth.user?.name?.charAt(0) }}</span>
          </div>
        </router-link>

        <button
          v-if="auth.isAuthenticated"
          @click="cerrarSesion"
          class="bg-red-500/10 hover:bg-red-500 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all border border-white/10"
        >
          Salir
        </button>


  <router-link
    to="/"
    class="text-white font-black text-[10px] uppercase px-3 py-2 hover:text-blue-200 transition"
  >
    Inicio
  </router-link>
</div>
    </div>
  </nav>

  <div class="h-[64px] w-full"></div>

  <RouterView />
</template>

<style scoped>
/* Solo dejamos el css normal para ocultar la barra de scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
