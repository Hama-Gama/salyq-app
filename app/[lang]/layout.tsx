import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'
import AppSidebar from '@/components/shared/AppSidebar'
import Navbar from '@/components/shared/Navbar'
import { SidebarInset } from '@/components/ui/sidebar'
import { headers } from 'next/headers'
import { Providers } from './providers' // Импортируем созданные провайдеры

export default async function LangLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ lang: string }>
}) {
	const { lang: langParam } = await params
	const lang = langParam as Locale
	const session = await auth()

	const dict = await getDictionary(lang)

	// Определяем путь для подсветки активных пунктов меню

	const headersList = await headers()
	const fullPath = headersList.get('x-pathname') ?? `/${lang}/dashboard`

	// Убираем языковой префикс /ru или /kz
	const currentPath = fullPath.replace(/^\/(ru|kz)/, '') || '/dashboard'

	// Если сессии нет — редиректим только если это не публичная страница
	const isPublicPath =
		fullPath.includes('/login') ||
		fullPath === `/${lang}` ||
		fullPath === '/' ||
		fullPath === `/${lang}/`

	if (!session && !isPublicPath) {
		redirect(`/${lang}/login`)
	}

	return (
		<html lang={lang} suppressHydrationWarning>
			<body>
				<Providers>
					<AppSidebar lang={lang} dict={dict} currentPath={currentPath} />
					<SidebarInset className='flex flex-col min-h-screen bg-muted/30'>
						<Navbar lang={lang} dict={dict} currentPath={currentPath} />
						<main className='flex flex-1 flex-col'>{children}</main>
					</SidebarInset>
				</Providers>
			</body>
		</html>
	)
}