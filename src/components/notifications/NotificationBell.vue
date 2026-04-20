<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const router = useRouter()
const isOpen = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

// Cerrar el panel si presionan la tecla ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="relative font-sans italic">

    <button
      @click="togglePanel"
      class="relative p-2.5 rounded-[1rem] transition-all duration-300"
      :class="isOpen ? 'bg-[#3f98ff]/10 text-[#3f98ff]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>

      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-lg shadow-red-500/40 animate-pulse not-italic"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <div v-if="isOpen" @click="closePanel" class="fixed inset-0 z-40"></div>

    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[500px]"
      >
        <div class="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">Notificaciones</h3>
          <button
            v-if="notificationStore.unreadCount > 0"
            @click="notificationStore.markAllAsRead()"
            class="text-[9px] font-black text-[#3f98ff] uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Marcar leídas
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">

          <div v-if="notificationStore.notifications.length === 0" class="py-12 text-center">
            <div class="text-4xl mb-3 opacity-40">✨</div>
            <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Estás al día</p>
          </div>

          <div
            v-else
            v-for="noti in notificationStore.notifications.slice(0, 10)"
            :key="noti.id"
            @click="!noti.read ? notificationStore.markAsRead(noti.id) : null"
            class="p-4 rounded-[1.5rem] transition-all cursor-pointer relative group mb-1"
            :class="!noti.read ? 'bg-[#3f98ff]/5 hover:bg-[#3f98ff]/10' : 'bg-white hover:bg-slate-50'"
          >
            <div v-if="!noti.read" class="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3f98ff] rounded-full shadow-[0_0_8px_#3f98ff]"></div>

            <div class="pl-3">
              <p class="text-[10px] font-black uppercase tracking-tight leading-none mb-1 truncate transition-colors" :class="!noti.read ? 'text-slate-900' : 'text-slate-700 group-hover:text-[#3f98ff]'">
                {{ noti.title }}
              </p>
              <p class="text-[9px] font-medium leading-snug line-clamp-2" :class="!noti.read ? 'text-slate-600' : 'text-slate-400'">
                {{ noti.message }}
              </p>
              <p class="text-[8px] font-bold uppercase tracking-widest mt-2" :class="!noti.read ? 'text-[#3f98ff]/70' : 'text-slate-300'">
                {{ new Date(noti.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
              </p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-50 bg-slate-50/50 text-center">
          <button
            @click="() => { router.push('/notificaciones'); closePanel() }"
            class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-[#3f98ff] transition-colors"
          >
            Ver Historial Completo →
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
/* Animación suave al abrir el menú flotante */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  transform-origin: top right;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Scroll delgado para la campanita */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
</style>
