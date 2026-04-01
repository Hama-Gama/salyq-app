import * as z from 'zod'

// Схема для добавления дохода
export const incomeSchema = z.object({
	amount: z
		.number()
		.positive({ error: 'Сумма должна быть больше 0' })
		.max(2_595_000_000, { error: 'Сумма превышает годовой лимит' }),
	category: z.string().optional(),
	note: z.string().max(500).optional(),
	date: z.string().optional(),
})

export type IncomeInput = z.infer<typeof incomeSchema>

// Схема для обновления профиля
export const profileSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	iin: z
		.string()
		.length(12, { error: 'ИИН должен содержать 12 цифр' })
		.regex(/^\d{12}$/, { error: 'ИИН должен содержать только цифры' })
		.optional(),
	language: z.enum(['ru', 'kz']).optional(),
	tgChatId: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
