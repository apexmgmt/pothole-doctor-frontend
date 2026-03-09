'use client'

import { useEffect, useState } from 'react'
import { Client, Staff, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import StaffService from '@/services/api/staff.service'
import ClientService from '@/services/api/clients/clients.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'
import { SpinnerCustom } from '@/components/ui/spinner'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'

interface ProposalAddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  clientId?: string
  onSuccess?: () => void
}

const ProposalAddTaskModal = ({ open, onOpenChange, proposalId, clientId, onSuccess }: ProposalAddTaskModalProps) => {
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [taskReminders, setTaskReminders] = useState<TaskReminder[]>([])
  const [taskReminderChannels, setTaskReminderChannels] = useState<TaskReminderChannel[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Fetch support data once when the modal first opens
  useEffect(() => {
    if (!open || hasFetched) return

    const fetchAll = async () => {
      setIsFetching(true)

      try {
        const [staffRes, clientRes, taskTypeRes, reminderRes, channelRes] = await Promise.allSettled([
          StaffService.getAll(),
          ClientService.getAll('customer'),
          TaskTypeService.getAll(),
          TaskReminderService.index(),
          TaskReminderService.getReminderChannels()
        ])

        if (staffRes.status === 'fulfilled') setStaffs(staffRes.value.data || [])
        if (clientRes.status === 'fulfilled') setClients(clientRes.value.data || [])
        if (taskTypeRes.status === 'fulfilled') setTaskTypes(taskTypeRes.value.data || [])
        if (reminderRes.status === 'fulfilled') setTaskReminders(reminderRes.value.data || [])
        if (channelRes.status === 'fulfilled') setTaskReminderChannels(channelRes.value.data || [])
      } catch {
        // individual errors are handled via allSettled above
      } finally {
        setIsFetching(false)
        setHasFetched(true)
      }
    }

    fetchAll()
  }, [open, hasFetched])

  // Show a loading dialog while fetching
  if (isFetching || (open && !hasFetched)) {
    return (
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Add Task'
        description='Loading task data...'
        maxWidth='4xl'
      >
        <div className='flex items-center justify-center py-12'>
          <SpinnerCustom size='size-8' />
        </div>
      </CommonDialog>
    )
  }

  return (
    <CreateOrEditTaskModal
      mode='create'
      open={open}
      onOpenChange={onOpenChange}
      proposalId={proposalId}
      defaultClientId={clientId}
      staffs={staffs}
      clients={clients}
      taskTypes={taskTypes}
      taskReminders={taskReminders}
      taskReminderChannels={taskReminderChannels}
      onSuccess={onSuccess}
    />
  )
}

export default ProposalAddTaskModal
