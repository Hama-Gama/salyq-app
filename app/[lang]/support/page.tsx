'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'

type TicketType = 'BUG' | 'FEATURE' | 'TAX_HELP'

export default function SupportPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading: dictLoading } = useDictionary(lang)

	const [type, setType] = useState<TicketType>('BUG')
	const [subject, setSubject] = useState('')
	const [message, setMessage] = useState('')
	const [sending, setSending] = useState(false)
	const [openFaq, setOpenFaq] = useState<number | null>(null)

	// Валидация согласно схеме Zod на бэкенде
	const isFormInvalid = subject.trim().length < 3 || message.trim().length < 10

	if (dictLoading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>
					{dict?.common.loading ?? 'Загрузка...'}
				</p>
			</div>
		)
	}

	const ticketTypes: { value: TicketType; label: string }[] = [
		{ value: 'BUG', label: dict.support.type_bug },
		{ value: 'FEATURE', label: dict.support.type_feature },
		{ value: 'TAX_HELP', label: dict.support.type_tax },
	]

	const faqItems = [
		{ q: dict.faq.q1, a: dict.faq.a1 },
		{ q: dict.faq.q2, a: dict.faq.a2 },
		{ q: dict.faq.q3, a: dict.faq.a3 },
		{ q: dict.faq.q4, a: dict.faq.a4 },
		{ q: dict.faq.q5, a: dict.faq.a5 },
	]

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (isFormInvalid) {
			toast.error(dict.errors.required)
			return
		}

		if (type === 'TAX_HELP') {
			toast.info(dict.support.tax_redirect)
			return
		}

		setSending(true)

		try {
			const res = await fetch('/api/support', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, subject, message }),
			})

			if (res.ok) {
				toast.success(dict.support.sent)
				setSubject('')
				setMessage('')
				setType('BUG')
			} else {
				toast.error(dict.errors.server_error)
			}
		} catch (err) {
			toast.error(dict.errors.server_error)
		} finally {
			setSending(false)
		}
	}

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-6'>
			{/* Заголовок */}
			<div>
				<h1 className='text-3xl font-bold'>{dict.support.title}</h1>
				<p className='text-base text-muted-foreground mt-1'>
					{lang === 'ru'
						? 'Напишите нам — ответим в течение 24 часов'
						: 'Бізге жазыңыз — 24 сағат ішінде жауап береміз'}
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Форма обращения */}
				<div className='bg-background rounded-xl border p-6'>
					<h2 className='text-xl font-semibold mb-6'>
						{lang === 'ru' ? 'Новое обращение' : 'Жаңа өтініш'}
					</h2>

					<form onSubmit={handleSubmit} className='space-y-5'>
						{/* Тип обращения */}
						<div>
							<label className='block text-base font-medium mb-2'>
								{lang === 'ru' ? 'Тип обращения' : 'Өтініш түрі'}
							</label>
							<div className='grid grid-cols-1 gap-2'>
								{ticketTypes.map(t => (
									<button
										key={t.value}
										type='button'
										onClick={() => setType(t.value)}
										className={`px-4 py-3 rounded-lg text-base font-medium text-left transition-colors border ${
											type === t.value
												? 'bg-primary text-primary-foreground border-primary'
												: 'hover:bg-muted border-border'
										}`}
									>
										{t.label}
									</button>
								))}
							</div>
						</div>

						{/* Налоговый вопрос — редирект */}
						{type === 'TAX_HELP' && (
							<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
								<p className='text-base text-yellow-800'>
									{dict.support.tax_redirect}
								</p>
							</div>
						)}

						{/* Тема */}
						<div>
							<label className='block text-base font-medium mb-2'>
								{dict.support.subject}
							</label>
							<input
								type='text'
								value={subject}
								onChange={e => setSubject(e.target.value)}
								placeholder={
									lang === 'ru'
										? 'Краткое описание проблемы'
										: 'Мәселенің қысқаша сипаттамасы'
								}
								className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary'
							/>
							{subject.length > 0 && subject.length < 3 && (
								<p className='text-xs text-red-500 mt-1'>
									{lang === 'ru' ? 'Минимум 3 символа' : 'Кемінде 3 таңба'}
								</p>
							)}
						</div>

						{/* Сообщение */}
						<div>
							<label className='block text-base font-medium mb-2'>
								{dict.support.message}
							</label>
							<textarea
								value={message}
								onChange={e => setMessage(e.target.value)}
								placeholder={
									lang === 'ru'
										? 'Подробно опишите вашу проблему или предложение...'
										: 'Мәселеңізді немесе ұсынысыңызды толық сипаттаңыз...'
								}
								rows={5}
								className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none'
							/>
							{message.length > 0 && message.length < 10 && (
								<p className='text-xs text-red-500 mt-1'>
									{lang === 'ru' ? 'Минимум 10 символов' : 'Кемінде 10 таңба'}
								</p>
							)}
						</div>

						<button
							type='submit'
							disabled={sending || type === 'TAX_HELP' || isFormInvalid}
							className='w-full bg-primary text-primary-foreground py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{sending ? dict.common.loading : dict.support.send}
						</button>
					</form>
				</div>

				{/* FAQ */}
				<div className='space-y-4'>
					<h2 className='text-xl font-semibold'>{dict.faq.title}</h2>
					<div className='space-y-3'>
						{faqItems.map((item, i) => (
							<div
								key={i}
								className='bg-background rounded-xl border overflow-hidden'
							>
								<button
									onClick={() => setOpenFaq(openFaq === i ? null : i)}
									className='w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors'
								>
									<p className='text-base font-medium pr-4'>{item.q}</p>
									{openFaq === i ? (
										<ChevronUp className='w-5 h-5 shrink-0 text-muted-foreground' />
									) : (
										<ChevronDown className='w-5 h-5 shrink-0 text-muted-foreground' />
									)}
								</button>
								{openFaq === i && (
									<div className='px-4 pb-4 border-t pt-3'>
										<p className='text-base text-muted-foreground'>{item.a}</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
