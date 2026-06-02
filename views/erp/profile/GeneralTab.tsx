'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'

import EditButton from '@/components/erp/common/buttons/EditButton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CountryWithStates, User } from '@/types'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'
import AuthService from '@/services/api/auth.service'
import UpdateProfileModal from './UpdateProfileModal'

type EditableField = 'name' | 'phone' | 'address' | null

interface GeneralTabProps {
  userData: User | null
  countryWithStates?: CountryWithStates[]
}

const GeneralTab: React.FC<GeneralTabProps> = ({ userData, countryWithStates = [] }) => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector(state => state.auth.user) as User
  const currentUser = user || userData
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingField, setEditingField] = useState<EditableField>(null)
  const [isSaving, setIsSaving] = useState(false)

  const isContractorOrReferral = ['contractor', 'referral'].includes((currentUser?.user_type || '').toLowerCase())

  const getInitialDraft = () => ({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.userable?.phone || '',
    address: currentUser?.userable?.address || '',
    street_address: currentUser?.userable?.street_address || '',
    city_id: currentUser?.userable?.city_id?.toString() || '',
    state_id: currentUser?.userable?.state_id?.toString() || '',
    country_id: currentUser?.userable?.city?.country_id?.toString() || '',
    zip_code: currentUser?.userable?.zip_code || ''
  })

  const [draft, setDraft] = useState(getInitialDraft())

  useEffect(() => {
    setDraft(getInitialDraft())
    setEditingField(null)
  }, [currentUser])

  const openFieldEditor = (field: Exclude<EditableField, null>) => {
    setDraft(getInitialDraft())
    setEditingField(field)
  }

  const cancelEdit = () => {
    setDraft(getInitialDraft())
    setEditingField(null)
  }

  const updateDraft = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const availableStates = useMemo(() => {
    if (!draft.country_id) return []
    const country = countryWithStates.find(c => c.id.toString() === draft.country_id)

    return country?.states || []
  }, [draft.country_id, countryWithStates])

  const availableCities = useMemo(() => {
    if (!draft.state_id) return []
    const state = availableStates.find(s => s.id.toString() === draft.state_id)

    return state?.cities || []
  }, [draft.state_id, availableStates])

  // Handle cascaded selects
  useEffect(() => {
    if (editingField === 'address' && isContractorOrReferral) {
      if (draft.country_id && draft.state_id) {
        const stateExists = availableStates.some(s => s.id.toString() === draft.state_id)

        if (!stateExists) {
          updateDraft('state_id', '')
          updateDraft('city_id', '')
        }
      }
    }
  }, [draft.country_id, availableStates, editingField, isContractorOrReferral])

  useEffect(() => {
    if (editingField === 'address' && isContractorOrReferral) {
      if (draft.state_id && draft.city_id) {
        const cityExists = availableCities.some(c => c.id.toString() === draft.city_id)

        if (!cityExists) {
          updateDraft('city_id', '')
        }
      }
    }
  }, [draft.state_id, availableCities, editingField, isContractorOrReferral])

  const submitInlineEdit = async () => {
    setIsSaving(true)

    const payload: any = {
      first_name: draft.first_name,
      last_name: draft.last_name,
      phone: draft.phone
    }

    if (isContractorOrReferral) {
      payload.street_address = draft.street_address
      payload.city_id = draft.city_id
      payload.state_id = draft.state_id
      payload.zip_code = draft.zip_code
    } else {
      payload.address = draft.address
    }

    try {
      await AuthService.updateProfileDetails(payload)

      // Update Redux state
      const updatedUser = {
        ...currentUser,
        first_name: draft.first_name,
        last_name: draft.last_name,
        name: `${draft.first_name} ${draft.last_name}`,
        userable: {
          ...currentUser.userable,
          phone: draft.phone,
          address: isContractorOrReferral ? currentUser?.userable?.address : draft.address,
          street_address: isContractorOrReferral ? draft.street_address : currentUser?.userable?.street_address,
          city_id: isContractorOrReferral ? draft.city_id : currentUser?.userable?.city_id,
          city: isContractorOrReferral
            ? countryWithStates
                .find(c => c.id.toString() === draft.country_id)
                ?.states.find(s => s.id.toString() === draft.state_id)
                ?.cities.find(c => c.id.toString() === draft.city_id)
            : currentUser?.userable?.city,
          state_id: isContractorOrReferral ? draft.state_id : currentUser?.userable?.state_id,
          state: isContractorOrReferral
            ? countryWithStates
                .find(c => c.id.toString() === draft.country_id)
                ?.states.find(s => s.id.toString() === draft.state_id)
            : currentUser?.userable?.state,
          zip_code: isContractorOrReferral ? draft.zip_code : currentUser?.userable?.zip_code
        }
      } as User

      dispatch(setUserData(updatedUser))
      toast.success('Profile updated successfully')
      setEditingField(null)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile')
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
        className='h-8 w-8 shrink-0'
        onClick={submitInlineEdit}
        disabled={isSaving}
      >
        <Check className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        size='icon'
        variant='outline'
        className='h-8 w-8 border-border text-light hover:bg-bg-3 shrink-0'
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
      className='group flex-1 w-full min-h-9 py-1 rounded-md flex items-start gap-2 text-left text-light hover:text-primary hover:bg-bg-3/40 transition-colors'
    >
      <span
        className={`${breakAll ? 'break-all' : 'break-words'} ${preserveLineBreaks ? 'whitespace-pre-line' : ''} flex-1`}
      >
        {value || ' - '}
      </span>
      <Pencil className='h-3.5 w-3.5 text-gray opacity-0 group-hover:opacity-100 shrink-0 transition-opacity mt-1 mr-2' />
    </button>
  )

  return (
    <div className='space-y-5'>
      {/* Header with Edit Button */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Personal Information</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Profile Information'
          onClick={() => setIsModalOpen(true)}
          variant='icon'
          buttonSize='default'
          buttonVariant='ghost'
        />
      </div>

      {/* Personal Information Fields */}
      <div>
        <div className='space-y-5'>
          <div className='grid grid-cols-1 gap-6'>
            <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
              <label className='text-xs text-gray uppercase block w-25 shrink-0'>Name : </label>
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
              ) : (
                <EditableDisplay
                  value={`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()}
                  onClick={() => openFieldEditor('name')}
                />
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
            <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
              <label className='text-xs text-gray uppercase block w-25 shrink-0'>Email : </label>
              <p className='text-light break-all flex-1 py-1'>{currentUser?.email || ' - '}</p>
            </div>

            <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
              <label className='text-xs text-gray uppercase block w-25 shrink-0'>Phone : </label>
              {editingField === 'phone' ? (
                <div className='flex w-full items-center gap-2'>
                  <Input
                    value={draft.phone}
                    onChange={e => updateDraft('phone', e.target.value)}
                    placeholder='Phone'
                    className='bg-bg-3 border-border text-light placeholder:text-gray h-9 flex-1'
                  />
                  <ActionButtons />
                </div>
              ) : (
                <EditableDisplay value={currentUser?.userable?.phone || ''} onClick={() => openFieldEditor('phone')} />
              )}
            </div>
          </div>

          {(currentUser?.user_type === 'contractor' || currentUser?.user_type === 'referral') && (
            <div className='grid grid-cols-1 gap-6'>
              <div className='flex items-center gap-2.5 flex-row'>
                <label className='text-xs text-gray uppercase block w-25 shrink-0'>Company :</label>
                <p className='text-light flex-1 py-1'>{currentUser?.userable?.company?.name || ' - '}</p>
              </div>
            </div>
          )}

          <div className='flex min-[480px]:items-start items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25 mt-2.5 shrink-0'>Address : </label>
            {editingField === 'address' ? (
              <div className='flex w-full items-start gap-2'>
                {isContractorOrReferral ? (
                  <div className='flex-1 space-y-3'>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                      <Select value={draft.country_id} onValueChange={val => updateDraft('country_id', val)}>
                        <SelectTrigger className='bg-bg-3 border-border text-light h-9'>
                          <SelectValue placeholder='Country' />
                        </SelectTrigger>
                        <SelectContent>
                          {countryWithStates.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={draft.state_id}
                        onValueChange={val => updateDraft('state_id', val)}
                        disabled={!draft.country_id || availableStates.length === 0}
                      >
                        <SelectTrigger className='bg-bg-3 border-border text-light h-9'>
                          <SelectValue placeholder='State' />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={draft.city_id}
                        onValueChange={val => updateDraft('city_id', val)}
                        disabled={!draft.state_id || availableCities.length === 0}
                      >
                        <SelectTrigger className='bg-bg-3 border-border text-light h-9'>
                          <SelectValue placeholder='City' />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <Input
                        value={draft.zip_code}
                        onChange={e => updateDraft('zip_code', e.target.value)}
                        placeholder='Zip Code'
                        className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                      />
                      <Input
                        value={draft.street_address}
                        onChange={e => updateDraft('street_address', e.target.value)}
                        placeholder='Street Address'
                        className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                      />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    rows={2}
                    value={draft.address}
                    onChange={e => updateDraft('address', e.target.value)}
                    placeholder='Address'
                    className='bg-bg-3 border-border text-light placeholder:text-gray flex-1'
                  />
                )}
                <ActionButtons />
              </div>
            ) : (
              <EditableDisplay
                value={
                  !isContractorOrReferral
                    ? currentUser?.userable?.address || ''
                    : [
                        currentUser?.userable?.street_address,
                        currentUser?.userable?.city?.name,
                        currentUser?.userable?.state?.name,
                        currentUser?.userable?.zip_code
                      ]
                        .filter(Boolean)
                        .join(', ') || ''
                }
                onClick={() => openFieldEditor('address')}
                preserveLineBreaks={!isContractorOrReferral}
              />
            )}
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {currentUser && (
        <UpdateProfileModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          userData={currentUser}
          countryWithStates={countryWithStates}
        />
      )}
    </div>
  )
}

export default GeneralTab
