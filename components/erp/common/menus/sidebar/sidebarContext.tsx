'use client'

import React, { createContext, useContext, useState } from 'react'

const SidebarContext = createContext<{
  isOpen: boolean
  sidebarToggle: () => void
}>({ isOpen: true, sidebarToggle: () => {} })

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarToggle = () => setIsOpen(prev => !prev)

  return <SidebarContext.Provider value={{ isOpen, sidebarToggle }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
