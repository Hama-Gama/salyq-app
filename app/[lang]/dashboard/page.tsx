'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import type { Locale } from '@/types'
import IncomeInput from '@/components/dashboard/IncomeInput'
import IncomeHistory from '@/components/dashboard/IncomeHistory'
import { useDictionary } from '@/hooks/useDictionary'

export default function DashboardPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading } = useDictionary(lang)
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	if (loading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>Загрузка...</p>
			</div>
		)
	}

	return (
		<div className='space-y-6 max-w-4xl'>
			<div>
				<h1 className='text-3xl font-bold'>{dict.dashboard.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{dict.dashboard.monthly_payments}
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Форма ввода */}
				<IncomeInput
					dict={dict}
					onSuccess={() => setRefreshTrigger(t => t + 1)}
				/>

				{/* История и лимит */}
				<IncomeHistory dict={dict} refreshTrigger={refreshTrigger} />
			</div>
		</div>
	)
}
