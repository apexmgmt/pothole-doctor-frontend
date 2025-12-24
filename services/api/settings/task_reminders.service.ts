import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { TASK_REMINDER_CHANNELS, TASK_REMINDER_TIMES, TASK_REMINDERS } from '@/constants/api'
import { TaskReminderPayload } from '@/types'

export default class TaskReminderService {
  static index = async () => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASK_REMINDERS, {
        requiresAuth: true,
        method: 'GET',
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch task reminders')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  static store = async (payload: TaskReminderPayload) => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASK_REMINDERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create task reminder')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getReminderChannels = async (type?: string) => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASK_REMINDER_CHANNELS + (type ? `?type=${type}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['reminder-channels'] } // Cache for 3600 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch reminder channels')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getReminderTimes = async () => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASK_REMINDER_TIMES, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['reminder-times'] } // Cache for 3600 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch reminder times')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
