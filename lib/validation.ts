import * as z from 'zod'

export const incomeSchema = z.object({
	amount: z
		.number()
		.positive({ error: 'Сумма должна быть больше 0' })
		.min(1, { error: 'Минимальная сумма — 1 тенге' })
		.max(2_595_000_000, { error: 'Сумма превышает годовой лимит' }),

	category: z.string().max(100).optional(),

	note: z
		.string()
		.max(500, { error: 'Заметка не более 500 символов' })
		.regex(/^[^<>{}]*$/, { error: 'Недопустимые символы' }) // защита от HTML/скриптов
		.optional(),

	date: z
		.string()
		.refine(
			val => {
				if (!val) return true
				const date = new Date(val)
				const now = new Date()
				const minDate = new Date('2020-01-01')
				return date >= minDate && date <= now
			},
			{ error: 'Некорректная дата' },
		)
		.optional(),
})

export type IncomeInput = z.infer<typeof incomeSchema>
