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
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>{dict.dashboard.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{dict.dashboard.monthly_payments}
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<IncomeInput
					dict={dict}
					onSuccess={() => setRefreshTrigger(t => t + 1)}
				/>
				<IncomeHistory dict={dict} refreshTrigger={refreshTrigger} />
			</div>
		</div>
	)
}
