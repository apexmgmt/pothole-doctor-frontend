import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ClientAddress } from '@/types'

interface TaskLocationAndCommentFieldsProps {
  form: any
  selectedClient: any
  addressOptions: ClientAddress[]
}

export function TaskLocationAndCommentFields({
  form,
  selectedClient,
  addressOptions
}: TaskLocationAndCommentFieldsProps) {
  return (
    <>
      {/* Location field (address select) */}
      <FormField
        control={form.control}
        name='location'
        render={({ field }) => (
          <FormItem className='col-span-1 lg:col-span-2'>
            <FormLabel>Event Location</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedClient}>
                <SelectTrigger className='w-full! min-w-0!'>
                  <SelectValue placeholder={selectedClient ? 'Select Address' : 'Select Customer first'} />
                </SelectTrigger>
                <SelectContent className='w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]'>
                  {addressOptions.length === 0 ? (
                    <div className='px-3 py-2 text-muted-foreground text-sm '>No addresses found</div>
                  ) : (
                    addressOptions.map(address => {
                      const value = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
                        .filter(Boolean)
                        .join(', ')

                      return (
                        <SelectItem key={address.id} value={value} className='whitespace-normal wrap-break-words'>
                          {address.title} - {value}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
