'use client'

import React, { useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  Box,
  Boxes,
  Building2,
  CalendarCheck,
  LocateIcon,
  Map,
  Package,
  TruckIcon,
  UserLock,
  Users,
  Users2,
  Warehouse
} from 'lucide-react'

import { NavigationItem } from '@/types'
import { filterMenuByPermissions } from '@/utils/menu-permissions'

import { SettingsIcon, HomeIcon } from '@/public/icons'
import SidebarFooter from './SidebarFooter'
import MenuItem from './menu-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSidebar } from './sidebarContext'
import { useSidebarData } from './sidebarDataContext'
import TaskIcon from '@/public/icons/TaskIcon'
import EstimateIcon from '@/public/icons/Estimate'
import InvoiceIcon from '@/public/icons/Invoice'
import WorkOrderIcon from '@/public/icons/WorkOrderIcon'
import MaterialJobIcon from '@/public/icons/MaterialJobIcon'

const Sidebar: React.FC = () => {
  const { user, permissions } = useSidebarData()
  const iconSize = 'size-3.5'

  const allNavigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className={iconSize} />,
      href: '/erp',
      hasSubItems: false,
      exactMatch: true

      // No permissions = always visible
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: <Building2 className={iconSize} />,
      href: '/erp/companies',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Company']
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users2 className={iconSize} />,
      href: '/erp/leads',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Lead']
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <UserLock className={iconSize} />,
      href: '/erp/customers',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Customer']
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <TaskIcon className={iconSize} />,
      href: '/erp/tasks',
      hasSubItems: true,
      exactMatch: false,
      subItems: [
        {
          id: 'tasks',
          label: 'List',
          href: '/erp/tasks',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Task']
        },
        {
          id: 'task-kanban-board',
          label: 'Board',
          href: '/erp/tasks/board',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Task']
        },
        {
          id: 'task-timeline',
          label: 'Timeline',
          href: '/erp/tasks/timeline',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Task']
        }
      ],
      permissions: ['Manage Task']
    },
    {
      id: 'schedules-menu',
      label: 'Schedules',
      icon: <CalendarCheck className={iconSize} />,
      href: '/erp/schedules',
      hasSubItems: true,
      subItems: [
        {
          id: 'schedules-calendar',
          label: 'Schedules Calendar',
          href: '/erp/schedules/calendar',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Schedule']
        },
        {
          id: 'schedules-list',
          label: 'Schedules List',
          href: '/erp/schedules',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Schedule']
        }
      ],
      exactMatch: false,
      permissions: ['Manage Schedule']
    },
    {
      id: 'estimates',
      label: 'Estimates',
      icon: <EstimateIcon className={iconSize} />,
      href: '/erp/estimates',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Estimate']
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <InvoiceIcon className={iconSize} />,
      href: '/erp/invoices',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Invoice']
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      icon: <WorkOrderIcon className={iconSize} />,
      href: '/erp/work-orders',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Work Order']
    },
    {
      id: 'material-jobs',
      label: 'Material Jobs',
      icon: <MaterialJobIcon className={iconSize} />,
      href: '/erp/material-jobs',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Work Order']
    },
    {
      id: 'all-products',
      label: 'Products',
      icon: <Boxes className={iconSize} />,
      href: '/erp/products',
      hasSubItems: true,
      subItems: [
        {
          id: 'inventory-products',
          label: 'Inventory',
          icon: <Boxes className={iconSize} />,
          href: '/erp/products',
          hasSubItems: true,
          subItems: [
            {
              id: 'products',
              label: 'Products',
              href: '/erp/products',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Product']
            },
            {
              id: 'product-stock',
              label: 'Product Stock',
              href: '/erp/products/stock',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Product']
            },
            {
              id: 'product-purchase-order',
              label: 'Purchase Orders',
              href: '/erp/products/purchase-orders',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Product']
            },
            {
              id: 'inventory-jobs',
              label: 'Jobs',
              href: '/erp/products/inventory-jobs',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Work Order']
            }
          ],
          exactMatch: false,
          permissions: ['Manage Product', 'Manage Work Order']
        },
        {
          id: 'non-inventory-products',
          label: 'Non-Inventory',
          icon: <Box className={iconSize} />,
          href: '/erp/non-inventory-products',
          hasSubItems: true,
          subItems: [
            {
              id: 'products',
              label: 'Products',
              href: '/erp/non-inventory-products',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Product']
            },
            {
              id: 'non-inventory-jobs',
              label: 'Jobs',
              href: '/erp/non-inventory-products/non-inventory-jobs',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Work Order']
            },
            {
              id: 'order-by-product',
              label: 'Order By Product',
              href: '/erp/non-inventory-products/order-by-product',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Work Order']
            }
          ],
          exactMatch: false,
          permissions: ['Manage Product', 'Manage Work Order']
        }
      ],
      exactMatch: true,
      permissions: ['Manage Product', 'Manage Work Order']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      href: '/settings',
      hasSubItems: true,
      subItems: [
        {
          id: 'locations',
          label: 'Locations',
          icon: <Map className={iconSize} />,
          href: '/erp/locations',
          hasSubItems: true,
          subItems: [
            {
              id: 'countries',
              label: 'Countries',
              href: '/erp/locations/countries',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Country']
            },
            {
              id: 'states',
              label: 'States',
              href: '/erp/locations/states',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage State']
            },
            {
              id: 'cities',
              label: 'Cities',
              href: '/erp/locations/cities',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage City']
            },
            {
              id: 'businesses',
              label: 'Business Locations',
              href: '/erp/locations/businesses',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Location']
            }
          ],
          exactMatch: false,
          permissions: ['Manage Country', 'Manage State', 'Manage City', 'Manage Location']
        },
        {
          id: 'staffs',
          label: 'System Users',
          icon: <Users className={iconSize} />,
          href: '/erp/staffs',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Staff']
        },
        {
          id: 'roles',
          label: 'Roles',
          icon: <UserLock className={iconSize} />,
          href: '/erp/roles',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Role']
        },
        {
          id: 'partners',
          label: 'Contractors',
          icon: <Building2 className={iconSize} />,
          href: '/erp/contractors',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Contractor']
        },
        {
          id: 'labor-costs',
          label: 'Labor Costs',
          icon: <UserLock className={iconSize} />,
          href: '/erp/labor-costs',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Labor Cost']
        },
        {
          id: 'vendors',
          label: 'Vendors',
          icon: <Package className={iconSize} />,
          href: '/erp/vendors',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Vendor']
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: <Warehouse className={iconSize} />,
          href: '/erp/warehouses',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Warehouse']
        },
        {
          id: 'payment-terms',
          label: 'Payment Terms',
          href: '/erp/settings/payment-terms',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Payment Term']
        },
        {
          id: 'partner-types',
          label: 'Contractor Types',
          href: '/erp/settings/contractor-types',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Contractor Type']
        },
        {
          id: 'commissions-types',
          label: 'Commission Types',
          href: '/erp/settings/commission-types',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Commission']
        },
        {
          id: 'commissions',
          label: 'Commissions',
          href: '/erp/settings/commissions',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Commission']
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          href: '/erp/settings/email-templates',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Message Template']
        },
        {
          id: 'task-reminders',
          label: 'Task Reminders',
          href: '/erp/settings/task-reminders',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Task Reminder']
        },
        {
          id: 'system-list',
          label: 'System List',
          href: '/erp/settings',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: true,
          subItems: [
            {
              id: 'contact-types',
              label: 'Contact Types',
              href: '/erp/settings/contact-types',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Contact Type']
            },
            {
              id: 'note-types',
              label: 'Note Types',
              href: '/erp/settings/note-types',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Note Type']
            },
            {
              id: 'task-types',
              label: 'Task Types',
              href: '/erp/settings/task-types',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Task Type']
            },
            {
              id: 'product-categories',
              label: 'Product Categories',
              href: '/erp/settings/product-categories',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Category']
            },
            {
              id: 'interest-levels',
              label: 'Interest Levels',
              href: '/erp/settings/interest-levels',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: true,
              permissions: ['Manage Interest Level']
            },
            {
              id: 'uom-units',
              label: 'Uom Units',
              href: '/erp/settings/uom-units',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Unit']
            },
            {
              id: 'measure-units',
              label: 'Measure Units',
              href: '/erp/settings/measure-units',
              icon: <LocateIcon className={iconSize} />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Unit']
            }
          ],
          exactMatch: false,
          permissions: [
            'Manage Lead Interest',
            'Manage Category',
            'Manage Unit',
            'Manage Contact Type',
            'Manage Note Type',
            'Manage Task Type'
          ]
        },

        {
          id: 'service-types',
          label: 'Service Types',
          href: '/erp/settings/service-types',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Service Type']
        },
        {
          id: 'couriers',
          label: 'Couriers',
          href: '/erp/couriers',
          icon: <LocateIcon className={iconSize} />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Courier']
        }
      ],
      exactMatch: false,
      permissions: [
        'Manage Country',
        'Manage State',
        'Manage City',
        'Manage Location',
        'Manage Vendor',
        'Manage Warehouse',
        'Manage Payment Term',
        'Manage Contractor Type',
        'Manage Contact Type',
        'Manage Commission',
        'Manage Task Type',
        'Manage Unit',
        'Manage Message Template',
        'Manage Task Reminder',
        'Manage Service Type',
        'Manage Interest Level',
        'Manage Category',
        'Manage Staff',
        'Manage Role',
        'Manage Contractor',
        'Manage Labor Cost'
      ]
    }
  ]

  // Filter menu items based on user permissions
  const navigationItems = useMemo(() => filterMenuByPermissions(allNavigationItems, permissions), [permissions])
  const { isOpen } = useSidebar()
  const { sidebarToggle } = useSidebar()

  return (
    <>
      <div
        className={`fixed w-screen h-screen bg-black/50 hidden max-xl:block transition duration-300 backdrop-blur-xs ${isOpen ? 'z-40 opacity-100' : '-z-40 opacity-0'}`}
        onClick={sidebarToggle}
      />

      <aside
        className={`transition-all duration-300 h-screen ${isOpen ? 'max-xl:translate-x-0' : 'max-xl:-translate-x-full'} w-[260px] bg-bg-2 border-r border-border flex flex-col max-xl:absolute max-xl:top-0 max-xl:z-50 max-xl:h-full`}
      >
        {/* Header/Logo */}
        <Link href={'/erp'} className='px-4 py-3 border-b border-border'>
          <Image
            src='/images/dashboard/logo.webp'
            alt='logo'
            width={172}
            height={72}
            loading='eager'
            style={{ width: '90px', height: 'auto' }}
          />
        </Link>

        {/* Main Navigation */}
        <ScrollArea className='flex-1 p-4' scrollbarClassName='w-2'>
          <ul className='space-y-1'>
            {navigationItems.map(item => (
              <li key={item.id}>
                <MenuItem item={item} />
              </li>
            ))}
          </ul>
        </ScrollArea>

        {/* Bottom Section */}
        <SidebarFooter user={user} />
      </aside>
    </>
  )
}

export default Sidebar
