import type { Locale } from '@/types'

const dictionaries = {
	ru: () => import('@/dictionaries/ru.json').then(m => m.default),
	kz: () => import('@/dictionaries/kz.json').then(m => m.default),
}

export const getDictionary = async (locale: Locale) => {
	return dictionaries[locale]?.() ?? dictionaries['ru']()
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
