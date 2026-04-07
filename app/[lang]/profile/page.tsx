'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'

interface Profile {
	id: string
	name: string | null
	email: string | null
	image: string | null
	iin: string | null
	language: string
	tgChatId: string | null
	subscriptionType: string
	subscriptionEnd: string | null
}

export default function ProfilePage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)

	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	// Поля формы
	const [name, setName] = useState('')
	const [iin, setIIN] = useState('')
	const [tgChatId, setTgChatId] = useState('')

	useEffect(() => {
		fetchProfile()
	}, [])

	async function fetchProfile() {
		const res = await fetch('/api/profile')
		if (res.ok) {
			const data = await res.json()
			setProfile(data)
			setName(data.name ?? '')
			setTgChatId(data.tgChatId ?? '')
		}
		setLoading(false)
	}

	async function handleSave(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)

		const body: Record<string, string> = {}
		if (name) body.name = name
		if (iin && iin.length === 12) body.iin = iin
		if (tgChatId) body.tgChatId = tgChatId

		const res = await fetch('/api/profile', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})

		if (res.ok) {
			toast.success(dict?.profile.saved ?? 'Сохранено')
			setIIN('') // очищаем ИИН после сохранения
			fetchProfile()
		} else {
			toast.error(dict?.errors.server_error ?? 'Ошибка')
		}

		setSaving(false)
	}

	if (loading || dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>
					{dict?.common.loading ?? 'Загрузка...'}
				</p>
			</div>
		)
	}

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>{dict.profile.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{dict.profile.subtitle}
				</p>
			</div>

			{/* Информация об аккаунте */}
			<div className='bg-background rounded-xl border p-6 space-y-4'>
				<h2 className='text-xl font-semibold'>{dict.profile.account}</h2>

				<div className='flex items-center gap-4'>
					{profile?.image && (
						<img
							src={profile.image}
							alt={profile.name ?? ''}
							className='w-16 h-16 rounded-full'
						/>
					)}
					<div>
						<p className='text-base font-medium'>{profile?.name}</p>
						<p className='text-base text-muted-foreground'>{profile?.email}</p>
						<p className='text-base text-muted-foreground'>
							{dict.profile.subscription}: {profile?.subscriptionType}
						</p>
					</div>
				</div>
			</div>

			{/* Форма редактирования */}
			<div className='bg-background rounded-xl border p-6'>
				<h2 className='text-xl font-semibold mb-6'>{dict.profile.edit}</h2>

				<form onSubmit={handleSave} className='space-y-5'>
					{/* Имя */}
					<div>
						<label className='block text-base font-medium mb-2'>
							{dict.profile.name}
						</label>
						<input
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={dict.profile.name_placeholder}
							className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
						/>
					</div>

					{/* ИИН */}
					<div>
						<label className='block text-base font-medium mb-2'>
							{dict.profile.iin}
						</label>
						{profile?.iin && (
							<p className='text-base text-muted-foreground mb-2'>
								{dict.profile.iin_current}: {profile.iin}
							</p>
						)}
						<input
							type='text'
							inputMode='numeric'
							value={iin}
							onChange={e =>
								setIIN(e.target.value.replace(/\D/g, '').slice(0, 12))
							}
							placeholder={dict.profile.iin_placeholder}
							maxLength={12}
							className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<p className='text-base text-muted-foreground mt-1'>
							{dict.profile.iin_hint}
						</p>
					</div>

					{/* Telegram */}
					<div>
						<label className='block text-base font-medium mb-2'>
							{dict.profile.telegram}
						</label>
						<input
							type='text'
							value={tgChatId}
							onChange={e => setTgChatId(e.target.value)}
							placeholder={dict.profile.telegram_placeholder}
							className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
						/>
						<p className='text-base text-muted-foreground mt-1'>
							{lang === 'ru' ? (
								<>
<<<<<<< HEAD
									Узнай свой ID написав <b>@salyqappbot</b> команду /myid
								</>
							) : (
								<>
									ID-ңды білу үшін <b>@salyqappbot</b> ботына /myid жаз
=======
									Узнай свой ID написав <b>@salyqapp_bot</b> команду /myid
								</>
							) : (
								<>
									ID-ңды білу үшін <b>@salyqapp_bot</b> ботына /myid жаз
>>>>>>> 6d1976739786a632e76eb4f789eff85b82768dfe
								</>
							)}
						</p>
					</div>

					<button
						type='submit'
						disabled={saving}
						className='w-full bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50'
					>
						{saving ? dict.common.loading : dict.profile.save}
					</button>
				</form>
			</div>
		</div>
	)
}
