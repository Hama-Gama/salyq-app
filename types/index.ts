export type Locale = 'ru' | 'kz'

export type SubType = 'FREE' | 'PRO' | 'BUSINESS' | 'MANUAL_GRANT'

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE'

export type TicketType = 'BUG' | 'FEATURE' | 'TAX_HELP'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export type DocType = 'RECEIPT' | 'REPORT' | 'TAX_RETURN'

export interface NavItem {
	href: string
	labelKey: string
	icon: string
}

// Тип словаря — импортируется из dictionary.ts
export type { Dictionary } from '@/lib/dictionary'
