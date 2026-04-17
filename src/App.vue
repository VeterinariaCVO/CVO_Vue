<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)

const mostrarSidebar = computed(() => {
  return (
    auth.isAuthenticated &&
    route.path !== '/login' &&
    route.path !== '/register' &&
    route.path !== '/'
  )
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const linkBase =
  'flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all duration-300 group italic uppercase tracking-[0.15em] text-[10px] font-black no-underline mb-1'
const linkActive = 'bg-[#3f98ff] text-white shadow-lg shadow-blue-500/20'
const linkInactive = 'text-slate-400 hover:bg-white/5 hover:text-white'
const navLabel =
  'text-[8px] text-slate-500 px-4 mt-4 mb-2 uppercase tracking-[0.2em] font-black italic transition-opacity'

async function cerrarSesion() {
  await auth.logout()
  router.push('/login')
}

function fotoPerfilUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const storageBase = (
    (import.meta.env.VITE_STORAGE_URL as string) || 'https://natita.me/storage'
  ).replace(/\/$/, '')
  const pathLimpio = path.replace(/^\/storage\//, '').replace(/^storage\//, '')
  return `${storageBase}/${pathLimpio}`
}
</script>

<template>
  <div class="flex h-screen w-full bg-[#f8fafc] font-sans selection:bg-blue-100 italic overflow-hidden">

    <aside
      v-if="mostrarSidebar"
      :class="[
        'bg-slate-900 flex flex-col h-screen z-40 shrink-0 border-r border-white/5 transition-all duration-500 ease-in-out relative',
        isCollapsed ? 'w-24' : 'w-66',
      ]"
    >
      <button
        @click="toggleSidebar"
        class="absolute -right-3 top-10 bg-[#3f98ff] text-white rounded-full p-1 shadow-lg hover:scale-110 transition-all z-50 border-2 border-slate-900 cursor-pointer"
      >
        <svg
          :class="['w-4 h-4 transition-transform duration-500', isCollapsed ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-width="3"
            d="M15 19l-7-7 7-7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div class="p-8 mb-4 overflow-hidden shrink-0">
        <div class="flex items-center gap-4 group cursor-pointer" @click="router.push('/')">
          <div class="bg-white p-1 rounded-lg shadow-md shrink-0 rotate-2 group-hover:rotate-0 transition-transform">
            <img src="/logo.jpg" width="32" class="rounded-md" alt="Logo" />
          </div>
          <div v-if="!isCollapsed" class="transition-opacity duration-300 whitespace-nowrap">
            <h2 class="text-white text-xl font-black tracking-tighter leading-none uppercase">CVO</h2>
            <p class="text-[#3f98ff] text-[8px] font-bold uppercase tracking-[0.2em] mt-0.5">Oriente</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 no-scrollbar">
        <template v-if="auth.isAdmin">
          <p v-if="!isCollapsed" :class="navLabel">General</p>
          <router-link to="/admin/dashboard" :class="[linkBase, route.path.startsWith('/admin/dashboard') ? linkActive : linkInactive]">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="!isCollapsed">Inicio</span>
          </router-link>
          </template>

        <p v-if="!isCollapsed" :class="navLabel">Usuario</p>
        <router-link
          :to="auth.isCliente ? '/cliente/perfil' : '/perfil'"
          :class="[linkBase, route.path.includes('perfil') ? linkActive : linkInactive]"
        >
          <div class="w-4 h-4 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
            <img v-if="auth.user?.profile_photo" :src="fotoPerfilUrl(auth.user.profile_photo) ?? ''" class="w-full h-full object-cover" />
            <svg v-else fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" class="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </div>
          <span v-if="!isCollapsed">Mi Perfil</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-white/5 bg-slate-950/40 shrink-0">
        <button v-if="!isCollapsed" @click="cerrarSesion" class="w-full py-4 rounded-[1.2rem] bg-red-500/10 text-red-500 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all duration-500 italic active:scale-95 shadow-xl border border-red-500/20">
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <header v-if="mostrarSidebar" class="h-[64px] bg-white/50 backdrop-blur-md flex items-center justify-between px-10 shrink-0 border-b border-slate-200">
        <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">Panel de Gestión v2.0</p>
      </header>

      <div class="flex-1 overflow-y-auto bg-[#f8fafc] relative">
        <RouterView />
      </div>
    </main>

    <template v-if="!mostrarSidebar">
      <div class="fixed inset-0 z-[200] bg-white overflow-y-auto">
        <RouterView />
      </div>
    </template>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Evita el scroll doble en el body */
}

/* Opcional: Personalizar scrollbar para que sea sutil */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
