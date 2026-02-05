import { Proposal } from '@/types'
import ProposalView from '@/views/estimation/ProposalView'

const demoProposal: Proposal = {
  id: 'proposal-demo-id',
  proposal_number: 1001,
  estimate_id: 'estimate-demo-id',
  discount: 10,
  discount_type: 'percentage',
  subtotal: 3300.0,
  sale_tax: 231.0,
  total: 3201.0,
  message:
    "Scope Notes: While we will fill the cracks, concrete moves over time. As a result, we cannot guarantee that future movement won't cause stress cracks. A 50% deposit is required to reserve a spot on our schedule.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  estimate: {
    id: 'estimate-demo-id',
    estimate_number: 12345,
    status: 'active',
    title: 'Commercial Parking Lot Restoration',
    location: '708-D Fairground Rd, Lucasville, OH 45648',
    client_id: 'client-id-999',
    client: {
      id: 'client-id-999',
      company_id: 'company-id-123',
      interest_level_id: 'interest-level-1',
      clientable_id: 'clientable-id-456',
      clientable_type: 'ClientAbleType',
      reference_id: 'staff-id-777',
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'John Doe',
      type: 'customer',
      phone: '555-1234',
      email: 'john.doe@example.com',
      source_id: 'source-id-321',
      lead_cost: 0,
      status: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      contact_type_id: null,
      location_id: null,
      company: {
        id: 'company-id-123',
        name: 'Pothole Doctor Inc.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      clientable: {
        id: 'clientable-id-456',
        spouse_name: 'Jane Doe',
        spouse_phone: '555-5678',
        cell_phone: '555-8765',
        cc_email: 'jane.doe@example.com',
        pre_qualified_amount: 5000,
        is_tax_exempt: 0,
        is_quick_book: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        best_time: 'Afternoon'
      },
      address: {
        id: 'address-id-001',
        addressable_id: 'client-id-999',
        addressable_type: 'Client',
        title: 'Main Office',
        street_address: '123 Main St, Lucasville, OH 45648',
        state_id: 'state-id-01',
        state: {
          id: 'state-id-01',
          name: 'Ohio',
          country_id: 'country-id-01',
          country: {
            id: 'country-id-01',
            name: 'United States',
            code: 'US',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        city_id: 'city-id-01',
        city: {
          id: 'city-id-01',
          state_id: 'state-id-01',
          state: {
            id: 'state-id-01',
            name: 'Ohio',
            country_id: 'country-id-01',
            country: {
              id: 'country-id-01',
              name: 'United States',
              code: 'US',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          country_id: 'country-id-01',
          name: 'Lucasville',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        email: 'contact@potholedoctor.com',
        phone: '555-1234',
        is_default: 1,
        zip_code: '45648',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    estimate_type_id: 'type-id-001',
    assign_id: 'staff-id-777',
    service_type_id: 'service-type-1',
    payment_term_id: 'pay-term-1',
    expiration_date: '2026-03-05',
    biding_date: '2026-02-05',
    take_off_data: {
      address: '708-D Fairground Rd, Lucasville, OH 45648',
      center: { lat: 38.8821, lng: -82.9912 },
      zoom: 18,
      polygons: [
        {
          id: 'poly-1',
          paths: [{ lat: 38.8821, lng: -82.9912 }],
          color: { fill: '#ff0000', stroke: '#ff0000', name: 'Red' },
          area: { squareFeet: 5000, squareMeters: 464.5 },
          perimeter: { yards: 100, meters: 91.4 },
          name: 'Main Lot',
          notes: 'Heavily cracked area'
        }
      ],
      totalArea: { squareFeet: 5000, squareMeters: 464.5 }
    },
    assign_user: {
      id: 'staff-id-777',
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice.smith@example.com',
      guard: 'staff',
      userable: {
        id: 'userable-id-888',
        profile_picture: null,
        address: '456 Elm St, Springfield, IL 62701',
        phone: '555-4321',
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  services: [
    {
      id: 'service-1',
      proposal_id: 'proposal-demo-id',
      proposal_estimate_id: 'prop-est-1',
      service_type_id: 'service-type-1',
      service_type: {
        id: 'service-type-1',
        name: 'Industrial Coating',
        is_editable: 1,
        wasted_percent: 5,
        abbreviation: 'IC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      material_cost: 2000,
      material_tax: 140,
      labor_cost: 800,
      freight_cost: 50,
      expense_cost: 100,
      sale_tax: 231,
      total_sale: 3300,
      material_sale: 2300,
      labor_sale: 1000,
      profit: 350,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          proposal_service_id: 'service-1',
          service_type_id: 'service-type-1',
          name: 'Premium Metallic Epoxy',
          description: 'High-durability industrial metallic coating with high gloss finish.',
          type: 'product',
          unit_cost: 1500,
          qty: 1,
          total_cost: 1500,
          margin: 25,
          unit_price: 2000,
          unit_name: 'Gallon',
          total_price: 2000,
          discount: 0,
          tax: 7,
          discount_type: 'percentage',
          tax_type: 'percentage',
          note: 'Requires 24h curing',
          is_sale: 1,
          tax_amount: 140,
          freight_charge: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: {
            id: 'prod-001',
            name: 'Premium Metallic Epoxy',
            sku: 'EPI-MET-001',
            category_id: 'cat-1',
            vendor_id: 'ven-1',
            slug: 'premium-metallic-epoxy',
            is_rolled_good: '0',
            vendor_product_name: 'Industrial Metal Pro',
            vendor_style: 'Smooth',
            vendor_color: 'Silver',
            private_product_name: 'Pothole Doctor Silver',
            private_style: 'Gloss',
            private_color: 'Metallic Silver',
            collection: '2026 Pro Line',
            dropped_date: '2026-12-31',
            description: 'Professional grade coating',
            purchase_uom: 'Bucket',
            uom_info: { carton_per_pallet: 20, piece_per_carton: 1, lb: 45 },
            coverage_per_uom: {
              value: 250,
              unit: { id: 'u-1', name: 'sqft', group: 'uom', created_at: '', updated_at: '' }
            },
            product_cost: 1500,
            margin: 25,
            selling_info: {
              value: 2000,
              unit: { id: 'u-1', name: 'sqft', group: 'uom', created_at: '', updated_at: '' }
            },
            minimum_qty: 1,
            round_up_quantity: 1,
            type: 'inventory',
            is_notify: 1,
            visible: 1,
            is_freight_percentage: 0,
            is_discontinued_product: 0,
            comments: 'Top seller',
            status: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null
          }
        },
        {
          id: 'item-2',
          proposal_service_id: 'service-1',
          service_type_id: 'service-type-1',
          name: 'Surface Prep & Grinding',
          description: 'Mechanical diamond grinding to ensure proper adhesion.',
          type: 'labor',
          unit_cost: 500,
          qty: 1,
          total_cost: 500,
          margin: 50,
          unit_price: 1000,
          unit_name: 'Project',
          total_price: 1000,
          discount: 0,
          tax: 0,
          discount_type: 'fixed',
          tax_type: 'fixed',
          note: 'Includes waste removal',
          is_sale: 1,
          tax_amount: 0,
          freight_charge: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labor_cost: {
            id: 'labor-001',
            name: 'Standard Grinding',
            description: 'Prep labor',
            cost: 500,
            price: 1000,
            margin: 50,
            service_type_id: 'service-type-1',
            unit_id: 'u-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ]
    }
  ]
}

const ProposalDetailsPage = async ({ searchParams }: { searchParams: any }) => {
  // get the token and proposal id from search params
  const { token, proposal_id } = await searchParams

  // fetch the proposal

  return <ProposalView proposal={demoProposal} />
}

export default ProposalDetailsPage
