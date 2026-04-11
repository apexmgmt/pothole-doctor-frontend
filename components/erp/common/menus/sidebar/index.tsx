'use client'

import React, { useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
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

import { NavigationItem, User } from '@/types'
import { filterMenuByPermissions } from '@/utils/menu-permissions'

import { SettingsIcon, HomeIcon, EstimateIcon } from '@/public/icons'
import SidebarFooter from './SidebarFooter'
import MenuItem from './menu-item'
import { ScrollArea } from '@/components/ui/scroll-area'

const Sidebar: React.FC<{ user: User | null; permissions: string[] }> = ({ user, permissions }) => {
  const allNavigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon />,
      href: '/erp',
      hasSubItems: false,
      exactMatch: true

      // No permissions = always visible
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: <Building2 className='h-4 w-4' />,
      href: '/erp/companies',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Company']
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users2 className='h-4 w-4' />,
      href: '/erp/leads',
      hasSubItems: true,
      subItems: [
        {
          id: 'leads',
          label: 'Leads',
          href: '/erp/leads',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Lead']
        },
        {
          id: 'interest-levels',
          label: 'Interest Levels',
          href: '/erp/leads/interest-levels',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Interest Level']
        }
      ],
      exactMatch: false,
      permissions: ['Manage Lead', 'Manage Interest Level']
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <UserLock className='h-4 w-4' />,
      href: '/erp/customers',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Customer']
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CalendarCheck className='h-4 w-4' />,
      href: '/erp/tasks',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Task']
    },
    {
      id: 'estimates',
      label: 'Estimates',
      icon: <EstimateIcon className='h-4 w-4' />,
      href: '/erp/estimates',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Estimate']
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <EstimateIcon className='h-4 w-4' />,
      href: '/erp/invoices',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Invoice']
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      icon: <EstimateIcon className='h-4 w-4' />,
      href: '/erp/work-orders',
      hasSubItems: false,
      exactMatch: false,
      permissions: ['Manage Work Order']
    },
    {
      id: 'product',
      label: 'Products',
      icon: <Boxes className='h-4 w-4' />,
      href: '/erp/products',
      hasSubItems: true,
      subItems: [
        {
          id: 'products',
          label: 'Products',
          href: '/erp/products',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Product']
        },
        {
          id: 'product-stock',
          label: 'Product Stock',
          href: '/erp/products/stock',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Product']
        },
        {
          id: 'product-purchase-order',
          label: 'Purchase Orders',
          href: '/erp/products/purchase-orders',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Product']
        },
        {
          id: 'product-categories',
          label: 'Categories',
          href: '/erp/products/categories',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: true,
          permissions: ['Manage Category']
        }
      ],
      exactMatch: false,
      permissions: ['Manage Category', 'Manage Product']
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
          icon: <Map className='h-4 w-4' />,
          href: '/erp/locations',
          hasSubItems: true,
          subItems: [
            {
              id: 'countries',
              label: 'Countries',
              href: '/erp/locations/countries',
              icon: <LocateIcon className='h-4 w-4' />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage Country']
            },
            {
              id: 'states',
              label: 'States',
              href: '/erp/locations/states',
              icon: <LocateIcon className='h-4 w-4' />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage State']
            },
            {
              id: 'cities',
              label: 'Cities',
              href: '/erp/locations/cities',
              icon: <LocateIcon className='h-4 w-4' />,
              hasSubItems: false,
              exactMatch: false,
              permissions: ['Manage City']
            },
            {
              id: 'businesses',
              label: 'Business Locations',
              href: '/erp/locations/businesses',
              icon: <LocateIcon className='h-4 w-4' />,
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
          icon: <Users className='h-4 w-4' />,
          href: '/erp/staffs',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Staff']
        },
        {
          id: 'roles',
          label: 'Roles',
          icon: <UserLock className='h-4 w-4' />,
          href: '/erp/roles',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Role']
        },
        {
          id: 'partners',
          label: 'Contractors',
          icon: <Building2 className='h-4 w-4' />,
          href: '/erp/contractors',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Contractor']
        },
        {
          id: 'labor-costs',
          label: 'Labor Costs',
          icon: <UserLock className='h-4 w-4' />,
          href: '/erp/labor-costs',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Labor Cost']
        },
        {
          id: 'vendors',
          label: 'Vendors',
          icon: <Package className='h-4 w-4' />,
          href: '/erp/vendors',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Vendor']
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: <Warehouse className='h-4 w-4' />,
          href: '/erp/warehouses',
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Warehouse']
        },
        {
          id: 'payment-terms',
          label: 'Payment Terms',
          href: '/erp/settings/payment-terms',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Payment Term']
        },
        {
          id: 'partner-types',
          label: 'Contractor Types',
          href: '/erp/settings/contractor-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Contractor Type']
        },
        {
          id: 'contact-types',
          label: 'Contact Types',
          href: '/erp/settings/contact-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Contact Type']
        },
        {
          id: 'commissions-types',
          label: 'Commission Types',
          href: '/erp/settings/commission-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Commission']
        },
        {
          id: 'commissions',
          label: 'Commissions',
          href: '/erp/settings/commissions',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Commission']
        },
        {
          id: 'note-types',
          label: 'Note Types',
          href: '/erp/settings/note-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Note Type']
        },
        {
          id: 'task-types',
          label: 'Task Types',
          href: '/erp/settings/task-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Task Type']
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          href: '/erp/settings/email-templates',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Message Template']
        },
        {
          id: 'task-reminders',
          label: 'Task Reminders',
          href: '/erp/settings/task-reminders',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Task Reminder']
        },
        {
          id: 'uom-units',
          label: 'Uom Units',
          href: '/erp/settings/uom-units',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Unit']
        },
        {
          id: 'measure-units',
          label: 'Measure Units',
          href: '/erp/settings/measure-units',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Unit']
        },
        {
          id: 'service-types',
          label: 'Service Types',
          href: '/erp/settings/service-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false,
          permissions: ['Manage Service Type']
        },
        {
          id: 'couriers',
          label: 'Couriers',
          href: '/erp/couriers',
          icon: <LocateIcon className='h-4 w-4' />,
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
        'Manage Service Type'
      ]
    }
  ]

  // Filter menu items based on user permissions
  const navigationItems = useMemo(() => filterMenuByPermissions(allNavigationItems, permissions), [permissions])

  return (
    <div className='w-full h-screen bg-bg-2 border-r border-border flex flex-col'>
      {/* Header/Logo */}
      <Link href={'/erp'} className='px-4 py-3 border-b border-border'>
        <Image src='/images/dashboard/logo.webp' alt='logo' width={90} height={37} />
      </Link>

      {/* Main Navigation */}
      <ScrollArea className='flex-1 p-4'>
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
    </div>
  )
}

export default Sidebar
