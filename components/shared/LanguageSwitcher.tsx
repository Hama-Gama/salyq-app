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

	// Функция замены локали в текущем URL
	const getNewPath = (newLang: string) => {
		if (!pathname) return `/${newLang}`
		const segments = pathname.split('/')
		segments[1] = newLang // Заменяем [lang] (первый сегмент после /)
		return segments.join('/')
	}

	return (
		<div className='flex gap-1'>
			<Button
				variant={currentLang === 'ru' ? 'secondary' : 'ghost'}
				size='sm'
				asChild
			>
				<Link href={getNewPath('ru')}>RU</Link>
			</Button>
			<Button
				variant={currentLang === 'kz' ? 'secondary' : 'ghost'}
				size='sm'
				asChild
			>
				<Link href={getNewPath('kz')}>KZ</Link>
			</Button>
		</div>
	)
}
