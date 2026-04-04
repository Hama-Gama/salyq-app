'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Обновляем интерфейс, добавляя currentPath как необязательный или обязательный параметр
export default function LanguageSwitcher({
	currentLang,
	currentPath, // Добавляем сюда, чтобы Navbar не ругался
}: {
	currentLang: string
	currentPath?: string // Добавляем поддержку пропса из Navbar
}) {
	const pathname = usePathname()

	const getNewPath = (newLang: string) => {
		// Приоритет отдаем pathname из хука, если его нет — берем из пропса
		const activePath = pathname || currentPath || ''

		if (!activePath) return `/${newLang}`

		const segments = activePath.split('/')

		// Проверяем, есть ли уже локаль в URL (ru или kz)
		if (segments[1] === 'ru' || segments[1] === 'kz') {
			segments[1] = newLang
		} else {
			// Если зашли по прямому пути без префикса
			segments.splice(1, 0, newLang)
		}

		const finalPath = segments.join('/')
		return finalPath === '' ? `/${newLang}` : finalPath
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
				<Link href={getNewPath('kz')}>KZ</Link>
			</Button>
		</div>
	)
}
