'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function LangLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
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
		</>
	)
}
