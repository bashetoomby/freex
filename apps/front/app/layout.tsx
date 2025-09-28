
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '@/components/footer/Footer'
import './reset.css'
import './global.css'
import { ColorTheme } from '@/providers/ColorTheme'
import Header from '@/components/header/Header'
import { cookies } from 'next/headers'
import { SocketProvider } from '@/providers/SocketProvider'
import { SessionProviders } from '@/providers/SessionProviders'
import { IAuthInfo } from './interfaces'
import Notifications from '@/components/notifications/Notifications'
import { NotificationProvider } from '@/providers/NotificationProvider'



export const dynamic = 'force-dynamic'
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
	title: 'Freex',
	description: 'Dating platform',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {

	const cookie = cookies().get('auth-info') || null
	const session: IAuthInfo | null = JSON.parse(cookie?.value || '{}') || null
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ColorTheme>
					<SocketProvider session={session}>
						<NotificationProvider>
							<div className="wrapper">
								<Notifications />
								<SessionProviders session={session}>
									<Header session={session} />
									{children}
									<Footer session={session} />
								</SessionProviders>
							</div>
						</NotificationProvider>
					</SocketProvider>
				</ColorTheme>
			</body>
		</html>
	)
}
