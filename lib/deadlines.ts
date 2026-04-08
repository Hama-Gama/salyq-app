import { HOLIDAYS_2026 } from '@/constants/holidays-2026'

// 1. Проверки дней
function isWeekend(date: Date): boolean {
	const day = date.getDay()
	return day === 0 || day === 6
}

function isHoliday(date: Date, holidays: string[] = HOLIDAYS_2026): boolean {
	const dateStr = date.toISOString().split('T')[0]
	return holidays.includes(dateStr)
}

// 2. Логика переносов
export function getNextWorkingDay(
	date: Date,
	holidays: string[] = HOLIDAYS_2026,
): Date {
	const result = new Date(date)
	while (isWeekend(result) || isHoliday(result, holidays)) {
		result.setDate(result.getDate() + 1)
	}
	return result
}

// 3. Расчёт дедлайнов
export function getMonthlyDeadline(year: number, month: number): Date {
	// Устанавливаем 25 число месяца на конец дня
	const date = new Date(year, month - 1, 25, 23, 59, 59)
	return getNextWorkingDay(date)
}

export function get910Deadlines(year: number) {
	return {
		half1: {
			submitBy: getNextWorkingDay(new Date(year, 7, 15)), // до 15 августа
			payBy: getNextWorkingDay(new Date(year, 7, 25)), // до 25 августа
		},
		half2: {
			submitBy: getNextWorkingDay(new Date(year + 1, 1, 15)), // до 15 февраля след. года
			payBy: getNextWorkingDay(new Date(year + 1, 1, 25)),
		},
	}
}

// 4. Утилиты для UI
export function formatDeadline(date: Date): string {
	return date.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

export function getDaysUntilDeadline(deadline: Date): number {
	const now = new Date()
	const diffTime = deadline.getTime() - now.getTime()
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export type DeadlineStatus = 'safe' | 'warning' | 'urgent' | 'overdue'

export function getDeadlineStatus(deadline: Date): DeadlineStatus {
	const days = getDaysUntilDeadline(deadline)
	if (days < 0) return 'overdue'
	if (days <= 1) return 'urgent'
	if (days <= 3) return 'warning'
	return 'safe'
}

// 5. Вспомогательная функция для логики "Какой следующий дедлайн от сегодня"
export function calculateNextMonthlyDeadline(): Date {
	const today = new Date()
	const year = today.getFullYear()
	const month = today.getMonth() // 0-11

	// Получаем дедлайн текущего месяца
	const currentMonthDeadline = getMonthlyDeadline(year, month + 1)

	// Если сегодня уже позже дедлайна текущего месяца, возвращаем дедлайн следующего
	if (today > currentMonthDeadline) {
		return getMonthlyDeadline(year, month + 2)
	}

	return currentMonthDeadline
}
