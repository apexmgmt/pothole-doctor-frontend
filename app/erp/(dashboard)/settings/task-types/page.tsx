import TaskTypes from '@/views/erp/settings/task-types/TaskTypes'
import TaskTypeService from '@/services/api/settings/task_types.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, TaskType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TaskTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<TaskType> | null = null

  try {
    const response = await TaskTypeService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch task types:', error)
  }

  const [canCreateType, canEditType, canDeleteType, canRestoreType] = await Promise.all([
    hasPermission('Create Task Type'),
    hasPermission('Update Task Type'),
    hasPermission('Delete Task Type'),
    hasPermission('Restore Task Type')
  ])

  return (
    <TaskTypes initialData={initialData} permissions={{ canCreateType, canEditType, canDeleteType, canRestoreType }} />
  )
}
