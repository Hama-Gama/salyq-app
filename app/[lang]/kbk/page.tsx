'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Copy, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import { TAX_CONFIG } from '@/constants/tax-config'

interface KbkRow {
	id: string
	name: string
	nameKz: string
	kbk: string
	knp_current: string
	knp_penalty: string
	account: string
	who: 'self' | 'employee' | 'both'
}

const KBK_DATA: KbkRow[] = [
	{
		id: 'opv',
		name: 'Пенсионные взносы (ОПВ)',
		nameKz: 'Зейнетақы жарналары (МЗЖ)',
		kbk: TAX_CONFIG.self_payments.opv.kbk,
		knp_current: TAX_CONFIG.self_payments.opv.knp_current,
		knp_penalty: TAX_CONFIG.self_payments.opv.knp_penalty,
		account: TAX_CONFIG.self_payments.opv.account,
		who: 'both',
	},
	{
		id: 'opvr',
		name: 'Взносы работодателя (ОПВР)',
		nameKz: 'Жұмыс берушінің жарналары (МЖЗЖ)',
		kbk: TAX_CONFIG.self_payments.opvr.kbk,
		knp_current: TAX_CONFIG.self_payments.opvr.knp_current,
		knp_penalty: TAX_CONFIG.self_payments.opvr.knp_penalty,
		account: TAX_CONFIG.self_payments.opvr.account,
		who: 'both',
	},
	{
		id: 'vosms',
		name: 'Медстрахование работника (ВОСМС)',
		nameKz: 'Қызметкердің медсақтандыруы (МӘМС)',
		kbk: TAX_CONFIG.self_payments.vosms.kbk,
		knp_current: TAX_CONFIG.self_payments.vosms.knp_current,
		knp_penalty: TAX_CONFIG.self_payments.vosms.knp_penalty,
		account: TAX_CONFIG.self_payments.vosms.account,
		who: 'both',
	},
	{
		id: 'oosms',
		name: 'Медстрахование работодателя (ООСМС)',
		nameKz: 'Жұмыс берушінің медсақтандыруы (АӘМС)',
		kbk: TAX_CONFIG.employee_payments.oosms.kbk,
		knp_current: TAX_CONFIG.employee_payments.oosms.knp_current,
		knp_penalty: TAX_CONFIG.employee_payments.oosms.knp_penalty,
		account: TAX_CONFIG.employee_payments.oosms.account,
		who: 'employee',
	},
	{
		id: 'so',
		name: 'Социальные отчисления (СО)',
		nameKz: 'Әлеуметтік аударымдар (ӘА)',
		kbk: TAX_CONFIG.self_payments.so.kbk,
		knp_current: TAX_CONFIG.self_payments.so.knp_current,
		knp_penalty: TAX_CONFIG.self_payments.so.knp_penalty,
		account: TAX_CONFIG.self_payments.so.account,
		who: 'both',
	},
	{
		id: 'ipn',
		name: 'Подоходный налог с сотрудника (ИПН)',
		nameKz: 'Қызметкердің табыс салығы (ЖТС)',
		kbk: TAX_CONFIG.employee_payments.ipn.kbk,
		knp_current: TAX_CONFIG.employee_payments.ipn.knp_current,
		knp_penalty: TAX_CONFIG.employee_payments.ipn.knp_penalty,
		account: TAX_CONFIG.employee_payments.ipn.account,
		who: 'employee',
	},
	{
		id: 'tax_910',
		name: 'Налог по 910 форме (4%)',
		nameKz: '910 нысаны бойынша салық (4%)',
		kbk: TAX_CONFIG.tax_income.kbk,
		knp_current: TAX_CONFIG.tax_income.knp_current,
		knp_penalty: TAX_CONFIG.tax_income.knp_penalty,
		account: TAX_CONFIG.employee_payments.ipn.account,
		who: 'self',
	},
]

type FilterType = 'all' | 'self' | 'employee'

export default function KbkPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading } = useDictionary(lang)
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<FilterType>('all')

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text)
		toast.success(
			`${label}: ${text} — ${dict?.payments.copied ?? 'Скопировано!'}`,
		)
	}

	if (loading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>
					{dict?.common.loading ?? 'Загрузка...'}
				</p>
			</div>
		)
	}


	const filtered = KBK_DATA.filter(row => {
		const name = lang === 'ru' ? row.name : row.nameKz

		// Поиск — нормализуем оба значения к нижнему регистру
		const searchLower = search.toLowerCase()
		const matchSearch =
			search === '' ||
			name.toLowerCase().includes(searchLower) ||
			row.kbk.includes(searchLower) ||
			row.knp_current.includes(searchLower)

		// Фильтр по типу
		const matchFilter =
			filter === 'all' || row.who === filter || row.who === 'both'

		return matchSearch && matchFilter
	})

	const filterLabels: Record<FilterType, string> = {
		all: lang === 'ru' ? 'Все' : 'Барлығы',
		self: lang === 'ru' ? 'За себя' : 'Өзі үшін',
		employee: lang === 'ru' ? 'За сотрудника' : 'Қызметкер үшін',
	}

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-3xl font-bold'>{dict.kbk.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{dict.kbk.subtitle}
				</p>
			</div>

			{/* Поиск и фильтр */}
			<div className='flex flex-col sm:flex-row gap-3'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
					<input
						type='text'
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder={dict.kbk.search}
						className='w-full border rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
					/>
				</div>
				<div className='flex gap-2'>
					{(['all', 'self', 'employee'] as FilterType[]).map(f => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
								filter === f
									? 'bg-primary text-primary-foreground'
									: 'border hover:bg-muted'
							}`}
						>
							{filterLabels[f]}
						</button>
					))}
				</div>
			</div>

			{/* Таблица КБК */}
			<div className='space-y-3'>
				{filtered.length === 0 ? (
					<div className='bg-background rounded-xl border p-12 text-center'>
						<p className='text-base text-muted-foreground'>
							{lang === 'ru' ? 'Ничего не найдено' : 'Ештеңе табылмады'}
						</p>
					</div>
				) : (
					filtered.map(row => (
						<div
							key={row.id}
							className='bg-background rounded-xl border p-4 md:p-6'
						>
							{/* Название */}
							<p className='text-base font-semibold mb-4'>
								{lang === 'ru' ? row.name : row.nameKz}
							</p>

							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
								{/* КБК */}
								<div className='bg-muted rounded-lg p-3'>
									<p className='text-base text-muted-foreground mb-1'>
										{dict.kbk.kbk}
									</p>
									<div className='flex items-center justify-between gap-2'>
										<p className='text-base font-mono font-semibold'>
											{row.kbk}
										</p>
										<button
											onClick={() => copyToClipboard(row.kbk, 'КБК')}
											className='p-1.5 hover:bg-background rounded-lg transition-colors shrink-0'
										>
											<Copy className='w-4 h-4 text-muted-foreground' />
										</button>
									</div>
								</div>

								{/* КНП текущий */}
								<div className='bg-muted rounded-lg p-3'>
									<p className='text-base text-muted-foreground mb-1'>
										{dict.kbk.knp_current}
									</p>
									<div className='flex items-center justify-between gap-2'>
										<p className='text-base font-mono font-semibold'>
											{row.knp_current}
										</p>
										<button
											onClick={() => copyToClipboard(row.knp_current, 'КНП')}
											className='p-1.5 hover:bg-background rounded-lg transition-colors shrink-0'
										>
											<Copy className='w-4 h-4 text-muted-foreground' />
										</button>
									</div>
								</div>

								{/* КНП пеня */}
								<div className='bg-muted rounded-lg p-3'>
									<p className='text-base text-muted-foreground mb-1'>
										{dict.kbk.knp_penalty}
									</p>
									<div className='flex items-center justify-between gap-2'>
										<p className='text-base font-mono font-semibold'>
											{row.knp_penalty}
										</p>
										<button
											onClick={() =>
												copyToClipboard(row.knp_penalty, 'КНП пеня')
											}
											className='p-1.5 hover:bg-background rounded-lg transition-colors shrink-0'
										>
											<Copy className='w-4 h-4 text-muted-foreground' />
										</button>
									</div>
								</div>

								{/* Счёт получателя */}
								<div className='bg-muted rounded-lg p-3'>
									<p className='text-base text-muted-foreground mb-1'>
										{dict.kbk.account}
									</p>
									<div className='flex items-center justify-between gap-2'>
										<p className='text-base font-mono font-semibold truncate'>
											{row.account}
										</p>
										<button
											onClick={() =>
												copyToClipboard(row.account, dict.kbk.account)
											}
											className='p-1.5 hover:bg-background rounded-lg transition-colors shrink-0'
										>
											<Copy className='w-4 h-4 text-muted-foreground' />
										</button>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
