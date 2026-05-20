'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import StaffService from '@/services/api/staff.service'
import { Permission, PermissionsByModule, Role, Staff, StaffPayload } from '@/types'

type EditableField = 'name' | 'phone' | 'address' | 'roles' | 'permissions' | null

interface GeneralTabProps {
  staffData: Staff
  canEditStaff?: boolean
  onStaffUpdated?: (updatedStaff: Staff) => void
  fetchData?: () => void
}

const getPayloadFromStaff = (staff: Staff): StaffPayload => ({
  first_name: staff.first_name || '',
  last_name: staff.last_name || '',
  email: staff.email || '',
  phone: staff.userable?.phone || '',
  address: staff.userable?.address || '',
  user_type: staff.guard || staff.user_type || 'staff',
  password: '',
  password_confirmation: '',
  roles: staff.roles?.map(role => role.name) || [],
  permissions: staff.permissions?.map(permission => permission.name) || [],
  commission_type_id: staff.userable?.commission_type_id || ''
})

const groupPermissionsFromArray = (permissions: Permission[]): PermissionsByModule => {
  return permissions.reduce((acc, permission) => {
    const moduleName = permission.module || 'other'

    if (!acc[moduleName]) {
      acc[moduleName] = []
    }

    acc[moduleName].push(permission)

    return acc
  }, {} as PermissionsByModule)
}

const getAssignedPermissionsByModule = (
  staffPermissions: Permission[] = [],
  availablePermissionsByModule: PermissionsByModule = {}
): PermissionsByModule => {
  const assignedNames = new Set(staffPermissions.map(permission => permission.name))
  const groupedAssigned: PermissionsByModule = {}

  Object.keys(availablePermissionsByModule).forEach(moduleName => {
    const assignedInModule = availablePermissionsByModule[moduleName].filter(permission =>
      assignedNames.has(permission.name)
    )

    if (assignedInModule.length > 0) {
      groupedAssigned[moduleName] = assignedInModule
      assignedInModule.forEach(permission => assignedNames.delete(permission.name))
    }
  })

  const unmatchedPermissions = staffPermissions.filter(permission => assignedNames.has(permission.name))

  if (unmatchedPermissions.length > 0) {
    groupedAssigned.other = unmatchedPermissions
  }

  return groupedAssigned
}

const GeneralTab = ({ staffData, canEditStaff = false, onStaffUpdated, fetchData }: GeneralTabProps) => {
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [draft, setDraft] = useState<StaffPayload>(() => getPayloadFromStaff(staffData))
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [availablePermissionsByModule, setAvailablePermissionsByModule] = useState<PermissionsByModule>({})

  const latestPayload = useMemo(() => getPayloadFromStaff(staffData), [staffData])

  useEffect(() => {
    setDraft(latestPayload)
    setEditingField(null)
  }, [latestPayload])

  useEffect(() => {
    const loadEditOptions = async () => {
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          RoleService.getAll(),
          PermissionService.index({ no_pagination: true })
        ])

        setAvailableRoles(Array.isArray(rolesResponse?.data) ? rolesResponse.data : [])

        const permissionsData = permissionsResponse?.data

        if (Array.isArray(permissionsData)) {
          setAvailablePermissionsByModule(groupPermissionsFromArray(permissionsData))
        } else if (permissionsData && typeof permissionsData === 'object') {
          setAvailablePermissionsByModule(permissionsData as PermissionsByModule)
        }
      } catch (error) {
        console.error('Error loading staff edit options:', error)
      }
    }

    loadEditOptions()
  }, [])

  const assignedPermissionsByModule = useMemo(
    () => getAssignedPermissionsByModule(staffData.permissions || [], availablePermissionsByModule),
    [staffData.permissions, availablePermissionsByModule]
  )

  const openFieldEditor = (field: Exclude<EditableField, null>) => {
    if (!canEditStaff) {
      return
    }

    setDraft(latestPayload)
    setEditingField(field)
  }

  const cancelEdit = () => {
    setDraft(latestPayload)
    setEditingField(null)
  }

  const updateDraft = (key: keyof StaffPayload, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const togglePermission = (permissionName: string, checked: boolean) => {
    const currentPermissions = draft.permissions || []

    if (checked) {
      if (!currentPermissions.includes(permissionName)) {
        setDraft(prev => ({ ...prev, permissions: [...currentPermissions, permissionName] }))
      }

      return
    }

    setDraft(prev => ({
      ...prev,
      permissions: currentPermissions.filter(permission => permission !== permissionName)
    }))
  }

  const handleRoleSelect = (roleName: string) => {
    const currentRoles = draft.roles || []

    if (!currentRoles.includes(roleName)) {
      setDraft(prev => ({ ...prev, roles: [...currentRoles, roleName] }))
    }

    setSelectedRole('')
  }

  const handleRoleRemove = (roleName: string) => {
    const currentRoles = draft.roles || []

    setDraft(prev => ({
      ...prev,
      roles: currentRoles.filter(role => role !== roleName)
    }))
  }

  const submitInlineEdit = async () => {
    setIsSaving(true)

    try {
      await StaffService.update(String(staffData.id), draft)

      const availablePermissions = Object.values(availablePermissionsByModule).flat()

      const resolvedPermissions = (draft.permissions || []).map(permissionName => {
        return (
          availablePermissions.find(permission => permission.name === permissionName) || { id: 0, name: permissionName }
        )
      })

      const resolvedRoles = (draft.roles || []).map(roleName => {
        return (
          availableRoles.find(role => role.name === roleName) || {
            id: 0,
            name: roleName,
            guard_name: '',
            created_at: '',
            updated_at: '',
            permissions: []
          }
        )
      })

      const updatedStaff = {
        ...staffData,
        first_name: draft.first_name,
        last_name: draft.last_name,
        email: draft.email,
        roles: resolvedRoles,
        permissions: resolvedPermissions,
        userable: {
          ...staffData.userable,
          phone: draft.phone,
          address: draft.address,
          commission_type_id: draft.commission_type_id
        }
      }

      onStaffUpdated?.(updatedStaff as Staff)

      if (fetchData) {
        fetchData()
      }

      setEditingField(null)
      toast.success('Staff updated successfully')
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.map((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const ActionButtons = () => (
    <div className='flex items-center gap-2'>
      <Button
        type='button'
        size='icon'
        variant='default'
        className='h-8 w-8'
        onClick={submitInlineEdit}
        disabled={isSaving}
      >
        <Check className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        size='icon'
        variant='outline'
        className='h-8 w-8 border-border text-light hover:bg-bg-3'
        onClick={cancelEdit}
        disabled={isSaving}
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  )

  const EditableDisplay = ({
    value,
    onClick,
    breakAll = false,
    preserveLineBreaks = false
  }: {
    value: string
    onClick: () => void
    breakAll?: boolean
    preserveLineBreaks?: boolean
  }) => (
    <button
      type='button'
      onClick={onClick}
      className='group flex-1 min-w-0 min-h-9 py-1 rounded-md flex items-start gap-2 text-left text-light hover:text-primary hover:bg-bg-3/40 transition-colors'
    >
      <span
        className={`${breakAll ? 'break-all' : 'break-words'} ${preserveLineBreaks ? 'whitespace-pre-line' : ''} min-w-0`}
      >
        {value || ' - '}
      </span>
      <Pencil className='h-3.5 w-3.5 text-gray opacity-0 group-hover:opacity-100 shrink-0 transition-opacity' />
    </button>
  )

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Staff Details</h3>
      </div>

      <div className='space-y-5'>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Name : </label>
            {editingField === 'name' ? (
              <div className='flex w-full items-center gap-2'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1'>
                  <Input
                    value={draft.first_name}
                    onChange={e => updateDraft('first_name', e.target.value)}
                    placeholder='First name'
                    className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                  />
                  <Input
                    value={draft.last_name}
                    onChange={e => updateDraft('last_name', e.target.value)}
                    placeholder='Last name'
                    className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                  />
                </div>
                <ActionButtons />
              </div>
            ) : canEditStaff ? (
              <EditableDisplay
                value={`${staffData.first_name || ''} ${staffData.last_name || ''}`.trim()}
                onClick={() => openFieldEditor('name')}
              />
            ) : (
              <p className='text-light'>
                {staffData.first_name || ''} {staffData.last_name || ''}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Email : </label>
            <p className='text-light break-all'>{staffData.email || ' - '}</p>
          </div>

          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Phone : </label>
            {editingField === 'phone' ? (
              <div className='flex w-full items-center gap-2'>
                <Input
                  value={draft.phone || ''}
                  onChange={e => updateDraft('phone', e.target.value)}
                  placeholder='Phone'
                  className='bg-bg-3 border-border text-light placeholder:text-gray h-9 flex-1'
                />
                <ActionButtons />
              </div>
            ) : canEditStaff ? (
              <EditableDisplay value={staffData.userable?.phone || ''} onClick={() => openFieldEditor('phone')} />
            ) : (
              <p className='text-light'>{staffData.userable?.phone || ' - '}</p>
            )}
          </div>
        </div>

        <div className='flex min-[480px]:items-start items-start gap-2.5 flex-col min-[480px]:flex-row'>
          <label className='text-xs text-gray uppercase block w-25 mt-2.5'>Address : </label>
          {editingField === 'address' ? (
            <div className='flex w-full items-start gap-2'>
              <Textarea
                rows={2}
                value={draft.address || ''}
                onChange={e => updateDraft('address', e.target.value)}
                placeholder='Address'
                className='bg-bg-3 border-border text-light placeholder:text-gray flex-1'
              />
              <ActionButtons />
            </div>
          ) : canEditStaff ? (
            <EditableDisplay
              value={staffData.userable?.address || ''}
              onClick={() => openFieldEditor('address')}
              preserveLineBreaks
            />
          ) : (
            <p className='text-light whitespace-pre-line'>{staffData.userable?.address || ' - '}</p>
          )}
        </div>

        <div className='flex min-[480px]:items-start items-start gap-2.5 flex-col min-[480px]:flex-row'>
          <label className='text-xs text-gray uppercase block w-25 mt-2.5'>Roles : </label>
          {editingField === 'roles' ? (
            <div className='w-full space-y-3'>
              <div className='flex gap-2'>
                <Select value={selectedRole} onValueChange={handleRoleSelect}>
                  <SelectTrigger className='bg-bg-3 border-border text-light w-full'>
                    <SelectValue placeholder='Select roles' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.id} value={role.name} disabled={Boolean(draft.roles?.includes(role.name))}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ActionButtons />
              </div>

              {draft.roles && draft.roles.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {draft.roles.map(roleName => (
                    <div
                      key={roleName}
                      className='flex items-center gap-2 bg-bg-3 border border-border rounded-md px-3 py-1.5 text-sm text-light'
                    >
                      <span>{roleName}</span>
                      <button
                        type='button'
                        onClick={() => handleRoleRemove(roleName)}
                        className='text-gray hover:text-light cursor-pointer'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-gray'>No roles selected.</p>
              )}
            </div>
          ) : canEditStaff ? (
            <button
              type='button'
              onClick={() => openFieldEditor('roles')}
              className='group flex-1 min-w-0 min-h-9 py-1 rounded-md text-left text-light hover:text-primary hover:bg-bg-3/40 transition-colors'
            >
              <div className='flex flex-wrap gap-2'>
                {staffData.roles && staffData.roles.length > 0 ? (
                  staffData.roles.map(role => (
                    <Badge key={role.id} className='px-2 py-1 rounded-md'>
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <span className='text-light'> - </span>
                )}
              </div>
            </button>
          ) : (
            <div className='flex-1 flex flex-wrap gap-2'>
              {staffData.roles && staffData.roles.length > 0 ? (
                staffData.roles.map(role => (
                  <Badge key={role.id} className='px-2 py-1 rounded-md'>
                    {role.name}
                  </Badge>
                ))
              ) : (
                <p className='text-light'>-</p>
              )}
            </div>
          )}
        </div>

        <div className='flex min-[480px]:items-start items-start gap-2.5 flex-col min-[480px]:flex-row'>
          <label className='text-xs text-gray uppercase block w-25 mt-2.5'>Permissions : </label>
          {editingField === 'permissions' ? (
            <div className='w-full space-y-4'>
              <ScrollArea className='h-80 pr-1'>
                <div className='space-y-4'>
                  {Object.keys(availablePermissionsByModule)
                    .sort((a, b) => a.localeCompare(b))
                    .map(moduleName => (
                      <div key={moduleName} className='space-y-3'>
                        <h4 className='text-sm font-medium text-light capitalize border-b border-border pb-2'>
                          {moduleName.replace(/-/g, ' ')}
                        </h4>
                        <div className='grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3 pl-1'>
                          {availablePermissionsByModule[moduleName]
                            .sort((a, b) => a.id - b.id)
                            .map(permission => (
                              <label key={permission.id} className='flex items-start gap-2 text-light cursor-pointer'>
                                <Checkbox
                                  checked={Boolean(draft.permissions?.includes(permission.name))}
                                  onCheckedChange={checked => togglePermission(permission.name, Boolean(checked))}
                                />
                                <span className='text-sm'>{permission.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>

              <div className='flex justify-end'>
                <ActionButtons />
              </div>
            </div>
          ) : canEditStaff ? (
            <button
              type='button'
              onClick={() => openFieldEditor('permissions')}
              className='group relative flex-1 min-w-0 min-h-9 py-1 rounded-md text-left text-light hover:text-primary hover:bg-bg-3/40 transition-colors'
            >
              <div className='space-y-3'>
                {Object.keys(assignedPermissionsByModule).length > 0 ? (
                  Object.keys(assignedPermissionsByModule)
                    .sort((a, b) => a.localeCompare(b))
                    .map(moduleName => (
                      <div key={moduleName} className='space-y-2'>
                        <p className='text-xs uppercase text-gray'>{moduleName.replace(/-/g, ' ')}</p>
                        <div className='flex flex-wrap gap-2'>
                          {assignedPermissionsByModule[moduleName].map(permission => (
                            <Badge key={`${moduleName}-${permission.name}`} className='px-2 py-1 rounded-md'>
                              {permission.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <span className='text-light'> - </span>
                )}
              </div>
              <Pencil className='absolute top-1 right-1 h-3.5 w-3.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity' />
            </button>
          ) : (
            <div className='flex-1 space-y-3'>
              {Object.keys(assignedPermissionsByModule).length > 0 ? (
                Object.keys(assignedPermissionsByModule)
                  .sort((a, b) => a.localeCompare(b))
                  .map(moduleName => (
                    <div key={moduleName} className='space-y-2'>
                      <p className='text-xs uppercase text-gray'>{moduleName.replace(/-/g, ' ')}</p>
                      <div className='flex flex-wrap gap-2'>
                        {assignedPermissionsByModule[moduleName].map(permission => (
                          <Badge key={`${moduleName}-${permission.name}`} className='px-2 py-1 rounded-md'>
                            {permission.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <p className='text-light'>- </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
