import { describe, test, expect } from 'vitest'
import {
	calculateIncomeTax,
	calculateSelfPayments,
	calculateEmployeePayments,
	checkIncomeLimit,
	checkBlockRisk,
} from './calculations'

describe('calculateIncomeTax', () => {
	test('4% from 1 000 000 + buffer = 40 005', () => {
		const result = calculateIncomeTax(1_000_000)
		expect(result.grossTax).toBe(40_000)
		expect(result.safeTax).toBe(40_005)
	})

	test('zero income = only buffer', () => {
		const result = calculateIncomeTax(0)
		expect(result.safeTax).toBe(5)
	})

	test('always rounds up (ceil)', () => {
		// 33 333 × 4% = 1333.32 → ceil = 1334
		const result = calculateIncomeTax(33_333)
		expect(result.grossTax).toBe(1_334)
	})
})

// ... (верхняя часть файла без изменений)

describe('calculateSelfPayments (minimum base 85 000)', () => {
  test('minimum monthly payments = 21 250', () => {
    const result = calculateSelfPayments(85_000)
    expect(result.opv).toBe(8_500)   // 85 000 × 10%
    expect(result.opvr).toBe(2_975)  // 85 000 × 3.5%
    expect(result.vosms).toBe(5_950) // фиксированные (ВОСМС за ИП)
    expect(result.so).toBe(3_825)    // (85 000 - 8 500) × 5%
    expect(result.total).toBe(21_250) // 8500 + 2975 + 5950 + 3825
  })

  test('income below MZP still uses MZP as base for OPVR', () => {
    const result = calculateSelfPayments(50_000)
    expect(result.opvr).toBe(2_975)
    expect(result.vosms).toBe(5_950)
  })
})

// ... (остальные тесты без изменений)

describe('calculateEmployeePayments (salary 500 000)', () => {
	test('correct withholding from employee', () => {
		const result = calculateEmployeePayments(500_000)
		expect(result.opv).toBe(50_000) // 500 000 × 10%
		expect(result.vosms).toBe(10_000) // 500 000 × 2%
		expect(result.ipn).toBe(31_025) // (500k - 50k - 10k - 129 750) × 10%
		expect(result.withheldTotal).toBe(91_025)
	})

	test('correct employer costs', () => {
		const result = calculateEmployeePayments(500_000)
		expect(result.opvr).toBe(17_500) // 500 000 × 3.5%
		expect(result.oosms).toBe(15_000) // 500 000 × 3%
		expect(result.so).toBe(22_500) // (500k - 50k) × 5%
		expect(result.employerTotal).toBe(55_000)
	})

	test('net salary = 408 975', () => {
		const result = calculateEmployeePayments(500_000)
		expect(result.netSalary).toBe(408_975)
	})
})

describe('checkIncomeLimit', () => {
	test('safe below 85%', () => {
		const result = checkIncomeLimit(1_000_000)
		expect(result.status).toBe('safe')
	})

	test('warning at 85%', () => {
		const limitTenge = 600_000 * 4_325 // 2 595 000 000
		const income = limitTenge * 0.86
		const result = checkIncomeLimit(income)
		expect(result.status).toBe('warning')
	})

	test('exceeded at 100%', () => {
		const result = checkIncomeLimit(2_595_000_001)
		expect(result.status).toBe('exceeded')
	})
})

describe('checkBlockRisk', () => {
	test('no block below 6 MRP (25 950)', () => {
		expect(checkBlockRisk(10_000)).toBe('none')
	})

	test('notice between 6-20 MRP', () => {
		expect(checkBlockRisk(50_000)).toBe('notice')
	})

	test('block between 20-45 MRP', () => {
		expect(checkBlockRisk(100_000)).toBe('block')
	})
})
