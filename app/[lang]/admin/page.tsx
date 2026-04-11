'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import {
	Users,
	Tag,
	BarChart3,
	Loader2,
	ShieldAlert,
} from 'lucide-react'

export default function AdminPage() {
	const { status } = useSession()
	const [tab, setTab] = useState<'stats' | 'users' | 'promos'>('stats')
	const [data, setData] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [isForbidden, setIsForbidden] = useState(false)

	const [promoForm, setPromoForm] = useState({
		code: '',
		months: 1,
		maxUses: 100,
	})
	const [grantForm, setGrantForm] = useState({ userId: '', months: 1 })

	const fetchData = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch(`/api/admin?tab=${tab}`)

			if (res.status === 403) {
				setIsForbidden(true)
				return
			}

			const d = await res.json()
			if (res.ok) setData(d)
			else toast.error(d.error)
		} catch {
			toast.error('Network error')
		} finally {
			setLoading(false)
		}
	}, [tab])

	useEffect(() => {
		if (status === 'authenticated') fetchData()
	}, [fetchData, status])

	// Экран загрузки
	if (status === 'loading')
		return <div className='p-20 text-center font-mono'>AUTHENTICATING...</div>

	// Экран "Доступ запрещен"
	if (isForbidden) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh] text-center p-6'>
				<ShieldAlert className='w-16 h-16 text-red-500 mb-4' />
				<h1 className='text-2xl font-bold text-gray-900 uppercase'>
					Access Denied
				</h1>
				<p className='text-gray-500 max-w-sm mt-2 font-mono text-sm'>
					You do not have administrative privileges for Salyq App.
				</p>
			</div>
		)
	}

	async function handleAction(action: string, payload: any) {
		try {
			const res = await fetch('/api/admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action, ...payload }),
			})
			const result = await res.json()
			if (res.ok) {
				toast.success('Success!')
				fetchData()
			} else {
				toast.error(result.error)
			}
		} catch {
			toast.error('Action failed')
		}
	}

	return (
		<div className='max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-white min-h-screen'>
			<header className='border-b pb-6'>
				<h1 className='text-4xl font-black italic tracking-tighter text-black uppercase'>
					Admin_Panel
				</h1>
			</header>

			<nav className='flex gap-4 border-b'>
				{[
					{ id: 'stats', icon: BarChart3, label: 'STATS' },
					{ id: 'users', icon: Users, label: 'USERS' },
					{ id: 'promos', icon: Tag, label: 'PROMOS' },
				].map(t => (
					<button
						key={t.id}
						onClick={() => setTab(t.id as any)}
						className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all ${
							tab === t.id
								? 'border-b-2 border-black text-black'
								: 'text-gray-400 hover:text-black'
						}`}
					>
						<t.icon size={16} /> {t.label}
					</button>
				))}
			</nav>

			{loading ? (
				<div className='flex justify-center py-20'>
					<Loader2 className='animate-spin text-gray-200' />
				</div>
			) : (
				<main className='space-y-8 animate-in fade-in duration-500'>
					{tab === 'stats' && data?.stats && (
						<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
							<StatBox label='Total' value={data.stats.totalUsers} />
							<StatBox label='Pro' value={data.stats.proUsers} highlight />
							<StatBox label='Tickets' value={data.stats.openTickets} />
							<StatBox label='Income' value={`${data.stats.totalIncomes} ₸`} />
						</div>
					)}

					{tab === 'users' && (
						<div className='space-y-6'>
							<div className='p-6 bg-neutral-50 border rounded-sm'>
								<h3 className='font-bold mb-4 text-xs uppercase tracking-widest'>
									Manual Grant Access
								</h3>
								<div className='flex flex-wrap gap-3'>
									<input
										placeholder='User ID'
										className='flex-1 border p-2 text-sm rounded-sm'
										value={grantForm.userId}
										onChange={e =>
											setGrantForm({ ...grantForm, userId: e.target.value })
										}
									/>
									<select
										className='border p-2 text-sm rounded-sm'
										onChange={e =>
											setGrantForm({
												...grantForm,
												months: Number(e.target.value),
											})
										}
									>
										<option value='1'>1 Month</option>
										<option value='3'>3 Months</option>
										<option value='12'>1 Year</option>
									</select>
									<button
										onClick={() => handleAction('grant_access', grantForm)}
										className='bg-black text-white px-8 py-2 text-xs font-bold hover:bg-neutral-800'
									>
										GRANT
									</button>
								</div>
							</div>
							<UserList users={data?.users || []} />
						</div>
					)}

					{tab === 'promos' && (
						<div className='p-6 bg-neutral-50 border rounded-sm'>
							<h3 className='font-bold mb-4 text-xs uppercase tracking-widest'>
								Generate Promo
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
								<input
									placeholder='CODE'
									className='border p-2 text-sm rounded-sm uppercase font-mono'
									value={promoForm.code}
									onChange={e =>
										setPromoForm({
											...promoForm,
											code: e.target.value.toUpperCase(),
										})
									}
								/>
								<input
									type='number'
									placeholder='Months'
									className='border p-2 text-sm rounded-sm'
									onChange={e =>
										setPromoForm({
											...promoForm,
											months: Number(e.target.value),
										})
									}
								/>
								<input
									type='number'
									placeholder='Limit'
									className='border p-2 text-sm rounded-sm'
									onChange={e =>
										setPromoForm({
											...promoForm,
											maxUses: Number(e.target.value),
										})
									}
								/>
								<button
									onClick={() => handleAction('create_promo', promoForm)}
									className='bg-green-600 text-white font-bold text-xs'
								>
									CREATE
								</button>
							</div>
						</div>
					)}
				</main>
			)}
		</div>
	)
}

function StatBox({ label, value, highlight }: any) {
	return (
		<div
			className={`p-6 border rounded-sm ${highlight ? 'bg-black text-white' : 'bg-white'}`}
		>
			<p className='text-[10px] font-mono uppercase opacity-50'>{label}</p>
			<p className='text-2xl font-black mt-1'>{value}</p>
		</div>
	)
}

function UserList({ users }: { users: any[] }) {
	return (
		<div className='border rounded-sm overflow-hidden'>
			<table className='w-full text-left text-xs'>
				<thead className='bg-neutral-100 border-b font-bold uppercase italic'>
					<tr>
						<th className='p-4'>User</th>
						<th className='p-4'>Status</th>
						<th className='p-4'>End Date</th>
					</tr>
				</thead>
				<tbody>
					{users.map(u => (
						<tr key={u.id} className='border-b hover:bg-neutral-50'>
							<td className='p-4 font-medium'>{u.email}</td>
							<td className='p-4'>
								<span
									className={
										u.subscriptionType === 'PRO'
											? 'text-green-600 font-bold'
											: 'text-gray-300'
									}
								>
									{u.subscriptionType}
								</span>
							</td>
							<td className='p-4 text-gray-400 font-mono'>
								{u.subscriptionEnd
									? new Date(u.subscriptionEnd).toLocaleDateString()
									: '—'}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
