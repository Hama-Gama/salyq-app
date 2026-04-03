'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import { TAX_CONFIG } from '@/constants/tax-config'
import {
	getMonthlyDeadline,
	getDeadlineStatus,
	formatDeadline,
	getDaysUntilDeadline,
} from '@/lib/deadlines'
import { CheckCircle, Clock, AlertTriangle, XCircle, Copy } from 'lucide-react'
import { toast } from 'react-toastify'

interface DeadlineItem {
	id: string
	titleKey: string
	date: Date
	kbk?: string
	knp?: string
	amount?: string
	type: 'monthly' | 'semi_annual' | 'form_910'
}

export default function CalendarPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)
	const [totalIncome, setTotalIncome] = useState(0)

	useEffect(() => {
		// Получаем общий доход для расчёта налога
		fetch('/api/incomes')
			.then(r => r.json())
			.then(data => {
				setTotalIncome(data.totalIncome ?? 0)
			})
	}, [])

	if (dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>
					{dict?.common.loading ?? 'Загрузка...'}
				</p>
			</div>
		)
	}

	// Генерируем все дедлайны на 2026 год
	const deadlines: DeadlineItem[] = []
	const now = new Date()
	const currentYear = now.getFullYear()

	// Ежемесячные платежи (ОПВ, ОПВР, ВОСМС, СО) — с января по декабрь
	for (let month = 1; month <= 12; month++) {
		const date = getMonthlyDeadline(currentYear, month)
		deadlines.push({
			id: `monthly-${month}`,
			titleKey: dict.calendar.monthly,
			date,
			kbk: TAX_CONFIG.self_payments.opv.kbk,
			knp: TAX_CONFIG.self_payments.opv.knp_current,
			type: 'monthly',
		})
	}

	// 910 форма — сдача за 1е полугодие
	deadlines.push({
		id: 'form-910-h1',
		titleKey: dict.calendar.form_910,
		date: new Date('2026-08-15'),
		kbk: TAX_CONFIG.tax_income.kbk,
		knp: TAX_CONFIG.tax_income.knp_current,
		type: 'form_910',
	})

	// 910 форма — оплата за 1е полугодие
	deadlines.push({
		id: 'pay-910-h1',
		titleKey: dict.calendar.payment_910,
		date: new Date('2026-08-25'),
		kbk: TAX_CONFIG.tax_income.kbk,
		knp: TAX_CONFIG.tax_income.knp_current,
		amount: `${Math.ceil(totalIncome * TAX_CONFIG.tax_income.rate.value).toLocaleString('ru-RU')} ₸`,
		type: 'semi_annual',
	})

	// 910 форма — сдача за 2е полугодие
	deadlines.push({
		id: 'form-910-h2',
		titleKey: dict.calendar.form_910,
		date: new Date('2027-02-15'),
		kbk: TAX_CONFIG.tax_income.kbk,
		knp: TAX_CONFIG.tax_income.knp_current,
		type: 'form_910',
	})

	// Сортируем по дате
	deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())

	// Группируем по месяцам
	const grouped: Record<string, DeadlineItem[]> = {}
	deadlines.forEach(d => {
		const key = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}`
		if (!grouped[key]) grouped[key] = []
		grouped[key].push(d)
	})

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text)
		toast.success(`${label}: ${text} — ${dict.payments.copied}`)
	}

	function getStatusIcon(date: Date) {
		const status = getDeadlineStatus(date)
		if (status === 'overdue')
			return <XCircle className='w-5 h-5 text-red-500 shrink-0' />
		if (status === 'urgent')
			return <AlertTriangle className='w-5 h-5 text-orange-500 shrink-0' />
		if (status === 'warning')
			return <Clock className='w-5 h-5 text-yellow-500 shrink-0' />
		return <CheckCircle className='w-5 h-5 text-green-500 shrink-0' />
	}

	function getStatusText(date: Date) {
		const status = getDeadlineStatus(date)
		const days = getDaysUntilDeadline(date)
		if (status === 'overdue') return dict.calendar.status_overdue
		if (status === 'urgent')
			return `${dict.calendar.status_urgent} — ${days} ${dict.dashboard.days_left}`
		if (status === 'warning') return `${days} ${dict.dashboard.days_left}`
		return dict.calendar.status_upcoming
	}

	function getStatusBg(date: Date) {
		const status = getDeadlineStatus(date)
		if (status === 'overdue') return 'border-l-4 border-l-red-500'
		if (status === 'urgent') return 'border-l-4 border-l-orange-500'
		if (status === 'warning') return 'border-l-4 border-l-yellow-500'
		return 'border-l-4 border-l-green-500'
	}

	const monthNames: Record<string, string> =
		lang === 'ru'
			? {
					'01': 'Январь',
					'02': 'Февраль',
					'03': 'Март',
					'04': 'Апрель',
					'05': 'Май',
					'06': 'Июнь',
					'07': 'Июль',
					'08': 'Август',
					'09': 'Сентябрь',
					'10': 'Октябрь',
					'11': 'Ноябрь',
					'12': 'Декабрь',
				}
			: {
					'01': 'Қаңтар',
					'02': 'Ақпан',
					'03': 'Наурыз',
					'04': 'Сәуір',
					'05': 'Мамыр',
					'06': 'Маусым',
					'07': 'Шілде',
					'08': 'Тамыз',
					'09': 'Қыркүйек',
					'10': 'Қазан',
					'11': 'Қараша',
					'12': 'Желтоқсан',
				}

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-3xl font-bold'>{dict.calendar.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{lang === 'ru'
						? 'Все дедлайны 2026 с учётом праздников РК'
						: '2026 жылғы барлық мерзімдер мейрамдарды ескере отырып'}
				</p>
			</div>

			{/* Легенда */}
			<div className='flex flex-wrap gap-4 text-base'>
				<div className='flex items-center gap-2'>
					<CheckCircle className='w-4 h-4 text-green-500' />
					<span className='text-muted-foreground'>
						{dict.calendar.status_upcoming}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<Clock className='w-4 h-4 text-yellow-500' />
					<span className='text-muted-foreground'>
						{dict.calendar.status_soon}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<AlertTriangle className='w-4 h-4 text-orange-500' />
					<span className='text-muted-foreground'>
						{dict.calendar.status_urgent}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<XCircle className='w-4 h-4 text-red-500' />
					<span className='text-muted-foreground'>
						{dict.calendar.status_overdue}
					</span>
				</div>
			</div>

			{/* Календарь по месяцам */}
			{Object.entries(grouped).map(([monthKey, items]) => {
				const [year, month] = monthKey.split('-')
				const monthName = monthNames[month] ?? month
				const isPast =
					new Date(parseInt(year), parseInt(month) - 1) <
					new Date(now.getFullYear(), now.getMonth())

				return (
					<div key={monthKey} className={isPast ? 'opacity-50' : ''}>
						<h2 className='text-xl font-semibold mb-3'>
							{monthName} {year}
						</h2>
						<div className='space-y-3'>
							{items.map(item => (
								<div
									key={item.id}
									className={`bg-background rounded-xl border p-4 ${getStatusBg(item.date)}`}
								>
									<div className='flex items-start justify-between gap-3'>
										<div className='flex items-start gap-3 flex-1 min-w-0'>
											{getStatusIcon(item.date)}
											<div className='flex-1 min-w-0'>
												<p className='text-base font-semibold'>
													{item.titleKey}
												</p>
												<p className='text-base text-muted-foreground'>
													{dict.calendar.deadline}: {formatDeadline(item.date)}
												</p>
												{item.amount && (
													<p className='text-base font-medium text-primary mt-1'>
														~{item.amount}
													</p>
												)}
												<p className='text-base text-muted-foreground mt-1'>
													{getStatusText(item.date)}
												</p>
											</div>
										</div>

										{/* КБК и КНП */}
										{(item.kbk || item.knp) && (
											<div className='flex flex-col gap-2 shrink-0'>
												{item.kbk && (
													<button
														onClick={() => copyToClipboard(item.kbk!, 'КБК')}
														className='flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-lg transition-colors'
													>
														<Copy className='w-4 h-4' />
														КБК {item.kbk}
													</button>
												)}
												{item.knp && (
													<button
														onClick={() => copyToClipboard(item.knp!, 'КНП')}
														className='flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-lg transition-colors'
													>
														<Copy className='w-4 h-4' />
														КНП {item.knp}
													</button>
												)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)
			})}
		</div>
	)
}
