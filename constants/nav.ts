import type { NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
	{ href: '/dashboard', labelKey: 'nav.dashboard', icon: 'home' },
	{ href: '/calendar', labelKey: 'nav.calendar', icon: 'calendar' },
	{ href: '/employees', labelKey: 'nav.employees', icon: 'users' },
	{ href: '/analytics', labelKey: 'nav.analytics', icon: 'bar-chart' },
	{ href: '/kbk', labelKey: 'nav.kbk', icon: 'book-open' },
	{ href: '/profile', labelKey: 'nav.profile', icon: 'user' },
	{ href: '/support', labelKey: 'nav.support', icon: 'help-circle' },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
	{ href: '/admin', labelKey: 'nav.admin', icon: 'settings' },
]
