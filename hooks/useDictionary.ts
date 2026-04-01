'use client'

import { useState, useEffect } from 'react'
import type { Locale, Dictionary } from '@/types'

// Кэш словарей
const cache: Partial<Record<Locale, Dictionary>> = {}

export function useDictionary(lang: Locale) {
	const [dict, setDict] = useState<Dictionary | null>(cache[lang] ?? null)
	const [loading, setLoading] = useState(!cache[lang])

	useEffect(() => {
		if (cache[lang]) {
			setDict(cache[lang]!)
			setLoading(false)
			return
		}

		import(`@/dictionaries/${lang}.json`).then(m => {
			cache[lang] = m.default as Dictionary
			setDict(m.default as Dictionary)
			setLoading(false)
		})
	}, [lang])

	return { dict, loading }
}
