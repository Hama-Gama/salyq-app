'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { Users, Tag, BarChart3, Loader2, ShieldAlert, Copy } from 'lucide-react'

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

	if (status === 'loading')
		return (
			<div className='p-20 text-center font-mono animate-pulse'>
				AUTHENTICATING...
			</div>
		)

	if (isForbidden) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh] text-center p-6'>
				<ShieldAlert className='w-16 h-16 text-red-500 mb-4' />
				<h1 className='text-2xl font-bold text-gray-900 uppercase italic'>
					Access Denied
				</h1>
				<p className='text-gray-500 max-w-sm mt-2 font-mono text-xs'>
					Your ID is not in the ADMIN_EMAIL whitelist.
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
			<header className='border-b pb-6 flex justify-between items-end'>
				<div>
					<h1 className='text-4xl font-black italic tracking-tighter text-black uppercase'>
						Admin_Panel
					</h1>
					<p className='text-[10px] font-mono text-neutral-400 uppercase tracking-widest'>
						Salyq App Management
					</p>
				</div>
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
						<t.icon size={14} /> {t.label}
					</button>
				))}
			</nav>

			{loading ? (
				<div className='flex justify-center py-20'>
					<Loader2 className='animate-spin text-neutral-200' size={32} />
				</div>
			) : (
				<main className='space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500'>
					{tab === 'stats' && data?.stats && (
						<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
							<StatBox label='Total Users' value={data.stats.totalUsers} />
							<StatBox
								label='Pro Accounts'
								value={data.stats.proUsers}
								highlight
							/>
							<StatBox label='Open Tickets' value={data.stats.openTickets} />
							<StatBox
								label='Total Income'
								value={`${data.stats.totalIncomes.toLocaleString()} ₸`}
							/>
						</div>
					)}

					{tab === 'users' && (
						<div className='space-y-6'>
							<div className='p-6 bg-neutral-50 border rounded-sm'>
								<h3 className='font-bold mb-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500'>
									Manual Grant Access
								</h3>
								<div className='flex flex-wrap gap-3'>
									<input
										placeholder='Paste User ID here...'
										className='flex-1 border p-2 text-sm rounded-sm font-mono'
										value={grantForm.userId}
										onChange={e =>
											setGrantForm({ ...grantForm, userId: e.target.value })
										}
									/>
									<select
										className='border p-2 text-sm rounded-sm font-bold'
										value={grantForm.months}
										onChange={e =>
											setGrantForm({
												...grantForm,
												months: Number(e.target.value),
											})
										}
									>
										<option value='1'>+ 1 Month</option>
										<option value='3'>+ 3 Months</option>
										<option value='12'>+ 1 Year</option>
									</select>
									<button
										onClick={() => handleAction('grant_access', grantForm)}
										className='bg-black text-white px-8 py-2 text-xs font-bold hover:bg-neutral-800 transition-colors'
									>
										GRANT PRO
									</button>
								</div>
							</div>
							<UserList users={data?.users || []} />
						</div>
					)}

					{tab === 'promos' && (
						<div className='p-6 bg-neutral-50 border rounded-sm'>
							<h3 className='font-bold mb-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500'>
								Generate New Promo Code
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
								<input
									placeholder='CODE (e.g. HAMA2026)'
									className='border p-2 text-sm rounded-sm uppercase font-mono font-bold'
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
									value={promoForm.months}
									onChange={e =>
										setPromoForm({
											...promoForm,
											months: Number(e.target.value),
										})
									}
								/>
								<input
									type='number'
									placeholder='Usage Limit'
									className='border p-2 text-sm rounded-sm'
									value={promoForm.maxUses}
									onChange={e =>
										setPromoForm({
											...promoForm,
											maxUses: Number(e.target.value),
										})
									}
								/>
								<button
									onClick={() => handleAction('create_promo', promoForm)}
									className='bg-green-600 text-white font-bold text-xs hover:bg-green-700'
								>
									GENERATE
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
			className={`p-6 border rounded-sm transition-transform hover:scale-[1.02] ${highlight ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-white'}`}
		>
			<p className='text-[10px] font-mono uppercase opacity-50 tracking-widest'>
				{label}
			</p>
			<p className='text-3xl font-black mt-1'>{value}</p>
		</div>
	)
}

function UserList({ users }: { users: any[] }) {
	const copyToClipboard = (id: string) => {
		navigator.clipboard.writeText(id)
		toast.info('ID copied to clipboard')
	}

	return (
		<div className='border rounded-sm overflow-hidden'>
			<table className='w-full text-left text-xs'>
				<thead className='bg-neutral-100 border-b font-bold uppercase italic text-neutral-600'>
					<tr>
						<th className='p-4'>User Details & ID</th>
						<th className='p-4'>Subscription</th>
						<th className='p-4'>Expiry Date</th>
					</tr>
				</thead>
				<tbody>
					{users.map(u => (
						<tr
							key={u.id}
							className='border-b hover:bg-neutral-50 transition-colors'
						>
							<td className='p-4'>
								<div className='font-bold text-sm text-black'>{u.email}</div>
								<div className='flex items-center gap-2 mt-1.5'>
									<code className='text-[9px] bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-600 font-mono'>
										{u.id}
									</code>
									<button
										onClick={() => copyToClipboard(u.id)}
										className='text-neutral-400 hover:text-black transition-colors'
										title='Copy ID'
									>
										<Copy size={12} />
									</button>
								</div>
							</td>
							<td className='p-4'>
								<span
									className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${
										u.subscriptionType === 'PRO'
											? 'bg-green-100 text-green-700'
											: 'bg-neutral-100 text-neutral-400'
									}`}
								>
									{u.subscriptionType}
								</span>
							</td>
							<td className='p-4 text-neutral-400 font-mono'>
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
