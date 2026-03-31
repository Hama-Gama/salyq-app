import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'
import AppSidebar from '@/components/shared/AppSidebar'
import { headers } from 'next/headers'
import Navbar from '@/components/shared/Navbar'

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ lang: Locale }>
}) {
	const { lang } = await params
	const session = await auth()

	// Редирект на логин если не авторизован
	if (!session) {
		redirect(`/${lang}/login`)
	}

	const dict = await getDictionary(lang)

	// Получаем текущий путь для активного пункта меню
	const headersList = await headers()
	const fullPath = headersList.get('x-pathname') ?? '/dashboard'
	// Убираем префикс языка
	const currentPath =
		fullPath.replace('/kz', '').replace('/ru', '') || '/dashboard'

	return (
		<div className='flex min-h-screen bg-muted/30'>
			{/* Боковая панель — только десктоп */}
			<AppSidebar lang={lang} dict={dict} currentPath={currentPath} />

			{/* Основной контент */}
			<div className='flex-1 flex flex-col min-w-0'>
				<Navbar lang={lang} dict={dict} currentPath={currentPath} />
				<main className='flex-1 p-4 md:p-6'>{children}</main>
			</div>
		</div>
	)
}
