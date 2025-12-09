'use client'

import { TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import TaskReminderCard from './TaskReminderCard'
import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

export default function TaskReminders({
  taskReminders,
  taskTypes,
  reminderChannels
}: {
  taskReminders: TaskReminder[]
  taskTypes: TaskType[]
  reminderChannels: TaskReminderChannel[]
}) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle('Task Reminders Settings'))
  }, [])
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <TaskReminderCard
        taskReminders={taskReminders}
        taskTypes={taskTypes}
        reminderChannels={reminderChannels}
        roleType='customer'
        title='Customer Task Automatic Reminders'
      />
      <TaskReminderCard
        taskReminders={taskReminders}
        taskTypes={taskTypes}
        reminderChannels={reminderChannels}
        roleType='employee'
        title='Employee Task Automatic Reminders'
      />
    </div>
  )
}
