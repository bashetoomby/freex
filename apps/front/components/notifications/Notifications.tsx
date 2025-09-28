'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import './Notifications.css'
import { useEffect, useState } from 'react'
import { useNotifications } from '@/providers/NotificationProvider'

const Notifications = () => {

    const searchParams = useSearchParams()
    const router = useRouter()
    const { notification, setNotification, removeNotification } = useNotifications()
    const [isActive, setIsActive] = useState(false)
    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {

        const message = searchParams.get('notification')
        if (message) {
            setIsActive(true)
            setNotification({ message: message })
            setAnimationKey(prev => prev + 1)
        }

        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('notification')
        router.replace(`?${newSearchParams.toString()}`, { scroll: false })

        const isActiveTimeout = setTimeout(() => {
            setIsActive(false)
        }, 5000)
        const isMessageTimout = setTimeout(() => {
            removeNotification()
        }, 5300)

        return () => {
            clearTimeout(isActiveTimeout)
            clearTimeout(isMessageTimout)
        }
    }, [searchParams, router])

    useEffect(() => {
        if (notification) {
            setIsActive(true)
            setAnimationKey(prev => prev + 1)
        }
        const isActiveTimeout = setTimeout(() => {
            setIsActive(false)
        }, 5000)
        const isMessageTimout = setTimeout(() => {
            removeNotification()
        }, 5300)

        return () => {
            clearTimeout(isActiveTimeout)
            clearTimeout(isMessageTimout)
        }
    }, [notification])

    return (
        <div className={`notification ${isActive && 'notification--active'}`}>
            <button
                onClick={() => setIsActive(false)}
                className="notification__delete-btn">
                <svg
                    className='notification__delete-svg'
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 122.88 122.88"
                    xmlSpace="preserve"
                >
                    <style
                        type="text/css"
                        dangerouslySetInnerHTML={{
                            __html: ".st0{fill-rule:evenodd;clip-rule:evenodd;}"
                        }}
                    />
                    <g>
                        <path
                            className="st0"
                            d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0 l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55 c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0 L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"
                        />
                    </g>
                </svg>
            </button>
            {notification?.message}
            <div
                key={animationKey}
                className={`notification__duration-strip ${isActive && 'duration-strip--active'}`}

            >

            </div>
        </div>
    );
}

export default Notifications;