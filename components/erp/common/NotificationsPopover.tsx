'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CheckIcon } from 'lucide-react'
import { BellIcon } from '@/public/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import CustomButton from './CustomButton'
import NotificationService from '@/services/api/notifications.service'
import { Notification, PaginatedNotifications } from '@/types/notifications'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { isTenant } from '@/utils/utility'

const NotificationsPopover: React.FC = () => {
  const [isTenantApp, setIsTenantApp] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchNotifications = async (pageNum: number, isInitial = false) => {
    try {
      setLoading(true)
      const res = await NotificationService.getNotifications(`page=${pageNum}&per_page=10`)

      if (res?.data) {
        const paginatedData: PaginatedNotifications = res.data

        if (isInitial) {
          const uniqueItems = Array.from(new Map(paginatedData.data.map(item => [item.id, item])).values())

          setNotifications(uniqueItems)
        } else {
          setNotifications(prev => {
            const newItems = paginatedData.data.filter(newItem => !prev.some(existing => existing.id === newItem.id))

            return [...prev, ...newItems]
          })
        }

        setHasMore(paginatedData.current_page < paginatedData.last_page)

        // Update unread count based on the first page or total if available
        // Note: For a real unread count, the backend should ideally provide a separate endpoint or include it in the meta.
        // We'll calculate based on what's currently fetched that is unread.
        const unread = paginatedData.data.filter(n => !n.is_read).length

        if (isInitial) {
          setUnreadCount(unread)
        } else {
          setUnreadCount(prev => prev + unread)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const tenantStatus = await isTenant()

      setIsTenantApp(tenantStatus)

      if (tenantStatus) {
        fetchNotifications(1, true)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (open && isTenantApp) {
      setPage(1)
      fetchNotifications(1, true)
    }
  }, [open, isTenantApp])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => {
        const nextPage = prev + 1

        fetchNotifications(nextPage)

        return nextPage
      })
    }
  }, [loading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [loadMore])

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return

    try {
      await NotificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error: any) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error('Failed to mark all as read')
    }
  }

  if (!isTenantApp) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='relative'>
          <CustomButton
            icon={<BellIcon className='h-5 w-5' />}
            variant='outline'
            className='md:p-2.5! p-1.5! md:rounded-xl rounded-lg relative'
          />
          {unreadCount > 0 && (
            <Badge variant='destructive' className='absolute -top-2 -right-2 px-1.5 py-0.5 text-xs'>
              {unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0 mr-4 mt-2' align='end'>
        <div className='flex items-center justify-between p-4'>
          <h4 className='font-semibold text-sm'>Notifications</h4>
          <button
            onClick={handleMarkAllAsRead}
            className='text-xs text-primary hover:underline flex items-center gap-1'
          >
            <CheckIcon className='h-3 w-3' /> Mark all read
          </button>
        </div>
        <ScrollArea className='h-80'>
          {notifications.length === 0 && !loading ? (
            <div className='p-4 text-center text-sm text-accent-foreground'>No notifications found.</div>
          ) : (
            <div className='flex flex-col'>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-accent last:border-0 cursor-pointer hover:bg-accent/90 transition-colors ${!notification.is_read ? 'bg-accent/60' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                >
                  <p
                    className={`text-sm ${!notification.is_read ? 'font-medium text-accent-foreground' : 'text-accent-foreground/50'}`}
                  >
                    {notification.message}
                  </p>
                  <p className='text-xs text-accent-foreground/50 mt-1'>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
              {hasMore && (
                <div ref={observerTarget} className='p-4 text-center text-sm text-gray-500'>
                  {loading ? 'Loading...' : 'Scroll for more'}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationsPopover
