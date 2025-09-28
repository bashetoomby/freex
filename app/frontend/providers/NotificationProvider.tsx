'use client'

import { Notification } from '@/app/interfaces'
import React, { createContext, useContext, useState, ReactNode, Dispatch } from 'react'


interface NotificationContextType {
    notification: Notification | null
    setNotification: Dispatch<React.SetStateAction<Notification | null>>
    removeNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null)



    const removeNotification = () => {
        setNotification(null)
    }


    return (
        <NotificationContext.Provider value={{
            notification,
            setNotification,
            removeNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}