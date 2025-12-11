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

