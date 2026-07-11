import { API_URL, NOTIFICATIONS, NOTIFICATION_MARK_ALL_AS_READ, NOTIFICATION_MARK_AS_READ } from '@/constants/api'
import { handleRequest } from '@/services/api/base.service'

export default class NotificationService {
  static async getNotifications(queryParams?: string): Promise<any> {
    try {
      const response = await handleRequest(API_URL + NOTIFICATIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static async markAsRead(notificationId: string): Promise<any> {
    try {
      const response = await handleRequest(API_URL + NOTIFICATION_MARK_AS_READ(notificationId), {
        requiresAuth: true,
        method: 'POST'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static async markAllAsRead(): Promise<any> {
    try {
      const response = await handleRequest(API_URL + NOTIFICATION_MARK_ALL_AS_READ, {
        requiresAuth: true,
        method: 'POST'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
