import type { Locale } from '@/types'
import { getDictionary } from '@/lib/dictionary'

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ lang: Locale }>
}) {
	const { lang } = await params
	const dict = await getDictionary(lang)

	return (
		<main className='p-8'>
			<h1 className='text-2xl font-bold'>{dict.dashboard.title}</h1>
			<p className='text-gray-500 mt-2'>
				{lang === 'ru' ? 'Язык: Русский' : 'Тіл: Қазақша'}
			</p>
		</main>
	)
}
