'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NAV_ITEMS } from '@/constants/nav'
import type { Locale, Dictionary } from '@/types'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import {
	Home,
	Calendar,
	Users,
	BarChart,
	BookOpen,
	User,
	HelpCircle,
	Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	home: Home,
	calendar: Calendar,
	users: Users,
	'bar-chart': BarChart,
	'book-open': BookOpen,
	user: User,
	'help-circle': HelpCircle,
}

interface Props {
	lang: Locale
	dict: Dictionary
	currentPath: string
}

export default function MobileMenu({ lang, dict, currentPath }: Props) {
	const [open, setOpen] = useState(false)
	const prefix = lang === 'kz' ? '/kz' : ''

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button className='md:hidden p-2 rounded-lg hover:bg-muted transition-colors'>
					<Menu className='w-5 h-5' />
				</button>
			</SheetTrigger>
			<SheetContent side='left' className='w-72 p-0'>
				<SheetHeader className='p-6 border-b'>
					<SheetTitle className='text-left'>
						<span className='text-xl font-bold'>SalyqApp</span>
						<p className='text-xs text-muted-foreground font-normal mt-1'>
							{lang === 'ru' ? 'Налоговый помощник' : 'Салық көмекшісі'}
						</p>
					</SheetTitle>
				</SheetHeader>

				<nav className='p-4 space-y-1'>
					{NAV_ITEMS.map(item => {
						const Icon = ICONS[item.icon]
						const href = `${prefix}${item.href}`
						const isActive =
							currentPath === item.href ||
							currentPath.startsWith(item.href + '/')
						const [section, key] = item.labelKey.split('.')
						const label = (dict as any)[section]?.[key] ?? item.labelKey

						return (
							<Link
								key={item.href}
								href={href}
								onClick={() => setOpen(false)}
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
				</nav>
			</SheetContent>
		</Sheet>
	)
}
