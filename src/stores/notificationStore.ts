import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import echo from '@/echo'
import { useAuthStore } from '@/stores/authStore'
import type { NotificationData, NotificationsResponse } from '@/types/notification'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationData[]>([])
  const loading = ref(false)
  const subscribedChannel = ref<string | null>(null)

  const unreadCount = computed(
    () => notifications.value.filter(n => !n.read).length
  )

  async function fetchNotifications() {
    loading.value = true
    try {
      const { data, execute } = ApiUseFetch('/notifications')
        .get()
        .json<{ success: boolean; data: NotificationsResponse }>()

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
      n.read = true
      n.read_at = new Date().toISOString()
    }
  }

  async function markAllAsRead() {
    const { execute } = ApiUseFetch('/notifications/read-all')
      .patch()
      .json()

    await execute()

    notifications.value.forEach(n => {
      n.read = true
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

    const channelName = `App.Models.User.${auth.user.id}`

    if (subscribedChannel.value === channelName) return

    if (subscribedChannel.value) {
      echo.leave(subscribedChannel.value)
    }

    subscribedChannel.value = channelName

    echo.private(channelName)
      .notification((notification: any) => {
        // Normaliza la estructura sin importar si Laravel manda
        // los datos planos o anidados dentro de .data
        const normalized: NotificationData = {
          id:         notification.id,
          type:       notification.type       ?? notification.data?.type       ?? null,
          title:      notification.title      ?? notification.data?.title      ?? null,
          message:    notification.message    ?? notification.data?.message    ?? null,
          created_at: notification.created_at ?? notification.data?.created_at ?? new Date().toISOString(),
          read:       false,
          read_at:    null,
          data:       notification.data ?? {},
        }

        const exists = notifications.value.some(n => n.id === normalized.id)
        if (exists) return

        notifications.value.unshift(normalized)
      })
  }

  function unsubscribeFromChannel() {
    if (!subscribedChannel.value) return
    echo.leave(subscribedChannel.value)
    subscribedChannel.value = null
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
