'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { CheckCircle, Zap } from 'lucide-react'
import type { Locale } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import {
	PRICING_CONFIG,
	formatPrice,
	getPlanFeatures,
	type PlanId,
} from '@/constants/pricing-config'

export default function PricingPage() {
	const params = useParams()
	const lang = (params.lang as Locale) ?? 'ru'
	const { dict, loading } = useDictionary(lang)

	const [promoCode, setPromoCode] = useState('')
	const [promoLoading, setPromoLoading] = useState(false)
	const [billingYearly, setBillingYearly] = useState(false)

	if (loading || !dict) {
		return (
			<div className='flex items-center justify-center min-h-64'>
				<p className='text-base text-muted-foreground'>
					{dict?.common.loading ?? 'Загрузка...'}
				</p>
			</div>
		)
	}

	async function handlePromo(e: React.FormEvent) {
		e.preventDefault()
		if (!promoCode.trim()) return

		setPromoLoading(true)
		const res = await fetch('/api/promo', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code: promoCode.trim() }),
		})

		const data = await res.json()

		if (res.ok) {
			toast.success(dict!.pricing.promo_success)
			setPromoCode('')
		} else {
			toast.error(data.error ?? dict!.errors.server_error)
		}

		setPromoLoading(false)
	}

	const plans = [
		{
			config: PRICING_CONFIG.free,
			planId: 'FREE' as PlanId,
			highlight: false,
		},
		{
			config: PRICING_CONFIG.pro,
			planId: 'PRO' as PlanId,
			highlight: true,
		},
		{
			config: PRICING_CONFIG.business,
			planId: 'BUSINESS' as PlanId,
			highlight: false,
		},
	]

	return (
		<div className='mx-auto w-full max-w-7xl p-3 md:p-6 space-y-8'>
			{/* Заголовок */}
			<div className='text-center space-y-3'>
				<h1 className='text-3xl font-bold'>{dict.pricing.title}</h1>
				<p className='text-base text-muted-foreground'>
					{dict.pricing.subtitle}
				</p>

				{/* Переключатель месяц/год */}
				<div className='flex items-center justify-center gap-3 mt-4'>
					<span
						className={`text-base ${!billingYearly ? 'font-semibold' : 'text-muted-foreground'}`}
					>
						{dict.common.per_month}
					</span>
					<button
						onClick={() => setBillingYearly(!billingYearly)}
						className={`relative w-12 h-6 rounded-full transition-colors ${
							billingYearly ? 'bg-primary' : 'bg-muted'
						}`}
					>
						<span
							className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
								billingYearly ? 'translate-x-7' : 'translate-x-1'
							}`}
						/>
					</button>
					<span
						className={`text-base ${billingYearly ? 'font-semibold' : 'text-muted-foreground'}`}
					>
						{dict.common.per_year}
					</span>
					{billingYearly && (
						<span className='bg-green-100 text-green-700 text-base px-2 py-0.5 rounded-full font-medium'>
							-{PRICING_CONFIG.business.savings_percent}%
						</span>
					)}
				</div>
			</div>

			{/* Карточки тарифов */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{plans.map(({ config, planId, highlight }) => {
					const name = lang === 'ru' ? config.name_ru : config.name_kz
					const features = getPlanFeatures(planId, lang)

					const price =
						billingYearly && 'price_yearly' in config && config.price_yearly
							? config.price_yearly
							: 'price_monthly' in config
								? config.price_monthly
								: null

					const period = billingYearly
						? dict.common.per_year
						: dict.common.per_month

					return (
						<div
							key={planId}
							className={`rounded-xl border p-6 relative flex flex-col ${
								highlight ? 'border-primary bg-primary/5' : 'bg-background'
							}`}
						>
							{highlight && (
								<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
									<span className='bg-primary text-primary-foreground px-3 py-1 rounded-full text-base font-medium'>
										{dict.pricing.popular}
									</span>
								</div>
							)}

							<div className='mb-6'>
								<h2 className='text-xl font-bold mb-2'>{name}</h2>
								<div className='flex items-baseline gap-1'>
									{price === 0 ? (
										<span className='text-3xl font-bold'>
											{formatPrice(0, lang)}
										</span>
									) : price ? (
										<>
											<span className='text-3xl font-bold'>
												{price.toLocaleString('ru-RU')} ₸
											</span>
											<span className='text-base text-muted-foreground'>
												{period}
											</span>
										</>
									) : (
										<span className='text-3xl font-bold'>
											{lang === 'ru' ? 'Только годовой' : 'Тек жылдық'}
										</span>
									)}
								</div>

								{'trial_days' in config && config.trial_days > 0 && (
									<p className='text-base text-green-600 font-medium mt-2'>
										{lang === 'ru'
											? `${config.trial_days} дней бесплатно`
											: `${config.trial_days} күн тегін`}
									</p>
								)}
							</div>

							<ul className='space-y-3 flex-1 mb-6'>
								{features.map((feat, i) => (
									<li key={i} className='flex items-start gap-2 text-base'>
										<CheckCircle className='w-4 h-4 text-green-500 shrink-0 mt-0.5' />
										{feat}
									</li>
								))}
							</ul>

							<button
								className={`w-full py-3 rounded-lg text-base font-semibold transition-colors ${
									highlight
										? 'bg-primary text-primary-foreground hover:bg-primary/90'
										: planId === 'FREE'
											? 'border hover:bg-muted'
											: 'border border-primary text-primary hover:bg-primary/10'
								}`}
							>
								{planId === 'FREE'
									? lang === 'ru'
										? 'Текущий план'
										: 'Ағымдағы жоспар'
									: lang === 'ru'
										? 'Выбрать'
										: 'Таңдау'}
							</button>
						</div>
					)
				})}
			</div>

			{/* Промокод */}
			<div className='bg-background rounded-xl border p-6 max-w-md mx-auto'>
				<div className='flex items-center gap-2 mb-4'>
					<Zap className='w-5 h-5 text-primary' />
					<h2 className='text-xl font-semibold'>
						{lang === 'ru' ? 'Есть промокод?' : 'Промокод бар ма?'}
					</h2>
				</div>
				<form onSubmit={handlePromo} className='flex gap-3'>
					<input
						type='text'
						value={promoCode}
						onChange={e => setPromoCode(e.target.value.toUpperCase())}
						placeholder={dict.pricing.promo_placeholder}
						className='flex-1 border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary uppercase'
					/>
					<button
						type='submit'
						disabled={promoLoading || !promoCode.trim()}
						className='bg-primary text-primary-foreground px-6 py-3 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50'
					>
						{promoLoading ? dict.common.loading : dict.pricing.promo_apply}
					</button>
				</form>
			</div>

			{/* FAQ по тарифам */}
			<div className='bg-muted/30 rounded-xl p-6 space-y-4'>
				<h2 className='text-xl font-semibold'>
					{lang === 'ru'
						? 'Частые вопросы о тарифах'
						: 'Тарифтер туралы жиі сұрақтар'}
				</h2>
				<div className='space-y-3'>
					{[
						{
							q:
								lang === 'ru'
									? 'Можно ли отменить подписку?'
									: 'Жазылымды болдырмауға болады ма?',
							a:
								lang === 'ru'
									? 'Да, в любой момент. Доступ сохраняется до конца оплаченного периода.'
									: 'Иә, кез келген уақытта. Төленген кезеңнің соңына дейін қол жетімділік сақталады.',
						},
						{
							q:
								lang === 'ru'
									? 'Как работает пробный период?'
									: 'Сынақ кезеңі қалай жұмыс істейді?',
							a:
								lang === 'ru'
									? `${PRICING_CONFIG.pro.trial_days} дней бесплатного доступа к тарифу Профи. Карта не нужна.`
									: `Про тарифіне ${PRICING_CONFIG.pro.trial_days} күн тегін қол жетімділік. Карта қажет емес.`,
						},
						{
							q:
								lang === 'ru'
									? 'Данные сохранятся при смене тарифа?'
									: 'Тариф ауыстырғанда деректер сақтала ма?',
							a:
								lang === 'ru'
									? 'Да, все данные сохраняются всегда независимо от тарифа.'
									: 'Иә, барлық деректер тарифке қарамастан әрқашан сақталады.',
						},
					].map((item, i) => (
						<details
							key={i}
							className='bg-background rounded-lg border overflow-hidden group'
						>
							<summary className='flex items-center justify-between p-4 cursor-pointer list-none hover:bg-muted/30'>
								<p className='text-base font-medium'>{item.q}</p>
							</summary>
							<div className='px-4 pb-4 pt-2 border-t'>
								<p className='text-base text-muted-foreground'>{item.a}</p>
							</div>
						</details>
					))}
				</div>
			</div>
		</div>
	)
}
