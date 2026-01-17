export interface ContactFormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  projectType: string
  projectDescription: string
  timeline: string
  hearAboutUs: string
  privacy: boolean
}

export interface ContactFormSubmitStatus {
  type: 'success' | 'error'
  message: string
}
