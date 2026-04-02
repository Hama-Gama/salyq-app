'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import EmployeeForm from '@/components/employees/EmployeeForm'
import EmployeeCard from '@/components/employees/EmployeeCard'

interface EmployeePayments {
	opv: number
	vosms: number
	ipn: number
	withheldTotal: number
	opvr: number
	oosms: number
	so: number
	employerTotal: number
	netSalary: number
	grossCost: number
}

interface Employee {
	id: string
	name: string
	salary: number
	isActive: boolean
	hiredAt: string
	firedAt: string | null
	payments: EmployeePayments
}

interface Summary {
	activeCount: number
	totalEmployerCost: number
	totalEmployerExtra: number
}

export default function EmployeesPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)

	const [employees, setEmployees] = useState<Employee[]>([])
	const [summary, setSummary] = useState<Summary | null>(null)
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)

	const fetchEmployees = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/employees')
			if (res.ok) {
				const data = await res.json()
				setEmployees(data.employees ?? [])
				setSummary(data.summary ?? null)
			}
		} catch (e) {
			console.error('Ошибка загрузки сотрудников:', e)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchEmployees()
	}, [fetchEmployees])

	if (dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>Загрузка...</p>
			</div>
		)
	}

	return (
		<div className='space-y-6 max-w-4xl'>
			{/* Заголовок */}
			<div className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>{dict.employees.title}</h1>
					{summary && (
						<p className='text-base text-muted-foreground mt-1'>
							{summary.activeCount} {dict.employees.active.toLowerCase()}
						</p>
					)}
				</div>
				<button
					onClick={() => setShowForm(!showForm)}
					className='flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors shrink-0'
				>
					<Plus className='w-5 h-5' />
					<span className='hidden sm:inline'>{dict.employees.add}</span>
				</button>
			</div>

			{/* Итоговые карточки */}
			{summary && summary.activeCount > 0 && (
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<div className='bg-background rounded-xl border p-6'>
						<p className='text-base text-muted-foreground'>
							{dict.employees.employer_total}
						</p>
						<p className='text-2xl font-bold mt-2'>
							{summary.totalEmployerExtra.toLocaleString('ru-RU')} ₸
						</p>
						<p className='text-base text-muted-foreground mt-1'>
							{lang === 'ru' ? 'доп. расходы в месяц' : 'қосымша шығын айына'}
						</p>
					</div>
					<div className='bg-background rounded-xl border p-6'>
						<p className='text-base text-muted-foreground'>
							{dict.employees.gross_cost}
						</p>
						<p className='text-2xl font-bold mt-2'>
							{summary.totalEmployerCost.toLocaleString('ru-RU')} ₸
						</p>
						<p className='text-base text-muted-foreground mt-1'>
							{lang === 'ru' ? 'полная стоимость в месяц' : 'толық құны айына'}
						</p>
					</div>
				</div>
			)}

			{/* Форма добавления */}
			{showForm && (
				<EmployeeForm
					dict={dict}
					onSuccess={() => {
						setShowForm(false)
						fetchEmployees()
					}}
					onCancel={() => setShowForm(false)}
				/>
			)}

			{/* Список сотрудников */}
			{loading ? (
				<div className='text-center py-12 text-base text-muted-foreground'>
					{dict.common.loading}
				</div>
			) : employees.length === 0 ? (
				<div className='bg-background rounded-xl border p-12 text-center'>
					<p className='text-base text-muted-foreground'>
						{dict.employees.no_employees}
					</p>
				</div>
			) : (
				<div className='space-y-4'>
					{employees.map(emp => (
						<EmployeeCard
							key={emp.id}
							employee={emp}
							dict={dict}
							onFired={fetchEmployees}
						/>
					))}
				</div>
			)}
		</div>
	)
}
