import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import echo from '@/echo'
import { useAuthStore } from '@/stores/authStore'

export interface NotificationData {
    id:         string
    type:       string
    title:      string
    message:    string
    data:       Record<string, any>
    read:       boolean
    read_at:    string | null
    created_at: string
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<NotificationData[]>([])
    const loading       = ref(false)

    const unreadCount = computed(
        () => notifications.value.filter(n => !n.read).length
    )

    async function fetchNotifications() {
        loading.value = true
        try {
            const { data, execute } = ApiUseFetch('/notifications')
                .get()
                .json<{ success: boolean; data: { notifications: NotificationData[] } }>()

            await execute()

            if (data.value?.data?.notifications) {
                notifications.value = data.value.data.notifications
            }
        } finally {
            loading.value = false
        }
    }

    async function markAsRead(id: string) {
        const { execute } = ApiUseFetch(`/notifications/${id}/read`)
            .patch()
            .json()

        await execute()

        const n = notifications.value.find(n => n.id === id)
        if (n) {
            n.read    = true
            n.read_at = new Date().toISOString()
        }
    }

    async function markAllAsRead() {
        const { execute } = ApiUseFetch('/notifications/read-all')
            .patch()
            .json()

        await execute()

        notifications.value.forEach(n => {
            n.read    = true
            n.read_at = new Date().toISOString()
        })
    }

    async function remove(id: string) {
        const { execute } = ApiUseFetch(`/notifications/${id}`)
            .delete()
            .json()

        await execute()

        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    function subscribeToChannel() {
        const auth = useAuthStore()
        if (!auth.user?.id) return

        echo.private(`App.Models.User.${auth.user.id}`)
            .notification((notification: NotificationData) => {
                notifications.value.unshift({ ...notification, read: false })
            })
    }

    function unsubscribeFromChannel() {
        const auth = useAuthStore()
        if (!auth.user?.id) return
        echo.leave(`App.Models.User.${auth.user.id}`)
    }

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        remove,
        subscribeToChannel,
        unsubscribeFromChannel,
    }
})
