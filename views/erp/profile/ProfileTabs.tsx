'use client'

import React from 'react'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface ProfileTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <aside className='w-full lg:w-64 flex-shrink-0 '>
      <nav className='space-y-1 flex lg:flex-col flex-row lg:gap-0 gap-2.5'>
        {tabs.map(tab => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center  gap-3 px-4 py-2 rounded-lg text-left transition-colors cursor-pointer text-sm justify-center lg:justify-start ${
                activeTab === tab.id
                  ? 'bg-border/40 text-accent-foreground '
                  : 'text-gray hover:text-light hover:bg-border/40 bg-border/10'
              }`}
            >
              <Icon className='h-4 w-4' />
              <span className='font-normal'>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default ProfileTabs
