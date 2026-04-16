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

function formatTime(value?: string): string {
  if (!value) return ''
  const date = new Date(value.replace(' ', 'T'))
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  <div class="relative notif-wrapper font-sans italic">
    <button
      @click="toggle"
      class="relative p-2 rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-90 group"
    >
      <svg class="w-5 h-5 text-white transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
      </svg>

      <span v-if="store.unreadCount" class="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-[#3f98ff] shadow-sm animate-bounce">
        {{ store.unreadCount }}
      </span>
    </button>

    <transition name="pop">
      <div
        v-if="open"
        class="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden z-[110]"
      >
        <div class="px-6 py-4 bg-gradient-to-br from-[#3f98ff] to-[#1d6bbf] text-white flex justify-between items-center relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="font-black text-base uppercase tracking-tighter leading-none">Notis</h3>
            <p class="text-blue-100 text-[8px] font-bold tracking-[0.2em] uppercase mt-0.5">Sistema CVO</p>
          </div>

          <button
            @click="store.markAllAsRead"
            class="relative z-10 text-[8px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-[#3f98ff] px-2.5 py-1 rounded-full transition-all duration-300"
          >
            Leídas ✓
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto no-scrollbar bg-white">
          <div
            v-for="n in store.notifications"
            :key="n.id"
            @click="handleClickNotification(n)"
            class="group relative flex gap-3 px-6 py-3.5 border-b border-blue-50/50 cursor-pointer transition-all hover:bg-blue-50/20"
            :class="!n.read ? 'bg-blue-50/30' : ''"
          >
            <div v-if="!n.read" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#3f98ff] rounded-full shadow-[0_0_5px_rgba(63,152,255,1)]"></div>

            <div class="mt-0.5 shrink-0">
              <div class="p-1.5 rounded-lg bg-blue-50 text-[#3f98ff] group-hover:bg-[#3f98ff] group-hover:text-white transition-all duration-300">
                <svg v-if="n.type?.includes('Reminder')" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3" stroke-linecap="round"/><circle cx="12" cy="12" r="9"/></svg>
                <svg v-else-if="n.type?.includes('Created')" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                <svg v-else-if="n.type?.includes('Cancelled')" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01" stroke-linecap="round"/></svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1 group-hover:text-[#1d6bbf] transition-colors truncate">
                {{ n.title }}
              </p>
              <p class="text-[10px] font-medium text-slate-500 leading-tight">
                {{ n.message }}
              </p>
              <!-- ✅ Reemplazado: ya no lanza INVALID DATE -->
              <p class="text-[8px] font-bold text-slate-300 uppercase mt-1">
                {{ formatTime(n.created_at) }}
              </p>
            </div>

            <button
              @click.stop="deleteNotif(n.id)"
              class="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="store.notifications.length === 0" class="py-10 text-center">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Sin notificaciones</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.pop-enter-active { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) reverse; }
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.95) translateY(-5px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
