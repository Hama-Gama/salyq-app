'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { calculateIncomeTax, calculateSelfPayments } from '@/lib/calculations'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
	dict: Dictionary
	onSuccess: () => void
}

export default function IncomeInput({ dict, onSuccess }: Props) {
	const [amount, setAmount] = useState('')
	const [loading, setLoading] = useState(false)

	// Расчёт в реальном времени
	const numAmount = parseFloat(amount.replace(/\s/g, '')) || 0
	const taxResult = numAmount > 0 ? calculateIncomeTax(numAmount) : null
	const selfPayments = calculateSelfPayments(85_000)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!numAmount || numAmount <= 0) {
			toast.error(dict.errors.invalid_amount)
			return
		}

		setLoading(true)

		const res = await fetch('/api/incomes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: numAmount }),
		})

		const data = await res.json()

		if (!res.ok) {
			toast.error(dict.errors.server_error)
			setLoading(false)
			return
		}

		// Показываем алерт если близко к лимиту
		if (data.limitCheck?.status === 'warning') {
			toast.warning(dict.alerts.limit_85)
		} else if (data.limitCheck?.status === 'critical') {
			toast.error(dict.alerts.limit_95)
		} else if (data.limitCheck?.status === 'exceeded') {
			toast.error(dict.alerts.limit_100)
		} else {
			toast.success(dict.income.calculate + ' ✓')
		}

		setAmount('')
		onSuccess()
		setLoading(false)
	}

	// Форматирование числа с пробелами
	function formatAmount(value: string) {
		const num = value.replace(/\D/g, '')
		return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

	return (
		<div className='bg-background rounded-xl border p-6 space-y-6'>
			<h2 className='text-xl font-semibold'>{dict.income.add}</h2>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='block text-base font-medium mb-2'>
						{dict.income.amount}
					</label>
					<div className='relative'>
						<input
							type='text'
							inputMode='numeric'
							value={formatAmount(amount)}
							onChange={e => setAmount(e.target.value.replace(/\s/g, ''))}
							placeholder='0'
							className='w-full border rounded-lg px-4 py-3 text-xl font-semibold pr-12 focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<span className='absolute right-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground'>
							₸
						</span>
					</div>
				</div>

				{/* Предварительный расчёт */}
				{taxResult && (
					<div className='bg-muted rounded-lg p-4 space-y-3'>
						<p className='text-base font-medium'>{dict.income.tax_estimate}:</p>

						<div className='space-y-2'>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.dashboard.tax_amount}
								</span>
								<span className='font-semibold text-foreground'>
									{taxResult.safeTax.toLocaleString('ru-RU')} ₸
								</span>
							</div>

							<div className='border-t pt-2 space-y-1'>
								<p className='text-base text-muted-foreground font-medium'>
									{dict.payments.opv} (за себя):
								</p>
								<div className='flex justify-between text-base'>
									<span className='text-muted-foreground'>
										{dict.payments.opv}
									</span>
									<span>{selfPayments.opv.toLocaleString('ru-RU')} ₸</span>
								</div>
								<div className='flex justify-between text-base'>
									<span className='text-muted-foreground'>
										{dict.payments.opvr}
									</span>
									<span>{selfPayments.opvr.toLocaleString('ru-RU')} ₸</span>
								</div>
								<div className='flex justify-between text-base'>
									<span className='text-muted-foreground'>
										{dict.payments.vosms}
									</span>
									<span>{selfPayments.vosms.toLocaleString('ru-RU')} ₸</span>
								</div>
								<div className='flex justify-between text-base'>
									<span className='text-muted-foreground'>
										{dict.payments.so}
									</span>
									<span>{selfPayments.so.toLocaleString('ru-RU')} ₸</span>
								</div>
							</div>

							<div className='border-t pt-2 flex justify-between text-base font-semibold'>
								<span>{dict.income.total}</span>
								<span>
									{(taxResult.safeTax + selfPayments.total).toLocaleString(
										'ru-RU',
									)}{' '}
									₸
								</span>
							</div>
						</div>
					</div>
				)}

				<button
					type='submit'
					disabled={loading || !numAmount}
					className='w-full bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{loading ? dict.common.loading : dict.income.add}
				</button>
			</form>
		</div>
	)
}
