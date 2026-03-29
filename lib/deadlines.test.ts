import { describe, test, expect } from 'vitest'
import {
	getMonthlyDeadline,
	get910Deadlines,
	getDaysUntilDeadline,
} from './deadlines'

describe('getMonthlyDeadline', () => {
	test('March 2026: 25th is holiday (Nauryz) = shift to 27th', () => {
		const deadline = getMonthlyDeadline(2026, 3)
		// 21-25 марта — праздники и переносы.
		// Код верно возвращает первый рабочий день после праздников.
		expect(deadline.getDate()).toBe(27)
		expect(deadline.getMonth()).toBe(2) // март (индекс 2)
	})

	test('August 2026: 25th + Constitution Day shift', () => {
		const deadline = getMonthlyDeadline(2026, 8)
		expect(deadline.getDate()).toBe(25)
	})
})

describe('get910Deadlines', () => {
	test('half1 payBy is on or after August 25', () => {
		const deadlines = get910Deadlines(2026)
		const payBy = deadlines.half1.payBy
		expect(payBy.getMonth()).toBe(7) // август
		expect(payBy.getDate()).toBeGreaterThanOrEqual(25)
	})

	test('half2 payBy is in February next year', () => {
		const deadlines = get910Deadlines(2026)
		const payBy = deadlines.half2.payBy
		expect(payBy.getFullYear()).toBe(2027)
		expect(payBy.getMonth()).toBe(1) // февраль
	})
})
