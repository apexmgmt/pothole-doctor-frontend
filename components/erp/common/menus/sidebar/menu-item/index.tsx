import React, { useState, ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NavigationSubItem, ExpandedSections } from '@/types'

import { ArrowDownIcon, ArrowUpIcon } from '@/public/icons'
import TreeConnector from './TreeConnector'
import { useSidebar } from '../sidebarContext'

const MenuItem: React.FC<{
  item: NavigationSubItem
  isLastItem?: boolean
  level?: number
  parentIcon?: ReactNode
}> = ({ item, isLastItem = false, level = 0, parentIcon }) => {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const { sidebarToggle } = useSidebar()

  const handleClick = () => {
    if (window.innerWidth < 768) {
      sidebarToggle()
    }
  }

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

  const isActive = isItemActive(item) || hasActiveDescendant(item)
  const isExpanded = expandedSections[item.id]
  const resolvedIcon = item.icon ?? parentIcon // ensure submenu shows an icon

  return item.hasSubItems && item.subItems ? (
    <div key={item.id}>
      <button
        onClick={() => toggleSection(item.id)}
        className={`relative w-full flex items-center justify-between px-3 py-1 rounded-lg text-left transition-colors ${
          isActive ? 'bg-accent/40 text-accent-foreground' : 'text-gray hover:text-light hover:bg-accent/50'
        }`}
        type='button'
      >
        <div className='flex items-center gap-3'>
          <TreeConnector level={level} resolvedIcon={resolvedIcon} />
          <span className='font-normal'>{item.label}</span>
        </div>
        {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className='overflow-hidden'>
          <ul className={`relative space-y-1 mt-1 ${level > 0 ? 'ml-5' : 'ml-8'}`}>
            {item.subItems.map((subItem, idx) => (
              <li key={subItem.id}>
                <MenuItem
                  item={subItem}
                  isLastItem={idx + 1 === item.subItems?.length}
                  level={level + 1}
                  parentIcon={resolvedIcon}
                />
              </li>
            ))}

            <span
              className={`absolute bottom-10 w-0 h-[calc(100%-30px)] border-l border-border ${level > 0 ? '-left-1' : '-left-3'}`}
            />
          </ul>
        </div>
      </div>
    </div>
  ) : (
    <Link
      key={item.id}
      href={item.href}
      onClick={handleClick}
      className={`relative flex items-center gap-3 px-3 py-1 rounded-lg transition-colors ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-gray hover:text-light hover:bg-accent/50'
      }`}
    >
      <TreeConnector isLastItem={isLastItem} level={level} resolvedIcon={resolvedIcon} />
      <span className='font-normal'>{item.label}</span>
    </Link>
  )
}

export default MenuItem
