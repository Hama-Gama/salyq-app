import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'
import { headers } from 'next/headers'

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ lang: string }>
}) {
	const { lang: langParam } = await params
	const lang = langParam as Locale
	const session = await auth()

	if (!session) {
		redirect(`/${lang}/login`)
	}

	const dict = await getDictionary(lang)
	const headersList = await headers()
	const fullPath = headersList.get('x-pathname') ?? '/dashboard'
	const currentPath = fullPath.replace(`/${lang}`, '') || '/dashboard'

	return (
				<main className='flex flex-1 flex-col'>
					{children}
				</main>
	)
}
