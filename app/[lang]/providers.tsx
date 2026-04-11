'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from 'next-auth/react' // Добавляем этот импорт
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{' '}
			{/* Оборачиваем всё приложение */}
			<TooltipProvider>
				<SidebarProvider>
					{children}
					<ToastContainer
						position='bottom-right'
						autoClose={4000}
						theme='colored'
					/>
				</SidebarProvider>
			</TooltipProvider>
		</SessionProvider>
	)
}
