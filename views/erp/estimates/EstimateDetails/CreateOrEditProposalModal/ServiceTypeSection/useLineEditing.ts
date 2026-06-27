import { useState } from 'react'

/**
 * Custom hook to manage temporary editing state for line items.
 * It tracks in-progress text inputs (like quantities or prices) before they are committed
 * to the main state, preventing immediate recalculations on every keystroke.
 * 
 * @returns An object containing methods to get, set, and clear temporary editing values.
 */
export const useLineEditing = () => {
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({})

  /**
   * Retrieves the current temporary editing value for a specific field on a line item.
   * If the field is not currently being edited, it returns the provided fallback value.
   * 
   * @param idx - The index of the line item.
   * @param field - The name of the field being edited.
   * @param fallback - The original value to fall back to if no temporary edit exists.
   * @returns The temporary edit string, or the fallback value.
   */
  const getEditValue = (idx: number, field: string, fallback: string) =>
    editingValues[`${idx}-${field}`] !== undefined ? editingValues[`${idx}-${field}`] : fallback

  /**
   * Sets a temporary editing value for a specific field on a line item.
   * This is typically called on `onChange` events for text inputs.
   * 
   * @param idx - The index of the line item.
   * @param field - The name of the field being edited.
   * @param value - The new temporary string value.
   */
  const setEditValue = (idx: number, field: string, value: string) =>
    setEditingValues(prev => ({ ...prev, [`${idx}-${field}`]: value }))

  /**
   * Clears the temporary editing value for a specific field on a line item.
   * This is typically called on `onBlur` or when the edit is committed/cancelled.
   * 
   * @param idx - The index of the line item.
   * @param field - The name of the field to clear from the editing state.
   */
  const clearEditValue = (idx: number, field: string) =>
    setEditingValues(prev => {
      const next = { ...prev }

      delete next[`${idx}-${field}`]

      return next
    })

  return { getEditValue, setEditValue, clearEditValue }
}
