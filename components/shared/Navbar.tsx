import { auth, signOut } from '@/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import type { Locale, Dictionary } from '@/types'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

interface Props {
	lang: Locale
	dict: Dictionary
	currentPath: string
}

export default async function Navbar({ lang, dict, currentPath }: Props) {
	const session = await auth()
	const user = session?.user

	const prefix = `/${lang}`

	const initials = user?.name
		? user.name
				.split(' ')
				.map(n => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: 'U'

	return (
		<header className='sticky top-0 z-50 bg-background border-b h-14 flex items-center px-4 gap-4'>
			<MobileMenu lang={lang} dict={dict} currentPath={currentPath} />

			<div className='flex-1' />

			{/* Передаем текущий путь, чтобы switcher знал, где мы находимся */}
			<LanguageSwitcher currentLang={lang} currentPath={currentPath} />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className='rounded-full outline-none hover:opacity-80 transition-opacity'>
						<Avatar className='w-8 h-8'>
							<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
							<AvatarFallback className='text-xs bg-muted'>
								{initials}
							</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-56'>
					<div className='px-3 py-2'>
						<p className='text-sm font-medium truncate'>{user?.name}</p>
						<p className='text-xs text-muted-foreground truncate'>
							{user?.email}
						</p>
					</div>
					<DropdownMenuSeparator />

					<DropdownMenuItem asChild>
						<Link
							href={`${prefix}/profile`}
							className='flex items-center cursor-pointer'
						>
							<User className='w-4 h-4 mr-2' />
							{lang === 'ru' ? 'Профиль' : 'Профиль'}
						</Link>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<form
						action={async () => {
							'use server'
							await signOut({ redirectTo: `${prefix}/login` })
						}}
					>
						<DropdownMenuItem asChild>
							<button
								type='submit'
								className='w-full flex items-center text-red-500 cursor-pointer'
							>
								<LogOut className='w-4 h-4 mr-2' />
								{lang === 'ru' ? 'Выйти' : 'Шығу'}
							</button>
						</DropdownMenuItem>
					</form>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	)
}
