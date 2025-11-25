'use client'

import React, { useState, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ArrowDownIcon, ArrowUpIcon, SettingsIcon, EstimateIcon, UserIcon, CRMIcon, HomeIcon } from '@/public/icons'
import SidebarFooter from './SidebarFooter'
import { Building2, LocateIcon, Map, UserLock, Users } from 'lucide-react'

interface NavigationSubItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  hasSubItems?: boolean
  subItems?: NavigationSubItem[]
  exactMatch?: boolean // default true if undefined
}

interface NavigationItem extends NavigationSubItem {
  hasSubItems: boolean
  subItems?: NavigationSubItem[]
}

interface ExpandedSections {
  [key: string]: boolean
}

const Sidebar: React.FC<{ user: Record<string, unknown> }> = ({ user }) => {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
      label: 'Contractors/Sub',
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

  // path helpers
  const normalize = (p: string) => p.replace(/\/+$/, '') || '/'

  // exactMatch default is true; when false, also active for any descendant path
  const isItemActive = (item: NavigationSubItem): boolean => {
    const current = normalize(pathname || '')
    const target = normalize(item.href)
    const exact = item.exactMatch !== false

    if (exact) {
      return current === target
    } else {
      // Active for target itself or any path beneath it; use boundary to avoid /example matching /example-other
      return current === target || current.startsWith(target + '/')
    }
  }

  const hasActiveDescendant = (item: NavigationSubItem): boolean =>
    !!item.subItems?.some(child => isItemActive(child) || hasActiveDescendant(child))

  // Recursive renderer; inherit parent icon if a child has none (template)
  const renderMenuItem = (item: NavigationSubItem, level = 0, parentIcon?: ReactNode): ReactNode => {
    const isActive = isItemActive(item) || hasActiveDescendant(item)
    const isExpanded = expandedSections[item.id]
    const paddingLeft = level * 16
    const resolvedIcon = item.icon ?? parentIcon // ensure submenu shows an icon

    if (item.hasSubItems && item.subItems) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleSection(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
              isActive ? 'bg-accent/40 text-accent-foreground' : 'text-gray hover:text-light hover:bg-accent/50'
            }`}
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
            type='button'
          >
            <div className='flex items-center gap-3'>
              {resolvedIcon}
              <span className='font-medium'>{item.label}</span>
            </div>
            {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </button>

          {isExpanded && (
            <ul className='space-y-1 mt-2'>
              {item.subItems.map(subItem => (
                <li key={subItem.id}>{renderMenuItem(subItem, level + 1, resolvedIcon)}</li>
              ))}
            </ul>
          )}
        </div>
      )
    } else {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive ? 'bg-accent text-accent-foreground' : 'text-gray hover:text-light hover:bg-accent/50'
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          {resolvedIcon}
          <span className='font-medium'>{item.label}</span>
        </Link>
      )
    }
  }

  return (
    <div className='w-full h-screen bg-bg-2 border-r border-border flex flex-col'>
      {/* Header/Logo */}
      <Link href={'/erp'} className='px-4 py-3 border-b border-border'>
        <Image src='/images/dashboard/logo.webp' alt='logo' width={90} height={37} />
      </Link>

      {/* Main Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <ul className='space-y-2'>
          {navigationItems.map(item => (
            <li key={item.id}>{renderMenuItem(item)}</li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <SidebarFooter user={user} />
    </div>
  )
}

export default Sidebar
