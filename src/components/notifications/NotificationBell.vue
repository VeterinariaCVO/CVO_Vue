<template>
    <div class="relative" ref="bellRef">
        <!-- Botón campana -->
        <button @click="toggle" class="relative p-2 rounded-full hover:bg-blue-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            <!-- Badge rojo -->
            <span
                v-if="store.unreadCount > 0"
                class="absolute top-0.5 right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >
                {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
            </span>
        </button>

        <!-- Dropdown -->
        <div v-if="open"
            class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span class="font-semibold text-gray-700">Notificaciones</span>
                <span class="text-xs text-gray-400">
                    {{ store.notifications.length }} en total
                </span>
            </div>

            <!-- Lista -->
            <ul class="max-h-96 overflow-y-auto divide-y divide-gray-50">

                <li v-if="store.loading"
                    class="px-4 py-8 text-center text-sm text-gray-400">
                    Cargando...
                </li>

                <li v-else-if="store.notifications.length === 0"
                    class="px-4 py-8 text-center text-sm text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto mb-2 text-gray-300"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Sin notificaciones
                </li>

                <li v-for="n in store.notifications" :key="n.id"
                    @click="handleNotificationClick(n.id, n.read)"
                    class="flex items-start gap-3 px-4 py-3 transition cursor-pointer"
                    :class="n.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'">

                    <!-- Punto azul si no leída -->
                    <span class="mt-2 w-2 h-2 rounded-full shrink-0 transition-colors"
                        :class="n.read ? 'bg-gray-200' : 'bg-blue-500'" />

                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800">{{ n.title }}</p>
                        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                        <p class="text-[10px] text-gray-400 mt-1">{{ n.created_at }}</p>
                    </div>

                    <!-- Botón eliminar -->
                    <button
                        @click.stop="store.remove(n.id)"
                        class="shrink-0 mt-1 text-gray-300 hover:text-red-400 transition"
                        title="Eliminar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const store   = useNotificationStore()
const open    = ref(false)
const bellRef = ref<HTMLElement | null>(null)

function toggle() {
    open.value = !open.value
}

async function handleNotificationClick(id: string, read: boolean) {
    if (!read) {
        await store.markAsRead(id)
    }
}

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
