export type NotificationType = | 'appointment_reminder'| 'appointment_created'| 'appointment_cancelled'

export interface AppointmentNotificationData {
  appointment_id: number
  type: NotificationType
}

export interface NotificationData {
  id: string
  type: string
  title: string
  message: string
  data: AppointmentNotificationData
  read: boolean
  read_at: string | null
  created_at: string
}

export interface NotificationsResponse {
  notifications: NotificationData[]
}
