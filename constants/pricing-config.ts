// constants/pricing-config.ts
// Все цены и настройки тарифов — меняй только здесь
// После изменения: git add . && git commit -m "update pricing" && git push

export const PRICING_CONFIG = {
	_meta: {
		lastUpdated: '2026-04-01',
		currency: 'KZT',
		note: 'Все цены в тенге. trial_days = срок бесплатного пробного периода.',
	},

	free: {
		id: 'FREE' as const,
		name_ru: 'Старт',
		name_kz: 'Старт',
		price_monthly: 0,
		price_yearly: 0,
		trial_days: 0,
		limits: {
			max_employees: 3, // макс сотрудников
			max_incomes_per_month: 30, // макс записей дохода в месяц
		},
		features: {
			tax_calculator: true,
			calendar: true,
			kbk_reference: true,
			employees: true,
			pdf_reports: false,
			analytics: false,
			telegram_notifications: false,
			priority_support: false,
		},
		features_ru: [
			'Расчёт налогов и соцплатежей',
			'Налоговый календарь',
			'Справочник КБК',
			'До 3 сотрудников',
			'История доходов',
		],
		features_kz: [
			'Салық және әлеум. төлемдер есебі',
			'Салық күнтізбесі',
			'КБК анықтамалығы',
			'3 қызметкерге дейін',
			'Табыс тарихы',
		],
	},

	pro: {
		id: 'PRO' as const,
		name_ru: 'Профи',
		name_kz: 'Про',
		price_monthly: 3900, // ← цена в месяц
		price_yearly: 39000, // ← цена в год (экономия ~16%)
		trial_days: 7, // ← дней бесплатного пробного периода
		limits: {
			max_employees: null, // null = безлимит
			max_incomes_per_month: null,
		},
		features: {
			tax_calculator: true,
			calendar: true,
			kbk_reference: true,
			employees: true,
			pdf_reports: true,
			analytics: true,
			telegram_notifications: true,
			priority_support: false,
		},
		features_ru: [
			'Всё из тарифа Старт',
			'PDF отчёты за любой период',
			'Аналитика и графики',
			'Telegram уведомления',
			'Неограниченно сотрудников',
			`${7} дней бесплатно`, // ← автоматически берётся trial_days
		],
		features_kz: [
			'Старт тарифінен бәрі',
			'Кез келген кезең үшін PDF есептер',
			'Аналитика және графиктер',
			'Telegram хабарландырулар',
			'Шексіз қызметкерлер',
			`${7} күн тегін`,
		],
	},

	business: {
		id: 'BUSINESS' as const,
		name_ru: 'Бизнес',
		name_kz: 'Бизнес',
		price_monthly: null, // только годовой
		price_yearly: 39000, // ← цена в год
		trial_days: 0,
		savings_percent: 20, // ← процент экономии по сравнению с месячным
		limits: {
			max_employees: null,
			max_incomes_per_month: null,
		},
		features: {
			tax_calculator: true,
			calendar: true,
			kbk_reference: true,
			employees: true,
			pdf_reports: true,
			analytics: true,
			telegram_notifications: true,
			priority_support: true,
		},
		features_ru: [
			'Всё из тарифа Профи',
			'Приоритетная поддержка',
			`Экономия ${20}%`,
			'Ранний доступ к новым функциям',
			'Годовая подписка',
		],
		features_kz: [
			'Про тарифінен бәрі',
			'Басым қолдау',
			`${20}% үнемдеу`,
			'Жаңа функцияларға ерте қол жеткізу',
			'Жылдық жазылым',
		],
	},
} as const

// Хелперы для работы с конфигом
export type PlanId = 'FREE' | 'PRO' | 'BUSINESS'

export function getPlanConfig(planId: PlanId) {
	switch (planId) {
		case 'FREE':
			return PRICING_CONFIG.free
		case 'PRO':
			return PRICING_CONFIG.pro
		case 'BUSINESS':
			return PRICING_CONFIG.business
	}
}

export function formatPrice(amount: number, lang: 'ru' | 'kz' = 'ru'): string {
	if (amount === 0) return lang === 'ru' ? 'Бесплатно' : 'Тегін'
	return `${amount.toLocaleString('ru-RU')} ₸`
}

export function getPlanFeatures(
	planId: PlanId,
	lang: 'ru' | 'kz' = 'ru',
): string[] {
	const plan = getPlanConfig(planId)
	return lang === 'ru' ? [...plan.features_ru] : [...plan.features_kz]
}

export function canUsePDF(planId: PlanId): boolean {
	return getPlanConfig(planId).features.pdf_reports
}

export function canUseTelegram(planId: PlanId): boolean {
	return getPlanConfig(planId).features.telegram_notifications
}

export function getMaxEmployees(planId: PlanId): number | null {
	return getPlanConfig(planId).limits.max_employees
}


