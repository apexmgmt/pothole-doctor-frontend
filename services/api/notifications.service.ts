import { API_URL, NOTIFICATIONS, NOTIFICATION_MARK_ALL_AS_READ, NOTIFICATION_MARK_AS_READ } from '@/constants/api'
import apiInterceptor from './api.interceptor'

export default class NotificationService {
  static async getNotifications(queryParams?: string): Promise<any> {
    try {
      const response = await apiInterceptor(API_URL + NOTIFICATIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch notifications')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async markAsRead(notificationId: string): Promise<any> {
    try {
      const response = await apiInterceptor(API_URL + NOTIFICATION_MARK_AS_READ(notificationId), {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to mark as read')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static async markAllAsRead(): Promise<any> {
    try {
      const response = await apiInterceptor(API_URL + NOTIFICATION_MARK_ALL_AS_READ, {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to mark all as read')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
