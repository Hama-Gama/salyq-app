import Link from 'next/link'
import { auth } from '@/auth'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/constants/nav'
import type { Locale, Dictionary } from '@/types'
import {
	Home,
	Calendar,
	Users,
	BarChart,
	BookOpen,
	User,
	HelpCircle,
	Settings,
	CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Маппинг иконок
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	home: Home,
	calendar: Calendar,
	users: Users,
	'bar-chart': BarChart,
	'book-open': BookOpen,
	user: User,
	'help-circle': HelpCircle,
	settings: Settings,
	'credit-card': CreditCard,
}

interface Props {
	lang: Locale
	dict: Dictionary
	currentPath: string
}

export default async function AppSidebar({ lang, dict, currentPath }: Props) {
	const session = await auth()
	const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL

	const prefix = lang === 'kz' ? '/kz' : ''

	return (
		<aside className='hidden md:flex flex-col w-64 min-h-screen bg-background border-r'>
			{/* Логотип */}
			<div className='p-6 border-b'>
				<Link href={`${prefix}/dashboard`}>
					<h1 className='text-xl font-bold text-foreground'>SalyqApp</h1>
					<p className='text-xs text-muted-foreground mt-1'>
						{lang === 'ru' ? 'Налоговый помощник' : 'Салық көмекшісі'}
					</p>
				</Link>
			</div>

			{/* Навигация */}
			<nav className='flex-1 p-4 space-y-1'>
				{NAV_ITEMS.map(item => {
					const Icon = ICONS[item.icon]
					const href = `${prefix}${item.href}`
					const isActive =
						currentPath === item.href || currentPath.startsWith(item.href + '/')

					// Получаем label из словаря
					const [section, key] = item.labelKey.split('.')
					const label = (dict as any)[section]?.[key] ?? item.labelKey

					return (
						<Link
							key={item.href}
							href={href}
							className={cn(
								'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
								isActive
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted',
							)}
						>
							{Icon && <Icon className='w-4 h-4 shrink-0' />}
							{label}
						</Link>
					)
				})}

				{/* Админ пункты */}
				{isAdmin && (
					<>
						<div className='pt-4 pb-2'>
							<p className='px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
								Admin
							</p>
						</div>
						{ADMIN_NAV_ITEMS.map(item => {
							const Icon = ICONS[item.icon]
							const href = `${prefix}${item.href}`
							const isActive = currentPath.startsWith(item.href)
							const [section, key] = item.labelKey.split('.')
							const label = (dict as any)[section]?.[key] ?? item.labelKey

							return (
								<Link
									key={item.href}
									href={href}
									className={cn(
										'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
										isActive
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted',
									)}
								>
									{Icon && <Icon className='w-4 h-4 shrink-0' />}
									{label}
								</Link>
							)
						})}
					</>
				)}
			</nav>

			{/* Подписка индикатор */}
			<div className='p-4 border-t'>
				<div className='bg-muted rounded-lg p-3'>
					<p className='text-xs font-medium text-foreground'>
						{lang === 'ru' ? 'Тариф: Старт' : 'Тариф: Старт'}
					</p>
					<p className='text-xs text-muted-foreground mt-1'>
						{lang === 'ru' ? 'Перейти на Профи' : 'Про-ға өту'}
					</p>
				</div>
			</div>
		</aside>
	)
}
