import ProposalService from '@/services/api/estimates/proposals.service'
import { Proposal, ProposalHistory } from '@/types'
import ProposalView from '@/views/estimation/ProposalView'

const demoProposal: Proposal = {
  id: '6c5612c9-2248-40aa-af8d-7a5f5220d893',
  estimate_id: '452a0da9-06fc-4cf4-bc91-62aa7d367818',
  discount: 217.5,
  subtotal: 2175.0,
  sale_tax: 0.0,
  total: 2175.0,
  message: null,
  proposal_number: 1,
  discount_type: 'percentage',

  // created_by: '1f182dde-e800-4810-a996-ce763f00274b',
  created_at: '2026-02-05T11:45:17.000000Z',
  updated_at: '2026-02-05T11:45:17.000000Z',
  estimate: {
    id: '452a0da9-06fc-4cf4-bc91-62aa7d367818',
    estimate_number: 1,
    service_type_id: '65e9ff38-05ea-4c0c-b1e7-073f04ecad3a',
    estimate_type_id: '777f0aef-e791-41e7-b811-da53126cbedb',
    client_id: '8778ae3d-3bef-44eb-bb28-930f473fec06',
    assign_id: '1f182dde-e800-4810-a996-ce763f00274b',
    payment_term_id: '8419aae6-af6f-404c-8bfb-54eb27612eed',
    title: 'Voluptate nihil atqu',
    location: 'New York, NY, USA, New York City, New York, 45874',
    expiration_date: '2026-02-20',
    biding_date: '2026-02-27',
    status: 'Pending',
    take_off_data: {
      zoom: 19,
      center: {
        lat: 40.7127753,
        lng: -74.0059728
      },
      address: 'New York, NY, USA, New York City, New York, 45874',
      polygons: [
        {
          id: '1770291995226',
          area: {
            squareFeet: 19592.907935263993,
            squareMeters: 1820.242471154878
          },
          name: 'Area #1',
          color: {
            fill: '#3b82f6',
            name: 'Blue',
            stroke: '#2563eb'
          },
          notes: null,
          paths: [
            [
              {
                lat: 40.71281410426127,
                lng: -74.00644215605189
              },
              {
                lat: 40.71274802901395,
                lng: -74.00632950327326
              },
              {
                lat: 40.71279987267511,
                lng: -74.00628524682452
              },
              {
                lat: 40.71259046469797,
                lng: -74.00586011669566
              },
              {
                lat: 40.71254167051159,
                lng: -74.00590705535342
              },
              {
                lat: 40.712480677728365,
                lng: -74.00579708478381
              },
              {
                lat: 40.712732780870624,
                lng: -74.00559994242121
              },
              {
                lat: 40.71284561704846,
                lng: -74.0058145191424
              },
              {
                lat: 40.71287204711653,
                lng: -74.00579037926127
              },
              {
                lat: 40.712961502653705,
                lng: -74.00597276947428
              },
              {
                lat: 40.71293100646136,
                lng: -74.00600361487795
              },
              {
                lat: 40.71304892499433,
                lng: -74.00623428485324
              },
              {
                lat: 40.71281410426127,
                lng: -74.00644215605189
              }
            ],
            [
              {
                lat: 40.71284155088321,
                lng: -74.00628390572001
              },
              {
                lat: 40.71286391478904,
                lng: -74.0062651302569
              },
              {
                lat: 40.712812071177744,
                lng: -74.00616722962786
              },
              {
                lat: 40.71279275688086,
                lng: -74.006191369509
              },
              {
                lat: 40.71284155088321,
                lng: -74.00628390572001
              }
            ],
            [
              {
                lat: 40.71264840774782,
                lng: -74.0059043731444
              },
              {
                lat: 40.71267585443806,
                lng: -74.0058869387858
              },
              {
                lat: 40.71262807685889,
                lng: -74.0057957436793
              },
              {
                lat: 40.71260469632892,
                lng: -74.0058131780379
              },
              {
                lat: 40.71264840774782,
                lng: -74.0059043731444
              }
            ]
          ],
          perimeter: {
            yards: 290.94116480546995,
            meters: 266.0374034669306
          }
        },
        {
          id: '1770292122511',
          area: {
            squareFeet: 9911.256370354655,
            squareMeters: 920.7867381111544
          },
          name: 'Area #2',
          color: {
            fill: '#22c55e',
            name: 'Green',
            stroke: '#16a34a'
          },
          notes: null,
          paths: [
            {
              lat: 40.71291657209929,
              lng: -74.00644519673605
            },
            {
              lat: 40.712856911467775,
              lng: -74.00632919119616
            },
            {
              lat: 40.712906508863995,
              lng: -74.00628091143389
            },
            {
              lat: 40.712856911467775,
              lng: -74.0061662469985
            },
            {
              lat: 40.71288278837476,
              lng: -74.00615954147597
            },
            {
              lat: 40.71279940719401,
              lng: -74.00598519789
            },
            {
              lat: 40.71276562341004,
              lng: -74.00598519789
            },
            {
              lat: 40.71273902765315,
              lng: -74.00591948376913
            },
            {
              lat: 40.71259670423297,
              lng: -74.00592350708266
            },
            {
              lat: 40.71260820512671,
              lng: -74.00594094144125
            },
            {
              lat: 40.712567951989946,
              lng: -74.00596306966563
            },
            {
              lat: 40.712577296470286,
              lng: -74.00597916291972
            },
            {
              lat: 40.71255501347653,
              lng: -74.00600062059183
            },
            {
              lat: 40.71268152327758,
              lng: -74.00624470161219
            },
            {
              lat: 40.712731120804435,
              lng: -74.00620513902922
            },
            {
              lat: 40.71277568666663,
              lng: -74.0062835936429
            },
            {
              lat: 40.71272177634567,
              lng: -74.00632315622587
            },
            {
              lat: 40.71277640547062,
              lng: -74.00644787894507
            }
          ],
          perimeter: {
            yards: 177.10037339395646,
            meters: 161.94106984570044
          }
        },
        {
          id: '1770292296680',
          area: {
            squareFeet: 17337.92706695802,
            squareMeters: 1610.7476906100965
          },
          name: 'Area #3',
          color: {
            fill: '#22c55e',
            name: 'Green',
            stroke: '#16a34a'
          },
          notes: null,
          paths: [
            {
              lat: 40.71356542948255,
              lng: -74.00428006516985
            },
            {
              lat: 40.71283944210747,
              lng: -74.00429615842394
            },
            {
              lat: 40.71272155826188,
              lng: -74.00406280623965
            },
            {
              lat: 40.71346479804175,
              lng: -74.00405073629908
            }
          ],
          perimeter: {
            yards: 229.21253307506373,
            meters: 209.59257237503655
          }
        },
        {
          id: '1770292310719',
          area: {
            squareFeet: 35514.710572789925,
            squareMeters: 3299.427769933753
          },
          name: 'Area #4',
          color: {
            fill: '#ef4444',
            name: 'Red',
            stroke: '#dc2626'
          },
          notes: null,
          paths: [
            {
              lat: 40.713460485262296,
              lng: -74.00404537188105
            },
            {
              lat: 40.71358699334292,
              lng: -74.00356257425837
            },
            {
              lat: 40.71286100620297,
              lng: -74.00357196198992
            },
            {
              lat: 40.712733059134045,
              lng: -74.00406012403063
            }
          ],
          perimeter: {
            yards: 271.7546972887989,
            meters: 248.49324465650363
          }
        },
        {
          id: '1770292334399',
          area: {
            squareFeet: 25444.075515867702,
            squareMeters: 2363.834253000093
          },
          name: 'Area #5',
          color: {
            fill: '#f59e0b',
            name: 'Orange',
            stroke: '#d97706'
          },
          notes: null,
          paths: [
            {
              lat: 40.71358986852377,
              lng: -74.00355855094485
            },
            {
              lat: 40.71397226647129,
              lng: -74.00320181714586
            },
            {
              lat: 40.71322471956158,
              lng: -74.00322327481798
            },
            {
              lat: 40.71285956859681,
              lng: -74.00355855094485
            }
          ],
          perimeter: {
            yards: 291.1104545449482,
            meters: 266.1922024715833
          }
        }
      ],
      totalArea: {
        squareFeet: 107800.8774612343,
        squareMeters: 10015.038922809976
      }
    },
    created_at: '2026-02-05T11:43:10.000000Z',
    updated_at: '2026-02-05T11:53:11.000000Z',
    assign_user: {
      id: '1f182dde-e800-4810-a996-ce763f00274b',
      userable_id: 'fa5e09c8-4df5-4f31-b76b-1282df8cebc9',
      userable_type: 'Modules\\Auth\\Models\\UserDetails',
      first_name: 'MD Al Arman',
      last_name: 'Sorker',
      guard: 'admin',
      status: true,
      email: 'mdalarmansorker@gmail.com',
      email_verified_at: null,
      deleted_at: null,
      created_at: '2026-02-04T04:17:58.000000Z',
      updated_at: '2026-02-04T04:17:58.000000Z',
      user_type: 'tenant'
    },
    client: {
      id: '8778ae3d-3bef-44eb-bb28-930f473fec06',
      company_id: null,
      clientable_id: 'cf52bb83-5bf7-4fee-ba05-9610adb4c675',
      clientable_type: 'Modules\\Client\\Models\\Customer',
      interest_level_id: 'fc664047-d6a7-4046-af7a-2c77a0e79b28',
      contact_type_id: 'a9e586a3-584d-4923-9583-83077a99c514',
      reference_id: '1f182dde-e800-4810-a996-ce763f00274b',
      location_id: 'ffdd8428-f5d9-4cad-ab75-2e015bac3a36',
      first_name: 'Driscoll',
      last_name: 'Frank',
      display_name: 'Yael Carney',
      type: 'customer',
      phone: '+1 (808) 266-4271',
      email: 'tyho@mailinator.com',
      source_id: '274410fe-6ae4-4c30-81a7-b886a3ce9234',
      lead_cost: 40.0,
      status: 0,
      created_at: '2026-02-05T11:42:39.000000Z',
      updated_at: '2026-02-05T11:42:39.000000Z',
      deleted_at: null,
      address: {
        id: 'client-address-1',
        addressable_id: '8778ae3d-3bef-44eb-bb28-930f473fec06',
        addressable_type: 'Modules\\Client\\Models\\Client',
        title: 'Home',
        street_address: '123 Main St, New York, NY 10001',
        state_id: 'state-id-123',
        city_id: 'city-id-123',
        email: 'home@example.com',
        phone: '+1 (555) 123-4567',
        is_default: 1,
        zip_code: '10001',
        created_at: '2026-02-05T11:42:39.000000Z',
        updated_at: '2026-02-05T11:42:39.000000Z',
        city: {
          id: 'city-id-123',
          name: 'New York City',
          created_at: '2026-01-15T10:00:00.000000Z',
          updated_at: '2026-01-15T10:00:00.000000Z',
          state_id: 'state-id-123',
          country_id: 'country-id-123',
          state: {
            id: 'state-id-123',
            name: 'New York',
            created_at: '2026-01-10T10:00:00.000000Z',
            updated_at: '2026-01-10T10:00:00.000000Z',
            country_id: 'country-id-123',
            country: {
              id: 'country-id-123',
              name: 'United States',
              code: 'US',
              created_at: '2026-01-01T10:00:00.000000Z',
              updated_at: '2026-01-01T10:00:00.000000Z'
            }
          }
        },
        state: {
          id: 'state-id-123',
          name: 'New York',
          created_at: '2026-01-10T10:00:00.000000Z',
          updated_at: '2026-01-10T10:00:00.000000Z',
          country_id: 'country-id-123',
          country: {
            id: 'country-id-123',
            name: 'United States',
            code: 'US',
            created_at: '2026-01-01T10:00:00.000000Z',
            updated_at: '2026-01-01T10:00:00.000000Z'
          }
        }
      }
    }
  },
  services: [
    {
      id: '8be0cc4e-2872-4790-bb23-3af528854a1e',
      proposal_id: '6c5612c9-2248-40aa-af8d-7a5f5220d893',
      proposal_estimate_id: '452a0da9-06fc-4cf4-bc91-62aa7d367818',
      service_type_id: 'f961ff47-d9d3-4927-aca2-c0b88d6bee21',
      material_cost: 0.0,
      material_tax: 0.0,
      labor_cost: 1000.0,
      freight_cost: 0.0,
      freight_charge: 0.0,
      expense_cost: 0.0,
      sale_tax: 0.0,
      total_sale: 2175.0,
      material_sale: 0.0,
      labor_sale: 1500.0,

      // invoice_cost: 450.00,
      // invoice_sale: 675.00,
      profit: 725.0,

      // total_deduction: 0.00,
      // total_discount: 217.50,
      created_at: '2026-02-05T11:45:17.000000Z',
      updated_at: '2026-02-05T11:45:17.000000Z',
      service_type: {
        id: 'f961ff47-d9d3-4927-aca2-c0b88d6bee21',
        name: 'Potholes',
        created_at: '2026-02-04T06:24:53.000000Z',
        updated_at: '2026-02-04T06:24:53.000000Z',
        wasted_percent: 0.0,
        abbreviation: 'PH',
        is_editable: 1
      },
      items: [
        {
          id: 'c55a3a9f-4453-45ee-9ed4-3f4336d87dd2',
          proposal_service_id: '8be0cc4e-2872-4790-bb23-3af528854a1e',
          service_type_id: 'f961ff47-d9d3-4927-aca2-c0b88d6bee21',
          name: 'Product 1',
          description: 'Test',
          type: 'invoice',
          unit_cost: 30.0,
          qty: 15,
          total_cost: 450.0,
          margin: 40.0,
          unit_price: 45.0,
          unit_name: null,
          total_price: 675.0,
          discount: 10.0,
          tax: 0.0,
          tax_amount: 0.0,
          freight_charge: 0.0,
          discount_type: 'percentage',
          tax_type: 'percentage',
          note: null,
          is_sale: 0,
          created_at: '2026-02-05T11:45:17.000000Z',
          updated_at: '2026-02-05T11:45:17.000000Z'
        },
        {
          id: 'd0a08296-a1a6-40bc-92ce-222a7c9140da',
          proposal_service_id: '8be0cc4e-2872-4790-bb23-3af528854a1e',
          service_type_id: 'f961ff47-d9d3-4927-aca2-c0b88d6bee21',
          name: 'Labor 1',
          description: 'Test',
          type: 'labor',
          unit_cost: 100.0,
          qty: 10,
          total_cost: 1000.0,
          margin: 40.0,
          unit_price: 150.0,
          unit_name: null,
          total_price: 1500.0,
          discount: 10.0,
          tax: 0.0,
          freight_charge: 0.0,
          tax_amount: 0.0,
          discount_type: 'percentage',
          tax_type: 'percentage',
          note: null,
          is_sale: 0,
          created_at: '2026-02-05T11:45:17.000000Z',
          updated_at: '2026-02-05T11:45:17.000000Z'
        }
      ]
    }
  ]
}

const ProposalDetailsPage = async ({ searchParams }: { searchParams: any }) => {
  // get the token and proposal id from search params
  const { p_id, qc_id, iscus } = await searchParams
  let proposal: Proposal | null = null
  let proposalHistories: ProposalHistory[] = []

  try {
    const response = await ProposalService.viewProposal(p_id, qc_id, iscus)

    proposal = response?.data?.proposal ?? null
    proposalHistories = response?.data?.histories ?? []
  } catch (error) {
    console.log('Error fetching proposal details, using demo data', error)
    proposal = null
    proposalHistories = []
  }

  if (!proposal) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Proposal Not Found</h2>
        <p className='text-gray-600'>The proposal you are looking for does not exist or has been deleted.</p>
      </div>
    )
  }

  return <ProposalView proposal={proposal} proposalHistories={proposalHistories} />
}

export default ProposalDetailsPage
