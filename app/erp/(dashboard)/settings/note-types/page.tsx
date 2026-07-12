import NoteTypes from '@/views/erp/settings/note-types/NoteTypes'
import NoteTypeService from '@/services/api/settings/note_types.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, NoteType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NoteTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<NoteType> | null = null

  try {
    const response = await NoteTypeService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch note types:', error)
  }

  const [canCreateType, canEditType, canDeleteType] = await Promise.all([
    hasPermission('Create Note Type'),
    hasPermission('Update Note Type'),
    hasPermission('Delete Note Type')
  ])

  return <NoteTypes initialData={initialData} permissions={{ canCreateType, canEditType, canDeleteType }} />
}
