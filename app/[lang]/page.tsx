import Link from 'next/link'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/types'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {
	Calculator,
	Calendar,
	Users,
	FileText,
	Bell,
	Shield,
	CheckCircle,
	ArrowRight,
	ChevronDown,
} from 'lucide-react'
import { Metadata } from 'next'
// Импортируем конфиг и хелпер цен
import { PRICING_CONFIG, formatPrice } from '@/constants/pricing-config'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>
}): Promise<Metadata> {
	const { lang } = await params
	const title =
		lang === 'ru'
			? 'SalyqApp — Налоги ИП Казахстана 2026'
			: 'SalyqApp — Қазақстан ЖК салықтары 2026'
	const description =
		lang === 'ru'
			? 'Автоматический расчёт налогов, ОПВ, СО и отчеты для ИП на упрощенке.'
			: 'Оңайлатылған декларациядағы ЖК үшін салықтарды, МЗЖ, ӘА автоматты есептеу.'

	return { title, description }
}

export default async function LandingPage({
	params,
}: {
	params: Promise<{ lang: string }>
}) {
	const { lang: langParam } = await params
	const lang = langParam as Locale

	const session = await auth()
	if (session) {
		redirect(`/${lang}/dashboard`)
	}

	const dict = await getDictionary(lang)
	const prefix = lang === 'kz' ? '/kz' : ''
	// Хелпер для определения ключа языка в конфиге
	const configLang = lang === 'kz' ? 'kz' : 'ru'

	const features = [
		{
			icon: Calculator,
			title: lang === 'ru' ? 'Автоматический расчёт' : 'Автоматты есеп',
			desc:
				lang === 'ru'
					? 'Налог 4%, ОПВ, ОПВР, ВОСМС, СО — всё считается автоматически'
					: 'Салық 4%, МЗЖ, МЖЗЖ, МӘМС, ӘА — бәрі автоматты есептеледі',
		},
		{
			icon: Calendar,
			title: lang === 'ru' ? 'Налоговый календарь' : 'Салық күнтізбесі',
			desc:
				lang === 'ru'
					? 'Все дедлайны 2026 с учётом праздников РК. Никогда не пропустите платёж'
					: '2026 жылғы барлық мерзімдер мейрамдарды ескере отырып',
		},
		{
			icon: Users,
			title: lang === 'ru' ? 'Учёт сотрудников' : 'Қызметкерлерді есепке алу',
			desc:
				lang === 'ru'
					? 'Расчёт ИПН, ОПВ, ООСМС за каждого сотрудника автоматически'
					: 'Әр қызметкер үшін ЖТС, МЗЖ, АӘМС автоматты есептеледі',
		},
		{
			icon: FileText,
			title: lang === 'ru' ? 'PDF отчёты' : 'PDF есептер',
			desc:
				lang === 'ru'
					? 'Скачайте налоговый отчёт за любой период в один клик'
					: 'Кез келген кезең үшін салық есебін бір рет басу арқылы жүктеңіз',
		},
		{
			icon: Bell,
			title: lang === 'ru' ? 'Уведомления' : 'Хабарландырулар',
			desc:
				lang === 'ru'
					? 'Напомним о дедлайнах за 7, 3 и 1 день до срока'
					: 'Мерзімге дойін 7, 3 және 1 күн бұрын хабарлаймыз',
		},
		{
			icon: Shield,
			title: lang === 'ru' ? 'Безопасность' : 'Қауіпсіздік',
			desc:
				lang === 'ru'
					? 'ИИН хранится в зашифрованном виде AES-256. Данные защищены'
					: 'ЖСН AES-256 шифрланған түрде сақталады. Деректер қорғалған',
		},
	]

	// ПЕРЕПИСАННЫЙ БЛОК ТАРИФОВ
	const plans = [
		{
			name: PRICING_CONFIG.free[`name_${configLang}`],
			price: formatPrice(PRICING_CONFIG.free.price_monthly, configLang),
			period: '',
			features: PRICING_CONFIG.free[`features_${configLang}`],
			cta: lang === 'ru' ? 'Начать бесплатно' : 'Тегін бастау',
			highlight: false,
		},
		{
			name: PRICING_CONFIG.pro[`name_${configLang}`],
			price: formatPrice(PRICING_CONFIG.pro.price_monthly, configLang),
			period: dict.pricing.per_month,
			features: PRICING_CONFIG.pro[`features_${configLang}`],
			cta: lang === 'ru' ? 'Попробовать 7 дней' : '7 күн байқап көру',
			highlight: true,
		},
		{
			name: PRICING_CONFIG.business[`name_${configLang}`],
			price: formatPrice(PRICING_CONFIG.business.price_yearly, configLang),
			period: dict.pricing.per_year,
			features: PRICING_CONFIG.business[`features_${configLang}`],
			cta: lang === 'ru' ? 'Выбрать Бизнес' : 'Бизнесті таңдау',
			highlight: false,
		},
	]

	const faqItems = [
		{ q: dict.faq.q1, a: dict.faq.a1 },
		{ q: dict.faq.q2, a: dict.faq.a2 },
		{ q: dict.faq.q3, a: dict.faq.a3 },
		{ q: dict.faq.q4, a: dict.faq.a4 },
		{ q: dict.faq.q5, a: dict.faq.a5 },
	]

	return (
		<div className='min-h-screen bg-background'>
			{/* Навигация */}
			<header className='sticky top-0 z-50 bg-background/80 backdrop-blur border-b'>
				<div className='mx-auto max-w-7xl px-4 h-16 flex items-center justify-between'>
					<div>
						<span className='text-xl font-bold'>SalyqApp</span>
						<span className='text-base text-muted-foreground ml-2 hidden sm:inline'>
							{lang === 'ru'
								? '— налоговый помощник ИП'
								: '— ЖК салық көмекшісі'}
						</span>
					</div>

					<div className='flex items-center gap-3'>
						<div className='flex gap-1 bg-muted/50 p-1 rounded-lg border'>
							<Link
								href={`/${prefix ? '' : 'ru'}`}
								className={`px-3 py-1 rounded-md text-base font-medium transition-colors ${
									lang === 'ru'
										? 'bg-background shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								RU
							</Link>
							<Link
								href='/kz'
								className={`px-3 py-1 rounded-md text-base font-medium transition-colors ${
									lang === 'kz'
										? 'bg-background shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								KZ
							</Link>
						</div>

						<Link
							href={`${prefix}/login`}
							className='bg-primary text-primary-foreground px-4 py-2 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors'
						>
							{lang === 'ru' ? 'Войти' : 'Кіру'}
						</Link>
					</div>
				</div>
			</header>

			{/* Hero секция */}
			<section className='mx-auto max-w-7xl px-4 py-16 md:py-24 text-center'>
				<div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium mb-6'>
					<CheckCircle className='w-4 h-4' />
					{lang === 'ru' ? 'Обновлено для 2026 года' : '2026 жылға жаңартылды'}
				</div>

				<h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6'>
					{lang === 'ru' ? (
						<>
							Налоги ИП Казахстана{' '}
							<span className='text-primary'>без бухгалтера</span>
						</>
					) : (
						<>
							Қазақстан ЖК салығы{' '}
							<span className='text-primary'>бухгалтерсіз</span>
						</>
					)}
				</h1>

				<p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-10'>
					{lang === 'ru'
						? 'Автоматический расчёт налога 4%, ОПВ, ОПВР, ВОСМС и СО. Все дедлайны 2026. КБК для оплаты. Работает на телефоне.'
						: 'Салық 4%, МЗЖ, МЖЗЖ, МӘМС және ӘА автоматты есебі. 2026 жылғы барлық мерзімдер. Төлемге арналған КБК. Телефонда жұмыс істейді.'}
				</p>

				<div className='flex flex-col sm:flex-row gap-4 justify-center'>
					<Link
						href={`${prefix}/login`}
						className='flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors'
					>
						{lang === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
						<ArrowRight className='w-5 h-5' />
					</Link>
					<Link
						href='#features'
						className='flex items-center justify-center gap-2 border px-8 py-4 rounded-xl text-lg font-medium hover:bg-muted transition-colors'
					>
						{lang === 'ru' ? 'Узнать больше' : 'Көбірек білу'}
					</Link>
				</div>
			</section>

			{/* Возможности */}
			<section id='features' className='bg-muted/30 py-16'>
				<div className='mx-auto max-w-7xl px-4'>
					<h2 className='text-3xl font-bold text-center mb-12'>
						{lang === 'ru' ? 'Всё что нужно ИП' : 'ЖК-ға қажетті барлық нәрсе'}
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{features.map((f, i) => (
							<div key={i} className='bg-background rounded-xl border p-6'>
								<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
									<f.icon className='w-5 h-5 text-primary' />
								</div>
								<h3 className='text-lg font-semibold mb-2'>{f.title}</h3>
								<p className='text-base text-muted-foreground'>{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Тарифы */}
			<section id='pricing' className='py-16'>
				<div className='mx-auto max-w-7xl px-4'>
					<h2 className='text-3xl font-bold text-center mb-4'>
						{dict.pricing.title}
					</h2>
					<p className='text-base text-muted-foreground text-center mb-12'>
						{dict.pricing.subtitle}
					</p>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
						{plans.map((plan, i) => (
							<div
								key={i}
								className={`rounded-xl border p-6 ${
									plan.highlight
										? 'border-primary bg-primary/5 relative'
										: 'bg-background'
								}`}
							>
								{plan.highlight && (
									<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
										<span className='bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium'>
											{lang === 'ru' ? 'Популярный' : 'Танымал'}
										</span>
									</div>
								)}

								<h3 className='text-xl font-bold mb-2'>{plan.name}</h3>
								<div className='mb-6'>
									<span className='text-3xl font-bold'>{plan.price}</span>
									{plan.period && (
										<span className='text-base text-muted-foreground ml-1'>
											{plan.period}
										</span>
									)}
								</div>

								<ul className='space-y-3 mb-6'>
									{plan.features.map((feat, j) => (
										<li key={j} className='flex items-center gap-2 text-sm'>
											<CheckCircle className='w-4 h-4 text-green-500 shrink-0' />
											{feat}
										</li>
									))}
								</ul>

								<Link
									href={`${prefix}/login`}
									className={`block text-center py-3 rounded-lg text-sm font-semibold transition-colors ${
										plan.highlight
											? 'bg-primary text-primary-foreground hover:bg-primary/90'
											: 'border hover:bg-muted'
									}`}
								>
									{plan.cta}
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section id='faq' className='bg-muted/30 py-16'>
				<div className='mx-auto max-w-3xl px-4'>
					<h2 className='text-3xl font-bold text-center mb-12'>
						{dict.faq.title}
					</h2>
					<div className='space-y-3'>
						{faqItems.map((item, i) => (
							<details
								key={i}
								className='bg-background rounded-xl border overflow-hidden group'
							>
								<summary className='flex items-center justify-between p-4 cursor-pointer list-none hover:bg-muted/30 transition-colors'>
									<p className='text-base font-medium pr-4'>{item.q}</p>
									<ChevronDown className='w-5 h-5 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform' />
								</summary>
								<div className='px-4 pb-4 pt-3 border-t'>
									<p className='text-base text-muted-foreground'>{item.a}</p>
								</div>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* Футер */}
			<footer className='border-t py-8 text-center'>
				<div className='mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
					<p className='text-sm text-muted-foreground'>
						© 2026 SalyqApp.{' '}
						{lang === 'ru'
							? 'Все права защищены.'
							: 'Барлық құқықтар қорғалған.'}
					</p>
					<p className='text-sm text-muted-foreground'>
						{lang === 'ru'
							? 'Данные актуальны на 2026 год.'
							: 'Деректер 2026 жылға өзекті.'}
					</p>
				</div>
			</footer>
		</div>
	)
}