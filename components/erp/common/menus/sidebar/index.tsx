'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NavigationItem } from '@/types'

import { SettingsIcon, HomeIcon } from '@/public/icons'
import { Building2, LocateIcon, Map, UserLock, Users, Warehouse } from 'lucide-react'
import SidebarFooter from './SidebarFooter'
import MenuItem from './menu-item'

const Sidebar: React.FC<{ user: Record<string, unknown> }> = ({ user }) => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon />,
      href: '/erp',
      hasSubItems: false,
      exactMatch: true
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: <Building2 className='h-4 w-4' />,
      href: '/erp/companies',
      hasSubItems: false,
      exactMatch: false
    },
    {
      id: 'partners',
      label: 'Contractors',
      icon: <Building2 className='h-4 w-4' />,
      href: '/erp/contractors',
      hasSubItems: false,
      exactMatch: false
    },
    {
      id: 'staffs',
      label: 'Staffs',
      icon: <Users className='h-4 w-4' />,
      href: '/erp/staffs',
      hasSubItems: false,
      exactMatch: false
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: <UserLock className='h-4 w-4' />,
      href: '/erp/roles',
      hasSubItems: false,
      exactMatch: false
    },
    {
      id: 'warehouses',
      label: 'Warehouses',
      icon: <Warehouse className='h-4 w-4' />,
      href: '/erp/warehouses',
      hasSubItems: false,
      exactMatch: false
    },
    {
      id: 'labor-costs',
      label: 'Labor Costs',
      icon: <UserLock className='h-4 w-4' />,
      href: '/erp/labor-costs',
      hasSubItems: false,
      exactMatch: false
    },
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
          exactMatch: false
        },
        {
          id: 'states',
          label: 'States',
          href: '/erp/locations/states',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'cities',
          label: 'Cities',
          href: '/erp/locations/cities',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'businesses',
          label: 'Business Locations',
          href: '/erp/locations/businesses',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      href: '/settings',
      hasSubItems: true,
      subItems: [
        {
          id: 'payment-terms',
          label: 'Payment Terms',
          href: '/erp/settings/payment-terms',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'partner-types',
          label: 'Contractor Types',
          href: '/erp/settings/contractor-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'contact-types',
          label: 'Contact Types',
          href: '/erp/settings/contact-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'commissions',
          label: 'Commissions',
          href: '/erp/settings/commissions',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'note-types',
          label: 'Note Types',
          href: '/erp/settings/note-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'task-types',
          label: 'Task Types',
          href: '/erp/settings/task-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'uom-units',
          label: 'Uom Units',
          href: '/erp/settings/uom-units',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'measure-units',
          label: 'Measure Units',
          href: '/erp/settings/measure-units',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        },
        {
          id: 'service-types',
          label: 'Service Types',
          href: '/erp/settings/service-types',
          icon: <LocateIcon className='h-4 w-4' />,
          hasSubItems: false,
          exactMatch: false
        }
      ]
    }
  ]

  return (
    <div className='w-full h-screen bg-bg-2 border-r border-border flex flex-col'>
      {/* Header/Logo */}
      <Link href={'/erp'} className='px-4 py-3 border-b border-border'>
        <Image src='/images/dashboard/logo.webp' alt='logo' width={90} height={37} />
      </Link>

      {/* Main Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <ul className='space-y-1'>
          {navigationItems.map(item => (
            <li key={item.id}>
              <MenuItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <SidebarFooter user={user} />
    </div>
  )
}

export default Sidebar
