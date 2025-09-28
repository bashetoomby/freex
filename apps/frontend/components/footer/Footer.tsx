"use client"

import { useTheme } from 'next-themes';
import './footer.css'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IAuthInfo } from '@/app/interfaces';
import { useSocket } from '@/providers/SocketProvider';
import { useEffect, useState } from 'react';

const Footer = ({ session }: { session: IAuthInfo | null }) => {
    const pathname = usePathname()
    const { socket, isConnected } = useSocket()
    const [unreadMessages, setUnreadMessages] = useState<number>(0)

    useEffect(() => {
        if (!socket || !isConnected) return;
        socket.on('unreadCountUpdate', (content: { count: number }) => {
            setUnreadMessages(content.count);
        })
    }, [socket, isConnected])

    return (
        session && session.isAuth
            ?
            <footer className="footer">
                <nav className="footer__nav">
                    <Link href="/spin" className={`nav__link ${pathname === '/spin' ? 'nav__link--active' : ''}`}>
                        <svg
                            className='nav__link-svg'
                            data-origin="pipeline"
                            aria-hidden="true"
                            viewBox="0 0 32 32">
                            <path d="M11.945 26.806a7.713 7.713 0 01-4.88-9.752l4.013-12.05a.665.665 0 00-.766-.865 4.82 4.82 0 00-.42.12l-6.45 2.15a5.03 5.03 0 00-1.404.73h-.002A5.03 5.03 0 000 11.183v.002c0 .54.087 1.078.258 1.59l4.826 14.479c.164.492.407.956.718 1.371a5.1 5.1 0 004.042 2.046h.012a5.03 5.03 0 001.586-.256l3.778-1.255a.666.666 0 000-1.265l-3.275-1.088z">
                            </path>
                            <path d="M28.654 3.157a5.031 5.031 0 00-1.428-.749L20.774.258a5.03 5.03 0 00-6.365 3.183L9.595 17.896a5.032 5.032 0 00-.258 1.582v.012a5.031 5.031 0 001.999 4.023l.003.002c.438.33.926.587 1.447.76l6.438 2.139a5.03 5.03 0 001.586.256h.012a5.032 5.032 0 004.018-2.012l.003-.005c.325-.432.578-.915.748-1.427l4.817-14.451c.171-.513.259-1.05.259-1.591v-.002a5.031 5.031 0 00-2.013-4.025z">
                            </path>
                        </svg>
                        Encounters
                    </Link>
                    <Link href="/chats" className={`nav__link  ${pathname === '/chats' ? 'nav__link--active' : ''}`}>

                        <svg
                            className='nav__link-svg'
                            viewBox="0 0 32 32">
                            <path d="M27.826 20.81a13.352 13.352 0 10-5.682 5.683l4.17 1.39a2.295 2.295 0 002.901-2.903l-1.39-4.17zm-5.16-8.143a2 2 0 110 4 2 2 0 010-4zm-13.333 4a2 2 0 110-4 2 2 0 010 4zm4.667-2a2 2 0 114 0 2 2 0 01-4 0z">
                            </path>
                        </svg>
                        <div className="link__chat">
                            Chats
                            {unreadMessages > 0 && unreadMessages < 100 &&
                                <span className="link__message-count">
                                    {'(' + unreadMessages + ')'}
                                </span>}
                            {unreadMessages > 99 &&
                                <span className="link__message-count">
                                    (99+)
                                </span>}
                        </div>

                    </Link>
                    <Link href="/profile" className={`nav__link ${pathname === '/profile' ? 'nav__link--active' : ''}`}>
                        <svg
                            className='nav__link-svg'
                            viewBox="0 0 32 32">
                            <path d="M16 14.667a6.667 6.667 0 100-13.334 6.667 6.667 0 000 13.334zM16 30.667c8.1 0 14.667-2.985 14.667-6.667S24.1 17.333 16 17.333 1.333 20.318 1.333 24 7.9 30.667 16 30.667z">
                            </path>
                        </svg>
                        Profile
                    </Link>
                </nav>
            </footer>
            : null
    );
}

export default Footer;