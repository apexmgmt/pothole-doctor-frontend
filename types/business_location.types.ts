export interface BusinessLocationPayload {
    name: string;
    email: string;
    phone: string;
    fax?: string;
    is_branding: number | 0 | 1;
    logo?: File;
    website?: string;
    invoice_prefix?: string;
    sales_tax?: number;
    review_link?: string;
    street_address: string;
    city_id?: string;
    state_id?: string;
    zip_code?: string;
}
