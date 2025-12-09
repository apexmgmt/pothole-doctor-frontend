import { TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import { toast } from 'sonner'

const TaskReminderCard = ({
  taskReminders: initialTaskReminders,
  taskTypes,
  reminderChannels,
  roleType,
  title
}: {
  taskReminders: TaskReminder[]
  taskTypes: TaskType[]
  reminderChannels: TaskReminderChannel[]
  roleType: 'customer' | 'employee'
  title: string
}) => {
  const [selectedTaskType, setSelectedTaskType] = useState<string>('')
  const [taskReminders, setTaskReminders] = useState(initialTaskReminders)

  const filteredReminders = taskReminders.filter(
    reminder => reminder.role_type === roleType && reminder.task_type_id === selectedTaskType
  )

  const emailChannel = reminderChannels.find(channel => channel.type === 'email')
  const smsChannel = reminderChannels.find(channel => channel.type === 'sms')

  const handleToggle = async (reminderChannelId: string, reminderTimeId: string, isEnabled: boolean) => {
    // Store previous state for rollback
    const previousState = [...taskReminders]

    try {
      // Optimistically update UI
      setTaskReminders(prev => {
        const existingIndex = prev.findIndex(
          r =>
            r.reminder_channel_id === reminderChannelId &&
            r.reminder_time_id === reminderTimeId &&
            r.task_type_id === selectedTaskType &&
            r.role_type === roleType
        )

        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], is_enabled: isEnabled ? 1 : 0 }
          return updated
        } else {
          return [
            ...prev,
            {
              id: `temp-${Date.now()}`,
              reminder_channel_id: reminderChannelId,
              task_type_id: selectedTaskType,
              reminder_time_id: reminderTimeId,
              role_type: roleType,
              is_enabled: isEnabled ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as TaskReminder
          ]
        }
      })

      await TaskReminderService.store({
        reminder_channel_id: reminderChannelId,
        task_type_id: selectedTaskType,
        reminder_time_id: reminderTimeId,
        role_type: roleType,
        is_enabled: isEnabled ? 1 : 0
      })
        .then(response => {
          // Update with actual response data
          if (response?.data) {
            setTaskReminders(prev => {
              // Remove temporary entry
              const withoutTemp = prev.filter(r => !r.id.startsWith('temp-'))
              // Remove existing entry with same identifiers
              const withoutDuplicate = withoutTemp.filter(
                r =>
                  !(
                    r.reminder_channel_id === response.data.reminder_channel_id &&
                    r.reminder_time_id === response.data.reminder_time_id &&
                    r.task_type_id === response.data.task_type_id &&
                    r.role_type === response.data.role_type
                  )
              )
              // Add the new response data
              return [...withoutDuplicate, response.data]
            })
          }
          toast.success('Task reminder updated successfully')
        })
        .catch(error => {
          // Rollback to previous state on error
          setTaskReminders(previousState)
          toast.error('Failed to update task reminder')
          console.error(error)
        })
    } catch (error) {
      // Rollback to previous state on error
      setTaskReminders(previousState)
      toast.error('Failed to update task reminder')
      console.error(error)
    }
  }

  const isReminderEnabled = (channelId: string, timeId: string) => {
    return filteredReminders.some(
      reminder =>
        reminder.reminder_channel_id === channelId && reminder.reminder_time_id === timeId && reminder.is_enabled === 1
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Configure automatic reminders for {roleType}s</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Label className='text-base font-medium min-w-[100px]'>
            Task Type <span className='text-destructive'>*</span>
          </Label>
          <Select value={selectedTaskType} onValueChange={setSelectedTaskType} required>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select task type' />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map(taskType => (
                <SelectItem key={taskType.id} value={taskType.id}>
                  {taskType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium flex items-center gap-2'>
              <span className='inline-flex items-center justify-center w-6 h-6 bg-accent text-accent-foreground rounded-full text-sm'>
                ✉
              </span>
              Emails:
            </h3>
            <div className='space-y-3'>
              {emailChannel?.times?.map(time => (
                <div key={time.id} className='flex items-center justify-between'>
                  <Label className={`text-base ${!selectedTaskType ? 'text-muted-foreground' : ''}`}>
                    {time.label}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-medium ${isReminderEnabled(emailChannel.id, time.id) ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {isReminderEnabled(emailChannel.id, time.id) ? 'ON' : 'OFF'}
                    </span>
                    <Switch
                      checked={isReminderEnabled(emailChannel.id, time.id)}
                      onCheckedChange={checked => handleToggle(emailChannel.id, time.id, checked)}
                      disabled={!selectedTaskType}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium flex items-center gap-2'>
              <span className='inline-flex items-center justify-center w-6 h-6 bg-accent text-accent-foreground rounded-full text-sm'>
                💬
              </span>
              Text Messages:
            </h3>
            <div className='space-y-3'>
              {smsChannel?.times?.map(time => (
                <div key={time.id} className='flex items-center justify-between'>
                  <Label className={`text-base ${!selectedTaskType ? 'text-muted-foreground' : ''}`}>
                    {time.label}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-medium ${isReminderEnabled(smsChannel.id, time.id) ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {isReminderEnabled(smsChannel.id, time.id) ? 'ON' : 'OFF'}
                    </span>
                    <Switch
                      checked={isReminderEnabled(smsChannel.id, time.id)}
                      onCheckedChange={checked => handleToggle(smsChannel.id, time.id, checked)}
                      disabled={!selectedTaskType}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskReminderCard
