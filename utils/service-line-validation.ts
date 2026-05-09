export type ServiceLineFieldErrors = Record<string, string>

export type ServiceLineErrors = Record<number, Record<number, ServiceLineFieldErrors>>

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key)

const setLineError = (
  errors: ServiceLineErrors,
  serviceIndex: number,
  itemIndex: number,
  field: string,
  message: string
) => {
  if (!Number.isInteger(serviceIndex) || !Number.isInteger(itemIndex) || !field || !message) return

  if (!errors[serviceIndex]) {
    errors[serviceIndex] = {}
  }

  if (!errors[serviceIndex][itemIndex]) {
    errors[serviceIndex][itemIndex] = {}
  }

  errors[serviceIndex][itemIndex][field] = message
}

const getFirstMessage = (value: unknown): string | null => {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    const firstString = value.find(item => typeof item === 'string')

    return typeof firstString === 'string' ? firstString : null
  }

  return null
}

const assignFromPath = (path: string, value: unknown, output: ServiceLineErrors) => {
  const match = path.match(/(?:^|.*\.)services\.(\d+)\.items\.(\d+)\.([^.[\]]+)$/)

  if (!match) return

  const message = getFirstMessage(value)

  if (!message) return

  const serviceIndex = Number(match[1])
  const itemIndex = Number(match[2])
  const field = match[3]

  setLineError(output, serviceIndex, itemIndex, field, message)
}

const assignFromFlatErrorEntries = (node: unknown, output: ServiceLineErrors) => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return

  Object.entries(node).forEach(([key, value]) => {
    assignFromPath(key, value, output)
  })
}

const assignFromMessageFallback = (error: any, output: ServiceLineErrors) => {
  const message =
    (typeof error?.message === 'string' && error.message) ||
    (typeof error?.error?.message === 'string' && error.error.message) ||
    (typeof error?.data?.message === 'string' && error.data.message) ||
    (typeof error?.response?.data?.message === 'string' && error.response.data.message) ||
    ''

  if (!message) return

  const directPathMatch = message.match(/services\.(\d+)\.items\.(\d+)\.([^\s]+)\s+field/i)

  if (directPathMatch) {
    setLineError(output, Number(directPathMatch[1]), Number(directPathMatch[2]), directPathMatch[3], message)

    return
  }

  const humanizedMatch = message.match(/service\s+(\d+)\s+item\s+(\d+)\s+([a-zA-Z_]+)\s+field/i)

  if (!humanizedMatch) return

  const serviceIndex = Number(humanizedMatch[1]) - 1
  const itemIndex = Number(humanizedMatch[2]) - 1
  const field = humanizedMatch[3].toLowerCase()

  setLineError(output, serviceIndex, itemIndex, field, message)
}

const visit = (node: unknown, path: string, output: ServiceLineErrors) => {
  if (typeof node === 'string' || Array.isArray(node)) {
    assignFromPath(path, node, output)

    return
  }

  if (!node || typeof node !== 'object') return

  if (Array.isArray(node)) {
    node.forEach((value, index) => {
      const nextPath = path ? `${path}.${index}` : `${index}`

      visit(value, nextPath, output)
    })

    return
  }

  Object.entries(node).forEach(([key, value]) => {
    const nextPath = path ? `${path}.${key}` : key

    visit(value, nextPath, output)
  })
}

export const extractServiceLineErrors = (error: any): ServiceLineErrors => {
  const output: ServiceLineErrors = {}

  const candidates = [
    error,
    error?.errors,
    error?.data,
    error?.data?.errors,
    error?.error,
    error?.error?.errors,
    error?.response,
    error?.response?.data,
    error?.response?.data?.errors
  ]

  candidates.forEach(root => {
    if (!root || typeof root !== 'object') return

    assignFromFlatErrorEntries(root, output)

    if (hasOwn(root, 'services') && Array.isArray((root as any).services)) {
      ;(root as any).services.forEach((serviceError: any, serviceIndex: number) => {
        if (!serviceError || typeof serviceError !== 'object') return

        const serviceItems = serviceError.items

        if (!serviceItems || typeof serviceItems !== 'object') return

        const itemEntries = Array.isArray(serviceItems)
          ? serviceItems.map((itemError: any, itemIndex: number) => [String(itemIndex), itemError] as const)
          : Object.entries(serviceItems)

        itemEntries.forEach(([itemKey, itemError]) => {
          if (!itemError || typeof itemError !== 'object') return

          const itemIndex = Number(itemKey)

          if (!Number.isInteger(itemIndex)) return

          Object.entries(itemError).forEach(([field, value]) => {
            const message = getFirstMessage(value)

            if (message) {
              setLineError(output, serviceIndex, itemIndex, field, message)
            }
          })
        })
      })
    }

    visit(root, '', output)
  })

  assignFromMessageFallback(error, output)

  return output
}

export const hasServiceLineErrors = (errors: ServiceLineErrors) => Object.keys(errors).length > 0
