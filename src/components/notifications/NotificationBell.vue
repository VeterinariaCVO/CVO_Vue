<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const store   = useNotificationStore()
const open    = ref(false)
const bellRef = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }

function handleClickOutside(e: MouseEvent) {
    if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
        open.value = false
    }
}

onMounted(() => {
    store.fetchNotifications()
    store.subscribeToChannel()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    store.unsubscribeFromChannel()
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="relative" ref="bellRef">
        <button @click="toggle" class="relative p-2 rounded-full hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="store.unreadCount > 0"
                class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
            </span>
        </button>

        <div v-if="open"
            class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span class="font-semibold text-gray-700">Notificaciones</span>
                <button v-if="store.unreadCount > 0"
                    @click="store.markAllAsRead()"
                    class="text-xs text-blue-500 hover:underline">
                    Marcar todas como leídas
                </button>
            </div>

            <ul class="max-h-80 overflow-y-auto divide-y divide-gray-50">
                <li v-if="store.loading"
                    class="px-4 py-6 text-center text-sm text-gray-400">
                    Cargando...
                </li>
                <li v-else-if="store.notifications.length === 0"
                    class="px-4 py-6 text-center text-sm text-gray-400">
                    No tienes notificaciones
                </li>
                <li v-for="n in store.notifications" :key="n.id"
                    class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    :class="{ 'bg-blue-50': !n.read }">
                    <span class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                        :class="n.read ? 'bg-transparent' : 'bg-blue-500'" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate">{{ n.title }}</p>
                        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                        <p class="text-[10px] text-gray-400 mt-1">{{ n.created_at }}</p>
                    </div>
                    <div class="flex flex-col gap-1 flex-shrink-0">
                        <button v-if="!n.read" @click="store.markAsRead(n.id)"
                            class="text-[10px] text-blue-500 hover:underline">
                            Leída
                        </button>
                        <button @click="store.remove(n.id)"
                            class="text-[10px] text-red-400 hover:underline">
                            Borrar
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
