import { auth } from '@/auth'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ lang: Locale }>
}) {
	const { lang } = await params
	const session = await auth()
	const dict = await getDictionary(lang)

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-foreground'>
					{dict.dashboard.title}
				</h1>
				<p className='text-muted-foreground mt-1'>
					{lang === 'ru'
						? `Добро пожаловать, ${session?.user?.name}`
						: `Қош келдіңіз, ${session?.user?.name}`}
				</p>
			</div>

			{/* Тестовые карточки */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-sm text-muted-foreground'>
						{dict.dashboard.total_income}
					</p>
					<p className='text-2xl font-bold mt-2'>0 ₸</p>
				</div>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-sm text-muted-foreground'>
						{dict.dashboard.tax_amount}
					</p>
					<p className='text-2xl font-bold mt-2'>0 ₸</p>
				</div>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-sm text-muted-foreground'>
						{dict.dashboard.next_deadline}
					</p>
					<p className='text-2xl font-bold mt-2'>25.04</p>
				</div>
			</div>
		</div>
	)
}
