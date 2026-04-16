<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const open = ref(false)
const store = useNotificationStore()

function toggle() { open.value = !open.value }
function close() { open.value = false }

async function handleClickNotification(n: any) {
  if (!n.read) await store.markAsRead(n.id)
}

async function deleteNotif(id: string) {
  await store.remove(id)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.notif-wrapper')) close()
}

onMounted(() => {
  store.fetchNotifications()
  store.subscribeToChannel()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  store.unsubscribeFromChannel()
})
</script>

<template>
  <div class="relative notif-wrapper font-sans italic selection:bg-blue-100">
    <button
      @click="toggle"
      class="relative p-2.5 rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-90 group"
    >
      <svg
        class="w-6 h-6 text-white transition-transform group-hover:rotate-12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
      </svg>

      <span
        v-if="store.unreadCount"
        class="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#3f98ff] shadow-lg animate-bounce"
      >
        {{ store.unreadCount }}
      </span>
    </button>

    <transition name="pop">
      <div
        v-if="open"
        class="absolute right-0 mt-4 w-[22rem] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(63,152,255,0.3)] border border-white/60 overflow-hidden z-[110]"
      >
        <div class="px-8 py-6 bg-gradient-to-br from-[#3f98ff] to-[#1d6bbf] text-white flex justify-between items-center relative overflow-hidden">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>

          <div class="relative z-10">
            <h3 class="font-black text-xl uppercase tracking-tighter leading-none">Notis</h3>
            <p class="text-blue-100 text-[9px] font-bold tracking-[0.2em] uppercase mt-1">Veterinaria del Oriente</p>
          </div>

          <button
            @click="store.markAllAsRead"
            class="relative z-10 text-[9px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-[#3f98ff] px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm"
          >
            Leídas ✓
          </button>
        </div>

        <div class="max-h-[28rem] overflow-y-auto no-scrollbar bg-white">
          <div
            v-for="n in store.notifications"
            :key="n.id"
            @click="handleClickNotification(n)"
            class="group relative flex gap-4 px-8 py-5 border-b border-blue-50/50 cursor-pointer transition-all hover:bg-blue-50/30"
            :class="!n.read ? 'bg-blue-50/50' : ''"
          >
            <div v-if="!n.read" class="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3f98ff] rounded-full shadow-[0_0_8px_rgba(63,152,255,1)]"></div>

            <div class="mt-1 shrink-0">
              <div class="p-2.5 rounded-2xl bg-blue-50 text-[#3f98ff] group-hover:bg-[#3f98ff] group-hover:text-white transition-all duration-500 shadow-sm">
                <svg v-if="n.type?.includes('Reminder')" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3" stroke-linecap="round"/><circle cx="12" cy="12" r="9"/></svg>
                <svg v-else-if="n.type?.includes('Created')" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                <svg v-else-if="n.type?.includes('Cancelled')" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01" stroke-linecap="round"/></svg>
              </div>
            </div>

            <div class="flex-1">
              <p class="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1 group-hover:text-[#1d6bbf] transition-colors">
                {{ n.title }}
              </p>
              <p class="text-[11px] font-medium text-slate-500 leading-snug">
                {{ n.message }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  {{ new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                </p>
              </div>
            </div>

            <button
              @click.stop="deleteNotif(n.id)"
              class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="store.notifications.length === 0" class="flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
            <div class="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center text-[#3f98ff]/30 mb-4 animate-pulse">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4"/></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 italic">No hay nada nuevo por aquí</p>
          </div>
        </div>

        <div class="p-5 bg-white text-center">
           <button class="w-full py-3 rounded-2xl bg-blue-50/50 text-[9px] font-black uppercase tracking-[0.3em] text-[#3f98ff] hover:bg-[#3f98ff] hover:text-white transition-all duration-500">
             Historial Completo
           </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) reverse; }

@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
