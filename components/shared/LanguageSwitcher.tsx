'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher({
	currentLang,
}: {
	currentLang: string
}) {
	const pathname = usePathname()

	const getNewPath = (newLang: string) => {
		if (!pathname) return `/${newLang}`

		const segments = pathname.split('/')

		// Проверяем, есть ли уже локаль в URL (ru или kz)
		// Твой proxy.ts ожидает именно эти два варианта
		if (segments[1] === 'ru' || segments[1] === 'kz') {
			segments[1] = newLang
		} else {
			// Если зашли по прямому пути без префикса (например /employees)
			segments.splice(1, 0, newLang)
		}

		return segments.join('/') || '/'
	}

	return (
		<div className='flex gap-1 items-center bg-muted/50 p-1 rounded-lg border'>
			<Button
				variant={currentLang === 'ru' ? 'secondary' : 'ghost'}
				size='sm'
				className='h-7 px-2.5 text-[10px] font-bold'
				asChild
			>
				<Link href={getNewPath('ru')}>RU</Link>
			</Button>
			<Button
				variant={currentLang === 'kz' ? 'secondary' : 'ghost'}
				size='sm'
				className='h-7 px-2.5 text-[10px] font-bold'
				asChild
			>
				{/* Теперь строго KZ, как в твоем proxy.ts */}
				<Link href={getNewPath('kz')}>KZ</Link>
			</Button>
		</div>
	)
}
