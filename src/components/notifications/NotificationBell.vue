<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'


const open = ref(false)
const store = useNotificationStore()

onMounted(() => {
  store.fetchNotifications()
  store.subscribeToChannel()
})

function toggle() {
  open.value = !open.value
}

function getIcon(type: string) {
  if (type.includes('Reminder')) return '⏰'
  if (type.includes('Created')) return '📅'
  if (type.includes('Cancelled')) return '❌'
  return '🔔'
}
</script>

<template>
  <div class="relative">
    <!-- 🔔 BOTÓN -->
    <button @click="toggle" class="relative text-white hover:scale-110 transition">
      🔔

      <!-- 🔴 BADGE -->
      <span
        v-if="store.unreadCount"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full"
      >
        {{ store.unreadCount }}
      </span>
    </button>

    <!-- 📦 DROPDOWN -->
    <div
      v-if="open"
      class="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
    >
      <!-- HEADER -->
      <div class="flex justify-between items-center px-4 py-2 border-b">
        <span class="font-semibold text-gray-700">Notificaciones</span>
        <button
          @click="store.markAllAsRead"
          class="text-xs text-blue-500 hover:underline"
        >
          Marcar todas
        </button>
      </div>

      <!-- LISTA -->
      <div class="max-h-80 overflow-y-auto">
        <div
          v-for="n in store.notifications"
          :key="n.id"
          class="px-4 py-3 border-b cursor-pointer hover:bg-gray-100 transition flex gap-2"
          :class="{ 'bg-blue-50': !n.read }"
        >
          <!-- ICONO -->
          <div class="text-lg">
            {{ getIcon(n.type) }}
          </div>

          <!-- TEXTO -->
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">
              {{ n.title }}
            </p>
            <p class="text-xs text-gray-500">
              {{ n.message }}
            </p>
            <p class="text-[10px] text-gray-400 mt-1">
              {{ new Date(n.created_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- VACÍO -->
        <div
          v-if="store.notifications.length === 0"
          class="text-center text-gray-400 py-6 text-sm"
        >
          No hay notificaciones
        </div>
      </div>
    </div>
  </div>
</template>
