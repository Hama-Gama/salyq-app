'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { Users, Ticket, Tag, BarChart3, Plus, CheckCircle } from 'lucide-react'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'

type Tab = 'stats' | 'users' | 'tickets' | 'promos'

export default function AdminPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)

	const [tab, setTab] = useState<Tab>('stats')
	const [data, setData] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	// Форма промокода
	const [promoCode, setPromoCode] = useState('')
	const [promoMonths, setPromoMonths] = useState(1)
	const [promoMaxUses, setPromoMaxUses] = useState(100)
	const [promoLoading, setPromoLoading] = useState(false)

	// Форма гранта
	const [grantUserId, setGrantUserId] = useState('')
	const [grantMonths, setGrantMonths] = useState(1)
	const [grantNote, setGrantNote] = useState('')
	const [grantLoading, setGrantLoading] = useState(false)

	const fetchData = useCallback(async () => {
		setLoading(true)
		const res = await fetch(`/api/admin?tab=${tab}`)
		if (res.ok) {
			const d = await res.json()
			setData(d)
		} else if (res.status === 403) {
			toast.error('Нет доступа')
		}
		setLoading(false)
	}, [tab])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	async function handleCreatePromo(e: React.FormEvent) {
		e.preventDefault()
		setPromoLoading(true)

		const res = await fetch('/api/admin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'create_promo',
				code: promoCode.toUpperCase(),
				months: promoMonths,
				maxUses: promoMaxUses,
			}),
		})

		if (res.ok) {
			toast.success('Промокод создан')
			setPromoCode('')
			fetchData()
		} else {
			toast.error('Ошибка')
		}
		setPromoLoading(false)
	}

	async function handleGrant(e: React.FormEvent) {
		e.preventDefault()
		setGrantLoading(true)

		const res = await fetch('/api/admin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'grant_access',
				userId: grantUserId,
				months: grantMonths,
				note: grantNote,
			}),
		})

		if (res.ok) {
			toast.success('Доступ выдан')
			setGrantUserId('')
			setGrantNote('')
			fetchData()
		} else {
			toast.error('Ошибка')
		}
		setGrantLoading(false)
	}

	async function handleCloseTicket(ticketId: string) {
		const res = await fetch('/api/admin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'close_ticket', ticketId }),
		})
		if (res.ok) {
			toast.success('Тикет закрыт')
			fetchData()
		}
	}

	if (dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>Загрузка...</p>
			</div>
		)
	}

	const tabs = [
		{ id: 'stats' as Tab, label: 'Статистика', icon: BarChart3 },
		{ id: 'users' as Tab, label: 'Пользователи', icon: Users },
		{ id: 'tickets' as Tab, label: 'Тикеты', icon: Ticket },
		{ id: 'promos' as Tab, label: 'Промокоды', icon: Tag },
	]

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-3xl font-bold'>Admin Panel</h1>
				<p className='text-base text-muted-foreground mt-1'>
					Управление пользователями и контентом
				</p>
			</div>

			{/* Табы */}
			<div className='flex gap-2 flex-wrap'>
				{tabs.map(t => (
					<button
						key={t.id}
						onClick={() => setTab(t.id)}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
							tab === t.id
								? 'bg-primary text-primary-foreground'
								: 'border hover:bg-muted'
						}`}
					>
						<t.icon className='w-4 h-4' />
						{t.label}
					</button>
				))}
			</div>

			{loading ? (
				<div className='text-center py-12 text-base text-muted-foreground'>
					Загрузка...
				</div>
			) : (
				<>
					{/* Статистика */}
					{tab === 'stats' && data && (
						<div className='space-y-6'>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
								<div className='bg-background rounded-xl border p-6'>
									<p className='text-base text-muted-foreground'>
										Всего пользователей
									</p>
									<p className='text-3xl font-bold mt-2'>
										{data.stats.totalUsers}
									</p>
								</div>
								<div className='bg-background rounded-xl border p-6'>
									<p className='text-base text-muted-foreground'>
										Профи подписок
									</p>
									<p className='text-3xl font-bold mt-2 text-primary'>
										{data.stats.proUsers}
									</p>
								</div>
								<div className='bg-background rounded-xl border p-6'>
									<p className='text-base text-muted-foreground'>
										Открытых тикетов
									</p>
									<p className='text-3xl font-bold mt-2 text-orange-500'>
										{data.stats.openTickets}
									</p>
								</div>
								<div className='bg-background rounded-xl border p-6'>
									<p className='text-base text-muted-foreground'>Бесплатных</p>
									<p className='text-3xl font-bold mt-2'>
										{data.stats.freeUsers}
									</p>
								</div>
							</div>

							{/* Последние пользователи */}
							<div className='bg-background rounded-xl border'>
								<div className='p-6 border-b'>
									<h2 className='text-xl font-semibold'>
										Последние регистрации
									</h2>
								</div>
								<div className='divide-y'>
									{data.recentUsers.map((user: any) => (
										<div
											key={user.id}
											className='p-4 flex items-center justify-between'
										>
											<div>
												<p className='text-base font-medium'>
													{user.name ?? 'Без имени'}
												</p>
												<p className='text-base text-muted-foreground'>
													{user.email}
												</p>
											</div>
											<div className='text-right'>
												<span
													className={`text-base px-2 py-1 rounded-full ${
														user.subscriptionType === 'PRO'
															? 'bg-primary/10 text-primary'
															: 'bg-muted text-muted-foreground'
													}`}
												>
													{user.subscriptionType}
												</span>
												<p className='text-base text-muted-foreground mt-1'>
													{new Date(user.createdAt).toLocaleDateString('ru-RU')}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Пользователи + Грант */}
					{tab === 'users' && data && (
						<div className='space-y-6'>
							{/* Форма гранта */}
							<div className='bg-background rounded-xl border p-6'>
								<h2 className='text-xl font-semibold mb-4'>
									Выдать доступ вручную
								</h2>
								<form
									onSubmit={handleGrant}
									className='grid grid-cols-1 md:grid-cols-4 gap-3'
								>
									<input
										type='text'
										value={grantUserId}
										onChange={e => setGrantUserId(e.target.value)}
										placeholder='User ID'
										className='border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
									/>
									<select
										value={grantMonths}
										onChange={e => setGrantMonths(Number(e.target.value))}
										className='border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
									>
										{[1, 3, 6, 9, 12].map(m => (
											<option key={m} value={m}>
												{m} мес.
											</option>
										))}
									</select>
									<input
										type='text'
										value={grantNote}
										onChange={e => setGrantNote(e.target.value)}
										placeholder='Заметка (опционально)'
										className='border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
									/>
									<button
										type='submit'
										disabled={grantLoading || !grantUserId}
										className='bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50'
									>
										{grantLoading ? 'Загрузка...' : 'Выдать'}
									</button>
								</form>
							</div>

							{/* Список пользователей */}
							<div className='bg-background rounded-xl border overflow-hidden'>
								<div className='p-6 border-b'>
									<h2 className='text-xl font-semibold'>
										Все пользователи ({data.users.length})
									</h2>
								</div>
								<div className='overflow-x-auto'>
									<table className='w-full'>
										<thead>
											<tr className='border-b bg-muted/30'>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													Имя
												</th>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													Email
												</th>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													Тариф
												</th>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													Telegram
												</th>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													Дата
												</th>
												<th className='text-left p-4 text-base font-medium text-muted-foreground'>
													ID
												</th>
											</tr>
										</thead>
										<tbody>
											{data.users.map((user: any) => (
												<tr
													key={user.id}
													className='border-b last:border-0 hover:bg-muted/20'
												>
													<td className='p-4 text-base font-medium'>
														{user.name ?? '—'}
													</td>
													<td className='p-4 text-base text-muted-foreground'>
														{user.email}
													</td>
													<td className='p-4'>
														<span
															className={`text-base px-2 py-1 rounded-full ${
																user.subscriptionType === 'PRO'
																	? 'bg-primary/10 text-primary'
																	: 'bg-muted text-muted-foreground'
															}`}
														>
															{user.subscriptionType}
														</span>
													</td>
													<td className='p-4 text-base text-muted-foreground'>
														{user.tgChatId ? '✅' : '—'}
													</td>
													<td className='p-4 text-base text-muted-foreground'>
														{new Date(user.createdAt).toLocaleDateString(
															'ru-RU',
														)}
													</td>
													<td className='p-4'>
														<code className='text-base bg-muted px-2 py-1 rounded'>
															{user.id.slice(0, 8)}...
														</code>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* Тикеты */}
					{tab === 'tickets' && data && (
						<div className='space-y-4'>
							{data.tickets.length === 0 ? (
								<div className='bg-background rounded-xl border p-12 text-center'>
									<p className='text-base text-muted-foreground'>Тикетов нет</p>
								</div>
							) : (
								data.tickets.map((ticket: any) => (
									<div
										key={ticket.id}
										className='bg-background rounded-xl border p-6'
									>
										<div className='flex items-start justify-between gap-4'>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-2'>
													<span
														className={`text-base px-2 py-0.5 rounded-full font-medium ${
															ticket.status === 'OPEN'
																? 'bg-orange-100 text-orange-700'
																: ticket.status === 'IN_PROGRESS'
																	? 'bg-blue-100 text-blue-700'
																	: 'bg-green-100 text-green-700'
														}`}
													>
														{ticket.status}
													</span>
													<span className='text-base text-muted-foreground'>
														{ticket.type}
													</span>
												</div>
												<p className='text-base font-semibold'>
													{ticket.subject}
												</p>
												<p className='text-base text-muted-foreground mt-1'>
													{ticket.message}
												</p>
												<p className='text-base text-muted-foreground mt-2'>
													{ticket.user?.name} ({ticket.user?.email}) •{' '}
													{new Date(ticket.createdAt).toLocaleDateString(
														'ru-RU',
													)}
												</p>
											</div>
											{ticket.status !== 'CLOSED' && (
												<button
													onClick={() => handleCloseTicket(ticket.id)}
													className='flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-green-600 transition-colors shrink-0'
												>
													<CheckCircle className='w-4 h-4' />
													Закрыть
												</button>
											)}
										</div>
									</div>
								))
							)}
						</div>
					)}

					{/* Промокоды */}
					{tab === 'promos' && data && (
						<div className='space-y-6'>
							{/* Форма создания промокода */}
							<div className='bg-background rounded-xl border p-6'>
								<h2 className='text-xl font-semibold mb-4'>
									<Plus className='w-5 h-5 inline mr-2' />
									Создать промокод
								</h2>
								<form
									onSubmit={handleCreatePromo}
									className='grid grid-cols-1 md:grid-cols-4 gap-3'
								>
									<input
										type='text'
										value={promoCode}
										onChange={e => setPromoCode(e.target.value.toUpperCase())}
										placeholder='PROMO2026'
										className='border rounded-lg px-4 py-3 text-base uppercase focus:outline-none focus:ring-2 focus:ring-primary'
									/>
									<select
										value={promoMonths}
										onChange={e => setPromoMonths(Number(e.target.value))}
										className='border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
									>
										{[1, 3, 6, 9, 12].map(m => (
											<option key={m} value={m}>
												{m} мес. PRO
											</option>
										))}
									</select>
									<input
										type='number'
										value={promoMaxUses}
										onChange={e => setPromoMaxUses(Number(e.target.value))}
										placeholder='Макс. использований'
										min={1}
										className='border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
									/>
									<button
										type='submit'
										disabled={promoLoading || !promoCode.trim()}
										className='bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50'
									>
										{promoLoading ? 'Загрузка...' : 'Создать'}
									</button>
								</form>
							</div>

							{/* Список промокодов */}
							<div className='bg-background rounded-xl border overflow-hidden'>
								<div className='p-6 border-b'>
									<h2 className='text-xl font-semibold'>
										Промокоды ({data.promos.length})
									</h2>
								</div>
								{data.promos.length === 0 ? (
									<div className='p-12 text-center text-base text-muted-foreground'>
										Промокодов нет
									</div>
								) : (
									<div className='overflow-x-auto'>
										<table className='w-full'>
											<thead>
												<tr className='border-b bg-muted/30'>
													<th className='text-left p-4 text-base font-medium text-muted-foreground'>
														Код
													</th>
													<th className='text-left p-4 text-base font-medium text-muted-foreground'>
														Мес.
													</th>
													<th className='text-left p-4 text-base font-medium text-muted-foreground'>
														Использовано
													</th>
													<th className='text-left p-4 text-base font-medium text-muted-foreground'>
														Статус
													</th>
													<th className='text-left p-4 text-base font-medium text-muted-foreground'>
														Истекает
													</th>
												</tr>
											</thead>
											<tbody>
												{data.promos.map((promo: any) => (
													<tr
														key={promo.id}
														className='border-b last:border-0 hover:bg-muted/20'
													>
														<td className='p-4'>
															<code className='text-base font-bold bg-muted px-2 py-1 rounded'>
																{promo.code}
															</code>
														</td>
														<td className='p-4 text-base'>
															{promo.months} мес.
														</td>
														<td className='p-4 text-base'>
															{promo.usedCount} / {promo.maxUses}
														</td>
														<td className='p-4'>
															<span
																className={`text-base px-2 py-1 rounded-full ${
																	promo.isActive
																		? 'bg-green-100 text-green-700'
																		: 'bg-red-100 text-red-700'
																}`}
															>
																{promo.isActive ? 'Активен' : 'Неактивен'}
															</span>
														</td>
														<td className='p-4 text-base text-muted-foreground'>
															{promo.expiresAt
																? new Date(promo.expiresAt).toLocaleDateString(
																		'ru-RU',
																	)
																: '—'}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
