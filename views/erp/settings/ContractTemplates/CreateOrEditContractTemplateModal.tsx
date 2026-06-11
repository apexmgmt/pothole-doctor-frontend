'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { EstimateType, ContractTemplatePayload, ContractTemplate } from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomFormField from '@/components/form/CustomFormField'
import TipTapRichTextEditor, { TipTapRichTextEditorRef } from '@/components/erp/common/editor/TipTapRichTextEditor'
import ContractTemplateService from '@/services/api/settings/contract_templates.service'
import { cn } from '@/lib/utils'

interface CreateOrEditContractTemplateModalProps {
  mode: 'create' | 'edit' | 'view'
  open: boolean
  onOpenChange: (open: boolean) => void
  estimateTypes: EstimateType[]
  templateId?: string
  templateDetails?: ContractTemplate
  onSuccess: () => void
}

export default function CreateOrEditContractTemplateModal({
  mode,
  open,
  onOpenChange,
  estimateTypes,
  templateId,
  templateDetails,
  onSuccess
}: CreateOrEditContractTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const editorRef = useRef<TipTapRichTextEditorRef>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ContractTemplatePayload>({
    defaultValues: {
      contract_name: '',
      contract_type_id: '',
      is_quote_contract: false,
      is_default_quote_contract: false,
      is_invoice_contract: false,
      is_default_invoice_contract: false,
      order: undefined,
      template_message: ''
    }
  })

  useEffect(() => {
    if (open) {
      if ((mode === 'edit' || mode === 'view') && templateDetails) {
        reset({
          contract_name: templateDetails.contract_name || '',
          contract_type_id: templateDetails.contract_type_id || '',
          is_quote_contract: templateDetails.is_quote_contract || false,
          is_default_quote_contract: templateDetails.is_default_quote_contract || false,
          is_invoice_contract: templateDetails.is_invoice_contract || false,
          is_default_invoice_contract: templateDetails.is_default_invoice_contract || false,
          order: templateDetails.order,
          template_message: templateDetails.template_message || ''
        })
      } else {
        reset({
          contract_name: '',
          contract_type_id: '',
          is_quote_contract: false,
          is_default_quote_contract: false,
          is_invoice_contract: false,
          is_default_invoice_contract: false,
          order: undefined,
          template_message: ''
        })
      }
    }
  }, [open, mode, templateDetails, reset])

  const onSubmit = async (data: ContractTemplatePayload) => {
    setIsLoading(true)

    try {
      const payload: ContractTemplatePayload = {
        ...data,
        order:
          typeof data.order === 'number' || (typeof data.order === 'string' && data.order !== '')
            ? Number(data.order)
            : undefined
      }

      if (mode === 'edit' && templateId) {
        await ContractTemplateService.update(templateId, payload)
        toast.success('Contract template updated successfully')
      } else {
        await ContractTemplateService.store(payload)
        toast.success('Contract template created successfully')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${mode} contract template`)
    } finally {
      setIsLoading(false)
    }
  }

  const estimateTypeOptions =
    estimateTypes?.map(type => ({
      label: type.name,
      value: type.id
    })) || []

  const isQuoteContract = watch('is_quote_contract')
  const isInvoiceContract = watch('is_invoice_contract')

  const isViewMode = mode === 'view'

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        mode === 'create'
          ? 'Create Contract Template'
          : mode === 'edit'
            ? 'Edit Contract Template'
            : 'View Contract Template'
      }
      description={
        mode === 'create'
          ? 'Create a new contract template'
          : mode === 'edit'
            ? 'Update the contract template'
            : 'Contract template details'
      }
      maxWidth='6xl'
      isLoading={isLoading}
      actions={
        <>
          {isViewMode ? (
            <Button variant='outline' type='button' size='sm' onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                type='button'
                size='sm'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' size='sm' form='contract-template-form' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </>
      }
    >
      <form id='contract-template-form' onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {!isViewMode && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <CustomFormField
              type='text'
              name='contract_name'
              label='Contract Name'
              control={control}
              register={register}
              errors={errors}
              rules={{ required: 'Contract name is required' }}
              placeholder='Enter contract name'
              disabled={isLoading}
              fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)]'}
              labelClassName={'justify-end self-start text-right pt-1'}
            />

            <CustomFormField
              type='select'
              name='contract_type_id'
              label='Contract Type'
              placeholder='Select contract type'
              control={control}
              register={register}
              errors={errors}
              selectOptions={estimateTypeOptions}
              rules={{ required: 'Contract type is required' }}
              disabled={isLoading}
              fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)]'}
              labelClassName={'justify-end self-start text-right pt-1'}
            />
          </div>
        )}

        {!isViewMode && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-2'>
            <div className='space-y-4'>
              <CustomFormField
                type='checkbox'
                name='is_quote_contract'
                label='Quote Contract'
                control={control}
                register={register}
                errors={errors}
                disabled={isLoading}
                fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)] [&>button]:order-2 [&>label]:order-1'}
                labelClassName={'justify-end self-start text-right pt-1'}
              />

              <CustomFormField
                type='checkbox'
                name='is_default_quote_contract'
                label='Selected by Default (Quote)'
                control={control}
                register={register}
                errors={errors}
                disabled={isLoading || !isQuoteContract}
                fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)] [&>button]:order-2 [&>label]:order-1'}
                labelClassName={'justify-end self-start text-right pt-1'}
              />
            </div>

            <div className='space-y-4'>
              <CustomFormField
                type='checkbox'
                name='is_invoice_contract'
                label='Invoice Contract'
                control={control}
                register={register}
                errors={errors}
                disabled={isLoading}
                fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)] [&>button]:order-2 [&>label]:order-1'}
                labelClassName={'justify-end self-start text-right pt-1'}
              />

              <CustomFormField
                type='checkbox'
                name='is_default_invoice_contract'
                label='Selected by Default (Invoice)'
                control={control}
                register={register}
                errors={errors}
                disabled={isLoading || !isInvoiceContract}
                fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)] [&>button]:order-2 [&>label]:order-1'}
                labelClassName={'justify-end self-start text-right pt-1'}
              />
            </div>

            <CustomFormField
              type='number'
              name='order'
              label='Order'
              control={control}
              register={register}
              errors={errors}
              placeholder='Enter order number'
              disabled={isLoading}
              fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)]'}
              labelClassName={'justify-end self-start text-right pt-1'}
            />
          </div>
        )}

        <div className={cn('space-y-2', !isViewMode && 'grid grid-cols-[128px_minmax(0,1fr)] pt-2')}>
          {!isViewMode && (
            <Label className='text-xs font-normal justify-end self-start text-right pt-1 gap-0'>
              Content<span className='text-destructive'>*</span>
            </Label>
          )}
          <div className={!isViewMode ? '' : 'ml-2'}>
            {isViewMode ? (
              <div
                className='text-sm text-popover-foreground pt-1 [&_ul]:list-disc [&_ul]:pl-10 [&_ol]:list-decimal [&_ol]:pl-10 [&_li]:mt-1 [&_p]:mt-2 first:[&_p]:mt-0'
                dangerouslySetInnerHTML={{ __html: watch('template_message') || '' }}
              />
            ) : (
              <Controller
                name='template_message'
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <TipTapRichTextEditor
                      ref={editorRef}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Enter template content...'
                      disabled={isLoading}
                    />
                    {fieldState.error && <p className='text-red-500 text-xs mt-1'>{fieldState.error.message}</p>}
                  </>
                )}
              />
            )}
          </div>
        </div>
      </form>
    </CommonDialog>
  )
}
