'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Trash2 } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionary'

interface Income {
	id: string
	amount: number
	date: string
	category: string | null
	note: string | null
}

interface LimitCheck {
	status: string
	usedPercent: number
	remainingTenge: number
	limitTenge: number
}

interface Props {
	dict: Dictionary
	refreshTrigger: number
}

export default function IncomeHistory({ dict, refreshTrigger }: Props) {
	const [incomes, setIncomes] = useState<Income[]>([])
	const [totalIncome, setTotalIncome] = useState(0)
	const [limitCheck, setLimitCheck] = useState<LimitCheck | null>(null)
	const [loading, setLoading] = useState(true)

	const fetchIncomes = useCallback(async () => {
		setLoading(true)
		const res = await fetch('/api/incomes')
		if (res.ok) {
			const data = await res.json()
			setIncomes(data.incomes)
			setTotalIncome(data.totalIncome)
			setLimitCheck(data.limitCheck)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchIncomes()
	}, [fetchIncomes, refreshTrigger])

	async function handleDelete(id: string) {
		const res = await fetch(`/api/incomes?id=${id}`, { method: 'DELETE' })
		if (res.ok) {
			toast.success('Удалено')
			fetchIncomes()
		}
	}

	// Цвет прогресс-бара лимита
	const limitColor =
		limitCheck?.status === 'exceeded'
			? 'bg-red-500'
			: limitCheck?.status === 'critical'
				? 'bg-orange-500'
				: limitCheck?.status === 'warning'
					? 'bg-yellow-500'
					: 'bg-green-500'

	return (
		<div className='space-y-4'>
			{/* Лимит прогресс */}
			{limitCheck && (
				<div className='bg-background rounded-xl border p-6'>
					<div className='flex justify-between items-center mb-3'>
						<p className='text-base font-medium'>{dict.dashboard.limit_used}</p>
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

			{/* История */}
			<div className='bg-background rounded-xl border'>
				<div className='p-6 border-b'>
					<h2 className='text-xl font-semibold'>{dict.income.history}</h2>
				</div>

				{loading ? (
					<div className='p-6 text-center text-base text-muted-foreground'>
						{dict.common.loading}
					</div>
				) : incomes.length === 0 ? (
					<div className='p-6 text-center text-base text-muted-foreground'>
						{dict.employees.no_employees}
					</div>
				) : (
					<div className='divide-y'>
						{incomes.map(income => (
							<div
								key={income.id}
								className='flex items-center justify-between p-4 hover:bg-muted/30 transition-colors'
							>
								<div>
									<p className='text-base font-semibold'>
										{Number(income.amount).toLocaleString('ru-RU')} ₸
									</p>
									<p className='text-base text-muted-foreground'>
										{new Date(income.date).toLocaleDateString('ru-RU')}
										{income.note && ` · ${income.note}`}
									</p>
								</div>
								<button
									onClick={() => handleDelete(income.id)}
									className='p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50'
								>
									<Trash2 className='w-4 h-4' />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
