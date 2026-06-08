import CustomFormField from '@/components/form/CustomFormField'
import { Search } from 'lucide-react'
import { FC } from 'react'

type Props = {
  label?: string
  name?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

const TableSearch: FC<Props> = ({ name, label, value, onChange, placeholder = 'Search', className }) => {
  return (
    <div className={`relative ${className}`}>
      <CustomFormField
        type='text'
        name={name ?? 'search'}
        label={label}
        placeholder={placeholder ?? 'Search...'}
        value={value}
        onChange={v => onChange(v as string)}
        className='ps-6!'
      />

      <Search className='size-3 absolute left-2 bottom-2' />
    </div>
  )
}

export default TableSearch
