export const SCHEDULE_PALETTE: string[] = [
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#f97316', // orange
  '#22c55e', // green
  '#ec4899', // pink
  '#eab308', // yellow
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#d946ef', // fuchsia
  '#64748b', // slate
  '#0d9488', // teal-600
  '#7c3aed', // violet-600
  '#b45309', // amber-700
  '#15803d', // green-700
  '#be185d', // pink-700
  '#1d4ed8', // blue-700
  '#0891b2', // cyan-600
  '#9333ea', // purple-600
  '#dc2626', // red-600
  '#65a30d', // lime-600
  '#0284c7', // sky-600
  '#c026d3', // fuchsia-600
  '#16a34a', // green-600
  '#ea580c', // orange-600
  '#7c3aed', // violet-600
  '#0f766e', // teal-700
  '#4f46e5' // indigo-600
]

export const getPaletteColorByKey = (key?: string): string => {
  const safeKey = (key || '').trim()

  if (!safeKey) {
    return SCHEDULE_PALETTE[0]
  }

  const hash = safeKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  return SCHEDULE_PALETTE[hash % SCHEDULE_PALETTE.length]
}
