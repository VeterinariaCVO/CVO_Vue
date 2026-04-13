<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const open = ref(false)
const store = useNotificationStore()

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

async function handleClickNotification(n: any) {
  if (!n.read) {
    await store.markAsRead(n.id)
  }
}

async function deleteNotif(id: string) {
  await store.remove(id)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.notif-wrapper')) {
    close()
  }
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
  <div class="relative notif-wrapper">
    <!-- 🔔 ICONO NAV (SVG PRO) -->
    <button
      @click="toggle"
      class="relative p-2 rounded-lg hover:bg-white/15 transition"
    >
      <svg
        class="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
        />
      </svg>

      <!-- BADGE -->
      <span
        v-if="store.unreadCount"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full"
      >
        {{ store.unreadCount }}
      </span>
    </button>

    <!-- DROPDOWN -->
    <div
      v-if="open"
      class="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
    >
      <!-- HEADER -->
      <div class="flex justify-between items-center px-4 py-3 bg-[#1d6bbf] text-white">
        <span class="font-semibold text-sm">Notificaciones</span>

        <button
          @click="store.markAllAsRead"
          class="text-xs text-white/80 hover:text-white"
        >
          Marcar todas
        </button>
      </div>

      <!-- LISTA -->
      <div class="max-h-96 overflow-y-auto">
        <div
          v-for="n in store.notifications"
          :key="n.id"
          @click="handleClickNotification(n)"
          class="group flex gap-3 px-4 py-3 border-b cursor-pointer transition hover:bg-gray-100"
          :class="!n.read ? 'bg-blue-50' : ''"
        >
          <!-- ICONO TIPO (SIN EMOJIS) -->
          <div class="mt-1 text-gray-500">
            <svg
              v-if="n.type?.includes('Reminder')"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 8v4l3 3" stroke-linecap="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>

            <svg
              v-else-if="n.type?.includes('Created')"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>

            <svg
              v-else-if="n.type?.includes('Cancelled')"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>

            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            </svg>
          </div>

          <!-- CONTENIDO -->
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-800">
              {{ n.title }}
            </p>

            <p class="text-xs text-gray-500">
              {{ n.message }}
            </p>

            <p class="text-[10px] text-gray-400 mt-1">
              {{ new Date(n.created_at).toLocaleString() }}
            </p>
          </div>

          <!-- DELETE (X PRO) -->
          <button
            @click.stop="deleteNotif(n.id)"
            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- EMPTY -->
        <div
          v-if="store.notifications.length === 0"
          class="text-center text-gray-400 py-10 text-sm"
        >
          No hay notificaciones
        </div>
      </div>
    </div>
  </div>
</template>
