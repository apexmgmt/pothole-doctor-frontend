const FALLBACK_COLOR = '#0ea5e9'

/**
 * Generates a stable 32-bit hash using FNV-1a.
 * This ensures identical IDs always map to the same color.
 */
const hashString = (value: string): number => {
  let hash = 2166136261

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

/**
 * Converts HSL values to a hex color string.
 */
const hslToHex = (h: number, s: number, l: number): string => {
  const saturation = s / 100
  const lightness = l / 100

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - c / 2

  let rPrime = 0
  let gPrime = 0
  let bPrime = 0

  if (h < 60) {
    rPrime = c
    gPrime = x
  } else if (h < 120) {
    rPrime = x
    gPrime = c
  } else if (h < 180) {
    gPrime = c
    bPrime = x
  } else if (h < 240) {
    gPrime = x
    bPrime = c
  } else if (h < 300) {
    rPrime = x
    bPrime = c
  } else {
    rPrime = c
    bPrime = x
  }

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`
}

/**
 * Returns a deterministic color for a given key.
 * Useful for assigning stable colors to contractors/schedules across refreshes.
 */
export const getPaletteColorByKey = (key?: string): string => {
  const safeKey = (key || '').trim()

  if (!safeKey) {
    return FALLBACK_COLOR
  }

  const hash = hashString(safeKey)

  const hue = hash % 360
  const saturation = 62 + (hash % 18)
  const lightness = 44 + ((hash >> 8) % 12)

  return hslToHex(hue, saturation, lightness)
}
