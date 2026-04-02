'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { ChevronDown, ChevronUp, UserX } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Dictionary } from '@/lib/dictionary'

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

interface Props {
	employee: Employee
	dict: Dictionary
	onFired: () => void
}

export default function EmployeeCard({ employee, dict, onFired }: Props) {
	const [expanded, setExpanded] = useState(false)
	const [loading, setLoading] = useState(false)

	async function handleFire() {
		setLoading(true)
		const res = await fetch(`/api/employees?id=${employee.id}`, {
			method: 'PATCH',
		})

		if (res.ok) {
			toast.success(dict.employees.fired_success)
			onFired()
		} else {
			toast.error(dict.errors.server_error)
		}
		setLoading(false)
	}

	return (
		<div
			className={`bg-background rounded-xl border overflow-hidden ${
				!employee.isActive ? 'opacity-60' : ''
			}`}
		>
			{/* Заголовок карточки */}
			<div className='p-4 flex items-center justify-between gap-3'>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 flex-wrap'>
						<p className='text-base font-semibold truncate'>{employee.name}</p>
						<span
							className={`text-base px-2 py-0.5 rounded-full shrink-0 ${
								employee.isActive
									? 'bg-green-100 text-green-700'
									: 'bg-gray-100 text-gray-500'
							}`}
						>
							{employee.isActive ? dict.employees.active : dict.employees.fired}
						</span>
					</div>
					<p className='text-base text-muted-foreground mt-1'>
						{dict.employees.salary}:{' '}
						{Number(employee.salary).toLocaleString('ru-RU')} ₸
					</p>
					<p className='text-base text-muted-foreground'>
						{dict.employees.net_salary}:{' '}
						<span className='font-medium text-foreground'>
							{employee.payments.netSalary.toLocaleString('ru-RU')} ₸
						</span>
					</p>
				</div>

				<div className='flex items-center gap-2 shrink-0'>
					<button
						onClick={() => setExpanded(!expanded)}
						className='p-2 hover:bg-muted rounded-lg transition-colors'
					>
						{expanded ? (
							<ChevronUp className='w-5 h-5' />
						) : (
							<ChevronDown className='w-5 h-5' />
						)}
					</button>

					{employee.isActive && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<button className='p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
									<UserX className='w-5 h-5' />
								</button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle className='text-xl'>
										{dict.employees.delete_title}
									</AlertDialogTitle>
									<AlertDialogDescription className='text-base space-y-2'>
										<span className='block'>
											{dict.employees.delete_description}:{' '}
											<span className='font-semibold text-foreground'>
												{employee.name}
											</span>
										</span>
										<span className='block text-orange-500 font-medium'>
											{dict.employees.delete_warning}
										</span>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className='text-base'>
										{dict.employees.delete_cancel}
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleFire}
										disabled={loading}
										className='bg-orange-500 hover:bg-orange-600 text-white text-base'
									>
										{loading
											? dict.common.loading
											: dict.employees.delete_confirm}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			</div>

			{/* Детальный расчёт */}
			{expanded && (
				<div className='border-t p-4 bg-muted/30 space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<p className='text-base font-medium'>
								{dict.employees.employee_deductions}:
							</p>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.opv}
								</span>
								<span>{employee.payments.opv.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.vosms}
								</span>
								<span>{employee.payments.vosms.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.ipn}
								</span>
								<span>{employee.payments.ipn.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base font-semibold border-t pt-2'>
								<span>{dict.employees.net_salary}</span>
								<span className='text-green-600'>
									{employee.payments.netSalary.toLocaleString('ru-RU')} ₸
								</span>
							</div>
						</div>

						<div className='space-y-2'>
							<p className='text-base font-medium'>
								{dict.employees.employer_costs}:
							</p>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.opvr}
								</span>
								<span>{employee.payments.opvr.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.oosms}
								</span>
								<span>{employee.payments.oosms.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base'>
								<span className='text-muted-foreground'>
									{dict.employees.so}
								</span>
								<span>{employee.payments.so.toLocaleString('ru-RU')} ₸</span>
							</div>
							<div className='flex justify-between text-base font-semibold border-t pt-2'>
								<span>{dict.employees.gross_cost}</span>
								<span className='text-red-500'>
									{employee.payments.grossCost.toLocaleString('ru-RU')} ₸
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
