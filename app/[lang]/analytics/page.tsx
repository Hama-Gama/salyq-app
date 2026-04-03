'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import { calculateIncomeTax, calculateSelfPayments } from '@/lib/calculations'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	Legend,
} from 'recharts'

interface Income {
	id: string
	amount: number
	date: string
}

interface MonthlyData {
	month: string
	income: number
	tax: number
	payments: number
	total: number
}

export default function AnalyticsPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)

	const [incomes, setIncomes] = useState<Income[]>([])
	const [totalIncome, setTotalIncome] = useState(0)
	const [limitCheck, setLimitCheck] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch('/api/incomes?limit=50')
			.then(r => r.json())
			.then(data => {
				setIncomes(data.incomes ?? [])
				setTotalIncome(data.totalIncome ?? 0)
				setLimitCheck(data.limitCheck ?? null)
				setLoading(false)
			})
	}, [])

	if (dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>Загрузка...</p>
			</div>
		)
	}

	// Группируем доходы по месяцам
	const monthlyMap: Record<string, number> = {}
	incomes.forEach(inc => {
		const date = new Date(inc.date)
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(inc.amount)
	})

	const monthNamesRu = [
		'Янв',
		'Фев',
		'Мар',
		'Апр',
		'Май',
		'Июн',
		'Июл',
		'Авг',
		'Сен',
		'Окт',
		'Ноя',
		'Дек',
	]
	const monthNamesKz = [
		'Қаң',
		'Ақп',
		'Нау',
		'Сәу',
		'Мам',
		'Мау',
		'Шіл',
		'Там',
		'Қыр',
		'Қаз',
		'Қар',
		'Жел',
	]
	const monthNames = lang === 'ru' ? monthNamesRu : monthNamesKz

	// Генерируем данные для всех 12 месяцев текущего года
	const currentYear = new Date().getFullYear()
	const monthlyData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
		const key = `${currentYear}-${String(i + 1).padStart(2, '0')}`
		const income = monthlyMap[key] ?? 0
		const taxResult = income > 0 ? calculateIncomeTax(income) : null
		const selfPayments = calculateSelfPayments(85_000)

		return {
			month: monthNames[i],
			income,
			tax: taxResult?.safeTax ?? 0,
			payments: selfPayments.total,
			total: (taxResult?.safeTax ?? 0) + selfPayments.total,
		}
	})

	// Считаем итоги за год
	const yearTax = calculateIncomeTax(totalIncome).safeTax
	const selfPaymentsTotal = calculateSelfPayments(85_000).total * 12

	const limitColor =
		limitCheck?.status === 'exceeded'
			? 'bg-red-500'
			: limitCheck?.status === 'critical'
				? 'bg-orange-500'
				: limitCheck?.status === 'warning'
					? 'bg-yellow-500'
					: 'bg-green-500'

	// Форматирование для tooltip
	function formatTenge(value: number) {
		return `${value.toLocaleString('ru-RU')} ₸`
	}

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-3xl font-bold'>{dict.nav.analytics}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{lang === 'ru'
						? `Статистика за ${currentYear} год`
						: `${currentYear} жылғы статистика`}
				</p>
			</div>

			{/* Сводные карточки */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-base text-muted-foreground'>
						{dict.dashboard.total_income}
					</p>
					<p className='text-2xl font-bold mt-2'>
						{totalIncome.toLocaleString('ru-RU')} ₸
					</p>
				</div>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-base text-muted-foreground'>
						{dict.dashboard.tax_amount}
					</p>
					<p className='text-2xl font-bold mt-2'>
						{yearTax.toLocaleString('ru-RU')} ₸
					</p>
				</div>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-base text-muted-foreground'>
						{lang === 'ru' ? 'Соцплатежи за год' : 'Жылдық әлеуметтік төлемдер'}
					</p>
					<p className='text-2xl font-bold mt-2'>
						{selfPaymentsTotal.toLocaleString('ru-RU')} ₸
					</p>
				</div>
				<div className='bg-background rounded-xl border p-6'>
					<p className='text-base text-muted-foreground'>
						{lang === 'ru' ? 'Итого обязательств' : 'Жалпы міндеттемелер'}
					</p>
					<p className='text-2xl font-bold mt-2 text-red-500'>
						{(yearTax + selfPaymentsTotal).toLocaleString('ru-RU')} ₸
					</p>
				</div>
			</div>

			{/* Прогресс лимита */}
			{limitCheck && (
				<div className='bg-background rounded-xl border p-6'>
					<div className='flex justify-between items-center mb-3'>
						<p className='text-base font-semibold'>
							{dict.dashboard.limit_used}
						</p>
						<p className='text-base font-semibold'>
							{limitCheck.usedPercent.toFixed(1)}%
						</p>
					</div>
					<div className='h-3 bg-muted rounded-full overflow-hidden'>
						<div
							className={`h-full rounded-full transition-all ${limitColor}`}
							style={{ width: `${Math.min(limitCheck.usedPercent, 100)}%` }}
						/>
					</div>
					<div className='flex justify-between mt-2'>
						<p className='text-base text-muted-foreground'>
							{totalIncome.toLocaleString('ru-RU')} ₸
						</p>
						<p className='text-base text-muted-foreground'>
							{limitCheck.limitTenge.toLocaleString('ru-RU')} ₸
						</p>
					</div>
				</div>
			)}

			{/* График доходов по месяцам */}
			<div className='bg-background rounded-xl border p-6'>
				<h2 className='text-xl font-semibold mb-6'>
					{lang === 'ru' ? 'Доходы по месяцам' : 'Айлар бойынша табыс'}
				</h2>
				{loading ? (
					<div className='h-64 flex items-center justify-center'>
						<p className='text-base text-muted-foreground'>
							{dict.common.loading}
						</p>
					</div>
				) : (
					<ResponsiveContainer width='100%' height={300}>
						<BarChart
							data={monthlyData}
							margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray='3 3' className='opacity-30' />
							<XAxis dataKey='month' tick={{ fontSize: 14 }} />
							<YAxis
								tick={{ fontSize: 14 }}
								tickFormatter={v => (v > 0 ? `${(v / 1000).toFixed(0)}к` : '0')}
							/>
							<Tooltip
								formatter={(value: number) => formatTenge(value)}
								labelStyle={{ fontSize: 14 }}
								contentStyle={{ fontSize: 14 }}
							/>
							<Bar
								dataKey='income'
								name={lang === 'ru' ? 'Доход' : 'Табыс'}
								fill='hsl(var(--primary))'
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* График налогов и платежей */}
			<div className='bg-background rounded-xl border p-6'>
				<h2 className='text-xl font-semibold mb-6'>
					{lang === 'ru'
						? 'Налоги и платежи по месяцам'
						: 'Айлар бойынша салықтар мен төлемдер'}
				</h2>
				{loading ? (
					<div className='h-64 flex items-center justify-center'>
						<p className='text-base text-muted-foreground'>
							{dict.common.loading}
						</p>
					</div>
				) : (
					<ResponsiveContainer width='100%' height={300}>
						<LineChart
							data={monthlyData}
							margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray='3 3' className='opacity-30' />
							<XAxis dataKey='month' tick={{ fontSize: 14 }} />
							<YAxis
								tick={{ fontSize: 14 }}
								tickFormatter={v => (v > 0 ? `${(v / 1000).toFixed(0)}к` : '0')}
							/>
							<Tooltip
								formatter={(value: number) => formatTenge(value)}
								labelStyle={{ fontSize: 14 }}
								contentStyle={{ fontSize: 14 }}
							/>
							<Legend wrapperStyle={{ fontSize: 14 }} />
							<Line
								type='monotone'
								dataKey='tax'
								name={lang === 'ru' ? 'Налог 4%' : 'Салық 4%'}
								stroke='#ef4444'
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type='monotone'
								dataKey='payments'
								name={lang === 'ru' ? 'Соцплатежи' : 'Әлеум. төлемдер'}
								stroke='#3b82f6'
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type='monotone'
								dataKey='total'
								name={lang === 'ru' ? 'Итого' : 'Жиыны'}
								stroke='#8b5cf6'
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Детальная таблица */}
			<div className='bg-background rounded-xl border overflow-hidden'>
				<div className='p-6 border-b'>
					<h2 className='text-xl font-semibold'>
						{lang === 'ru'
							? 'Детализация по месяцам'
							: 'Айлар бойынша толық есеп'}
					</h2>
				</div>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='border-b bg-muted/30'>
								<th className='text-left p-4 text-base font-medium text-muted-foreground'>
									{lang === 'ru' ? 'Месяц' : 'Ай'}
								</th>
								<th className='text-right p-4 text-base font-medium text-muted-foreground'>
									{dict.dashboard.total_income}
								</th>
								<th className='text-right p-4 text-base font-medium text-muted-foreground'>
									{dict.dashboard.tax_amount}
								</th>
								<th className='text-right p-4 text-base font-medium text-muted-foreground'>
									{lang === 'ru' ? 'Соцплатежи' : 'Әлеум. төлемдер'}
								</th>
								<th className='text-right p-4 text-base font-medium text-muted-foreground'>
									{lang === 'ru' ? 'Итого' : 'Жиыны'}
								</th>
							</tr>
						</thead>
						<tbody>
							{monthlyData.map((row, i) => (
								<tr
									key={i}
									className='border-b last:border-0 hover:bg-muted/20 transition-colors'
								>
									<td className='p-4 text-base font-medium'>{row.month}</td>
									<td className='p-4 text-base text-right'>
										{row.income > 0 ? (
											`${row.income.toLocaleString('ru-RU')} ₸`
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</td>
									<td className='p-4 text-base text-right text-red-500'>
										{row.tax > 0 ? (
											`${row.tax.toLocaleString('ru-RU')} ₸`
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</td>
									<td className='p-4 text-base text-right text-blue-500'>
										{row.payments.toLocaleString('ru-RU')} ₸
									</td>
									<td className='p-4 text-base text-right font-semibold'>
										{row.total > 0
											? `${row.total.toLocaleString('ru-RU')} ₸`
											: `${row.payments.toLocaleString('ru-RU')} ₸`}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr className='bg-muted/30 font-semibold'>
								<td className='p-4 text-base'>
									{lang === 'ru' ? 'Итого за год' : 'Жылдық жиыны'}
								</td>
								<td className='p-4 text-base text-right'>
									{totalIncome.toLocaleString('ru-RU')} ₸
								</td>
								<td className='p-4 text-base text-right text-red-500'>
									{yearTax.toLocaleString('ru-RU')} ₸
								</td>
								<td className='p-4 text-base text-right text-blue-500'>
									{selfPaymentsTotal.toLocaleString('ru-RU')} ₸
								</td>
								<td className='p-4 text-base text-right'>
									{(yearTax + selfPaymentsTotal).toLocaleString('ru-RU')} ₸
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	)
}
