<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)

// Ajustamos la lógica para excluir la ruta raíz '/' de la Landing Page
const mostrarSidebar = computed(() => {
  return (
    auth.isAuthenticated &&
    route.path !== '/login' &&
    route.path !== '/register' &&
    route.path !== '/'
  ) // Esto asegura que la Landing se vea limpia
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// Variables de estilo para evitar errores de compilación en Tailwind
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
  <div
    class="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 overflow-hidden italic"
  >
    <aside
      v-if="mostrarSidebar"
      :class="[
        'bg-slate-900 flex flex-col sticky top-0 h-screen z-40 shrink-0 border-r border-white/5 transition-all duration-500 ease-in-out relative',
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

      <div class="p-8 mb-4 overflow-hidden">
        <div class="flex items-center gap-4 group cursor-pointer" @click="router.push('/')">
          <div
            class="bg-white p-1 rounded-lg shadow-md shrink-0 rotate-2 group-hover:rotate-0 transition-transform"
          >
            <img src="/logo.jpg" width="32" class="rounded-md" alt="Logo" />
          </div>
          <div v-if="!isCollapsed" class="transition-opacity duration-300 whitespace-nowrap">
            <h2 class="text-white text-xl font-black tracking-tighter leading-none uppercase">
              CVO
            </h2>
            <p class="text-[#3f98ff] text-[8px] font-bold uppercase tracking-[0.2em] mt-0.5">
              Oriente
            </p>
          </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 no-scrollbar">
        <template v-if="auth.isAdmin">
          <p v-if="!isCollapsed" :class="navLabel">General</p>
          <router-link
            to="/admin/dashboard"
            :class="[
              linkBase,
              route.path.startsWith('/admin/dashboard') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Inicio</span>
          </router-link>

          <p v-if="!isCollapsed" :class="navLabel">Gestión</p>
          <router-link
            to="/admin/empleados"
            :class="[
              linkBase,
              route.path.startsWith('/admin/empleados') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Usuarios</span>
          </router-link>
          <router-link
            to="/admin/mascotas"
            :class="[
              linkBase,
              route.path.startsWith('/admin/mascotas') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9" cy="4" r="1.5" fill="currentColor" />
              <circle cx="15" cy="4" r="1.5" fill="currentColor" />
            </svg>
            <span v-if="!isCollapsed">Mascotas</span>
          </router-link>
          <router-link
            to="/admin/servicios"
            :class="[
              linkBase,
              route.path.startsWith('/admin/servicios') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Servicios</span>
          </router-link>

          <p v-if="!isCollapsed" :class="navLabel">Operación</p>
          <router-link
            to="/admin/citas"
            :class="[linkBase, route.path.startsWith('/admin/citas') ? linkActive : linkInactive]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="!isCollapsed">Citas</span>
          </router-link>
          <router-link
            to="/admin/calendario"
            :class="[
              linkBase,
              route.path.startsWith('/admin/calendario') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 14h.01M12 14h.01M16 14h.01"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <rect x="3" y="4" width="18" height="18" rx="2" />
            </svg>
            <span v-if="!isCollapsed">Calendario</span>
          </router-link>
          <router-link
            to="/admin/walk-in"
            :class="[linkBase, route.path.startsWith('/admin/walk-in') ? linkActive : linkInactive]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Walk-in</span>
          </router-link>

          <p v-if="!isCollapsed" :class="navLabel">Reportes</p>
          <router-link
            to="/admin/historial"
            :class="[
              linkBase,
              route.path.startsWith('/admin/historial') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Historial</span>
          </router-link>
        </template>

        <template v-if="auth.isRecepcionista">
          <p v-if="!isCollapsed" :class="navLabel">Operación</p>
          <router-link
            to="/recepcionista/dashboard"
            :class="[
              linkBase,
              route.path.startsWith('/recepcionista/dashboard') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Inicio</span>
          </router-link>
          <router-link
            to="/recepcionista/citas"
            :class="[
              linkBase,
              route.path.startsWith('/recepcionista/citas') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="!isCollapsed">Agenda</span>
          </router-link>
          <router-link
            to="/recepcionista/clientes"
            :class="[
              linkBase,
              route.path.startsWith('/recepcionista/clientes') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Clientes</span>
          </router-link>
          <router-link
            to="/recepcionista/walk-in"
            :class="[
              linkBase,
              route.path.startsWith('/recepcionista/walk-in') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Walk-in</span>
          </router-link>
        </template>

        <template v-if="auth.isVeterinario">
          <p v-if="!isCollapsed" :class="navLabel">Mi Área</p>
          <router-link
            to="/veterinario/agenda"
            :class="[
              linkBase,
              route.path.startsWith('/veterinario/agenda') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="!isCollapsed">Mi Agenda</span>
          </router-link>
          <router-link
            to="/veterinario/mascotas"
            :class="[
              linkBase,
              route.path.startsWith('/veterinario/mascotas') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9" cy="4" r="1.5" fill="currentColor" />
              <circle cx="15" cy="4" r="1.5" fill="currentColor" />
            </svg>
            <span v-if="!isCollapsed">Pacientes</span>
          </router-link>
        </template>

        <template v-if="auth.isCliente">
          <p v-if="!isCollapsed" :class="navLabel">Mi Cuenta</p>
          <router-link
            to="/client/dashboard"
            :class="[
              linkBase,
              route.path.startsWith('/client/dashboard') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Inicio</span>
          </router-link>
          <router-link
            to="/client/citas"
            :class="[linkBase, route.path.startsWith('/client/citas') ? linkActive : linkInactive]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-if="!isCollapsed">Mis Citas</span>
          </router-link>
          <router-link
            to="/client/mascotas"
            :class="[
              linkBase,
              route.path.startsWith('/client/mascotas') ? linkActive : linkInactive,
            ]"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21c-4 0-7-3-7-7 0-2 1-3.5 3-4.5s4-1 4-1 2 0 4 1 3 2.5 3 4.5c0 4-3 7-7 7z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="!isCollapsed">Mascotas</span>
          </router-link>
        </template>

        <p v-if="!isCollapsed" :class="navLabel">Usuario</p>
        <router-link
          :to="auth.isCliente ? '/cliente/perfil' : '/perfil'"
          :class="[linkBase, route.path.includes('perfil') ? linkActive : linkInactive]"
        >
          <svg
            class="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="!isCollapsed">Mi Perfil</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-white/5 bg-slate-950/40 transition-all">
        <div
          :class="[
            'flex items-center gap-3 transition-all duration-300',
            isCollapsed ? 'justify-center' : 'mb-6 px-2',
          ]"
        >
          <div
            class="w-10 h-10 rounded-xl bg-[#3f98ff]/20 border border-[#3f98ff]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg"
          >
            <img
              v-if="auth.user?.profile_photo"
              :src="fotoPerfilUrl(auth.user.profile_photo) ?? ''"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-white font-black text-xs uppercase">{{
              auth.user?.name?.charAt(0)
            }}</span>
          </div>
          <div v-if="!isCollapsed" class="min-w-0">
            <p class="text-white text-[10px] font-black uppercase truncate leading-none italic">
              {{ auth.user?.name }}
            </p>
            <p class="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">
              {{ auth.roleName }}
            </p>
          </div>
        </div>

        <button
          v-if="!isCollapsed"
          @click="cerrarSesion"
          class="w-full py-4 rounded-[1.2rem] bg-red-500/10 text-red-500 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all duration-500 italic active:scale-95 shadow-xl border border-red-500/20"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <header
        v-if="mostrarSidebar"
        class="h-[64px] bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0"
      >
        <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">
          Panel de Gestión v2.0
        </p>
        <NotificationBell />
      </header>

      <div class="flex-1 overflow-y-auto no-scrollbar relative">
        <RouterView />
      </div>
    </main>

    <template v-if="!mostrarSidebar">
      <div class="fixed inset-0 z-[200] bg-white overflow-y-auto no-scrollbar">
        <RouterView />
      </div>
    </template>
  </div>
</template>

<style>
/* Reset Global - Usando CSS puro para evitar errores de Tailwind v4/v5 */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #f8fafc;
}

/* Ocultar barra de scroll pero mantener funcionalidad */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
