export interface ProfileDetailsPayload {
  first_name: string
  last_name: string
  phone: string
  address: string
}

export interface ProfileChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface LoginActivities {
  current_activity: LoginActivity
  previous_activity: LoginActivity[]
}

export interface LoginActivity {
  login_at: string
  type: string
  device_type: string
  device_name: string
  platform: string
  platform_version: string
  browser: string
  browser_version: string
  is_robot: boolean
  is_mobile: boolean
  is_tablet: boolean
  is_desktop: boolean
  ip_address: string
  user_agent: string
  method: string
  endpoint: string
  full_url: string
}
