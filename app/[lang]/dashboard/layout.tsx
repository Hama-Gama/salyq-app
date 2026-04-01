import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'
import AppSidebar from '@/components/shared/AppSidebar'
import { headers } from 'next/headers'
import Navbar from '@/components/shared/Navbar'
// ОБЯЗАТЕЛЬНО импортируем SidebarInset
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ lang: Locale }>
}) {
	const { lang } = await params
	const session = await auth()

	if (!session) {
		redirect(`/${lang}/login`)
	}

	const dict = await getDictionary(lang)
	const headersList = await headers()
	const fullPath = headersList.get('x-pathname') ?? '/dashboard'
	const currentPath = fullPath.replace(`/${lang}`, '') || '/dashboard'

	return (
		<SidebarProvider>
			{/* AppSidebar теперь будет правильно взаимодействовать 
        с SidebarInset, который идет следом.
      */}
			<AppSidebar lang={lang} dict={dict} currentPath={currentPath} />

			{/* SidebarInset — КРИТИЧЕСКИ ВАЖЕН. 
        Он автоматически убирает ту самую "пустоту" справа.
      */}
			<SidebarInset className='flex flex-col min-h-screen bg-muted/30'>
				<Navbar lang={lang} dict={dict} currentPath={currentPath} />

				<main className='flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto'>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
