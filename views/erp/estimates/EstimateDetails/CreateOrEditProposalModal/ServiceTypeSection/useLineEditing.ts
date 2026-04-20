import { useState } from 'react'

export const useLineEditing = () => {
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({})

  const getEditValue = (idx: number, field: string, fallback: string) =>
    editingValues[`${idx}-${field}`] !== undefined ? editingValues[`${idx}-${field}`] : fallback

  const setEditValue = (idx: number, field: string, value: string) =>
    setEditingValues(prev => ({ ...prev, [`${idx}-${field}`]: value }))

  const clearEditValue = (idx: number, field: string) =>
    setEditingValues(prev => {
      const next = { ...prev }

      delete next[`${idx}-${field}`]

      return next
    })

  return { getEditValue, setEditValue, clearEditValue }
}
