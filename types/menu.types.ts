import { ReactNode } from 'react'

export interface NavigationSubItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  hasSubItems?: boolean
  subItems?: NavigationSubItem[]
  exactMatch?: boolean // default true if undefined
}

export interface NavigationItem extends NavigationSubItem {
  hasSubItems: boolean
  subItems?: NavigationSubItem[]
}

export interface ExpandedSections {
  [key: string]: boolean
}
