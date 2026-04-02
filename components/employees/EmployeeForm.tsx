'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { calculateEmployeePayments } from '@/lib/calculations'
import type { Dictionary } from '@/lib/dictionary'

interface Props {
	dict: Dictionary
	onSuccess: () => void
	onCancel: () => void
}

export default function EmployeeForm({ dict, onSuccess, onCancel }: Props) {
	const [name, setName] = useState('')
	const [salary, setSalary] = useState('')
	const [loading, setLoading] = useState(false)

	const numSalary = parseFloat(salary.replace(/\s/g, '')) || 0
	const payments =
		numSalary >= 85_000 ? calculateEmployeePayments(numSalary) : null

	function formatAmount(value: string) {
		const num = value.replace(/\D/g, '')
		return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!name.trim()) {
			toast.error(dict.errors.required)
			return
		}
		if (numSalary < 85_000) {
			toast.error(dict.errors.invalid_salary)
			return
		}

		setLoading(true)

		const res = await fetch('/api/employees', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: name.trim(), salary: numSalary }),
		})

		if (res.ok) {
			toast.success(dict.employees.added_success)
			onSuccess()
		} else {
			toast.error(dict.errors.server_error)
		}

		setLoading(false)
	}

	return (
		<div className='bg-background rounded-xl border p-6 space-y-6'>
			<h2 className='text-xl font-semibold'>{dict.employees.add_title}</h2>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* ФИО */}
				<div>
					<label className='block text-base font-medium mb-2'>
						{dict.employees.name}
					</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={dict.employees.name_placeholder}
						className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
					/>
				</div>

				{/* Оклад */}
				<div>
					<label className='block text-base font-medium mb-2'>
						{dict.employees.salary}
					</label>
					<div className='relative'>
						<input
							type='text'
							inputMode='numeric'
							value={formatAmount(salary)}
							onChange={e => setSalary(e.target.value.replace(/\s/g, ''))}
							placeholder='85 000'
							className='w-full border rounded-lg px-4 py-3 text-base pr-8 focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<span className='absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground'>
							₸
						</span>
					</div>
				</div>

				{/* Предварительный расчёт */}
				{payments && (
					<div className='bg-muted rounded-lg p-4 space-y-3'>
						<p className='text-base font-medium'>{dict.employees.breakdown}:</p>

						<div className='space-y-2'>
							<p className='text-base font-medium text-muted-foreground'>
								{dict.employees.employee_deductions}:
							</p>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.opv}
								</span>
								<span>{payments.opv.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.vosms}
								</span>
								<span>{payments.vosms.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.ipn}
								</span>
								<span>{payments.ipn.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base font-semibold border-t pt-2'>
								<span>{dict.employees.net_salary}</span>
								<span className='text-green-600'>
									{payments.netSalary.toLocaleString('ru-RU')} ₸
								</span>
							</div>
						</div>

						<div className='space-y-2 border-t pt-3'>
							<p className='text-base font-medium text-muted-foreground'>
								{dict.employees.employer_costs}:
							</p>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.opvr}
								</span>
								<span>{payments.opvr.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.oosms}
								</span>
								<span>{payments.oosms.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.so}
								</span>
								<span>{payments.so.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base font-semibold border-t pt-2'>
								<span>{dict.employees.gross_cost}</span>
								<span className='text-red-500'>
									{payments.grossCost.toLocaleString('ru-RU')} ₸
								</span>
							</div>
						</div>
					</div>
				)}

				<div className='flex gap-3'>
					<button
						type='button'
						onClick={onCancel}
						className='flex-1 border py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors'
					>
						{dict.employees.cancel}
					</button>
					<button
						type='submit'
						disabled={loading}
						className='flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50'
					>
						{loading ? dict.common.loading : dict.employees.save}
					</button>
				</div>
			</form>
		</div>
	)
}
