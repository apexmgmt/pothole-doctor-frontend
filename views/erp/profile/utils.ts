export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateString
  }
}

export const getUserDisplayData = (userData: any) => {
  const firstName = userData?.first_name || ''
  const lastName = userData?.last_name || ''
  const fullName = userData?.name || [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const email = userData?.email || '---'
  const phone = userData?.userable?.phone || userData?.phone || 'N/A'
  const address = userData?.userable?.address || userData?.address || 'N/A'
  const profilePicture = userData?.profile_picture || userData?.userable?.profile_picture || '/images/avatar.webp'

  return {
    firstName,
    lastName,
    fullName,
    email,
    phone,
    address,
    profilePicture
  }
}

