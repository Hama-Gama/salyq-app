import Decimal from 'decimal.js'
import { TAX_CONFIG } from '@/constants/tax-config'

const cfg = TAX_CONFIG

// Настройка Decimal.js — точность 20 знаков
Decimal.set({ precision: 20, rounding: Decimal.ROUND_CEIL })

// ─── ВСПОМОГАТЕЛЬНЫЕ ─────────────────────────────────

// Округление вверх + буфер безопасности 5 тенге
function safeRound(value: Decimal): number {
	return value
		.ceil()
		.plus(cfg.calculation_policy.safety_buffer_tenge)
		.toNumber()
}

// Округление вверх БЕЗ буфера (для промежуточных вычислений)
function roundUp(value: Decimal): number {
	return value.ceil().toNumber()
}

// ─── НАЛОГ 4% ПО 910 ФОРМЕ ───────────────────────────

export interface TaxResult {
	grossTax: number // Налог до буфера
	safeTax: number // Налог с буфером 5 тг
	rate: number // Применённая ставка
}

export function calculateIncomeTax(
	income: number,
	rate: number = cfg.tax_income.rate.value,
): TaxResult {
	const incomeD = new Decimal(income)
	const rateD = new Decimal(rate)
	const grossTax = incomeD.mul(rateD).ceil().toNumber()
	const safeTax = grossTax + cfg.calculation_policy.safety_buffer_tenge

	return { grossTax, safeTax, rate }
}

// ─── СОЦПЛАТЕЖИ ИП ЗА СЕБЯ ───────────────────────────

export interface SelfPaymentsResult {
	opv: number // Пенсионные взносы
	opvr: number // Взносы работодателя
	vosms: number // Медстрахование (фиксированные)
	so: number // Социальные отчисления
	total: number // Итого
}

export function calculateSelfPayments(
	declaredIncome: number = cfg.self_payments._min_base,
): SelfPaymentsResult {
	const income = new Decimal(declaredIncome)
	const minBase = new Decimal(cfg.self_payments._min_base)

	// ОПВ: 10% от заявленного дохода (мин 1 МЗП)
	const opvBase = Decimal.max(income, minBase)
	const opv = roundUp(opvBase.mul(cfg.self_payments.opv.rate))

	// ОПВР: 3.5% от заявленного дохода (мин 1 МЗП)
	const opvrBase = Decimal.max(income, minBase)
	const opvr = roundUp(opvrBase.mul(cfg.self_payments.opvr.rate))

	// ВОСМС: фиксированная сумма 5% от 1.4 МЗП
	const vosms = cfg.self_payments.vosms.fixed_amount

	// СО: 5% от (доход - ОПВ), мин база 1 МЗП
	const soBase = Decimal.max(income, minBase).minus(opv)
	const so = roundUp(soBase.mul(cfg.self_payments.so.rate))

	const total = opv + opvr + vosms + so

	return { opv, opvr, vosms, so, total }
}

// ─── СОЦПЛАТЕЖИ ЗА СОТРУДНИКА ────────────────────────

export interface EmployeePaymentsResult {
	// Удержание с сотрудника
	opv: number
	vosms: number
	ipn: number
	withheldTotal: number

	// За счёт работодателя
	opvr: number
	oosms: number
	so: number
	employerTotal: number

	// Итог
	netSalary: number // На руки сотруднику
	grossCost: number // Полная стоимость для работодателя
}

export function calculateEmployeePayments(
	salary: number,
): EmployeePaymentsResult {
	const s = new Decimal(salary)
	const ep = cfg.employee_payments
	const mrp = new Decimal(cfg.constants.mrp.value)

	// Удержание с сотрудника
	const opv = roundUp(s.mul(ep.opv.rate))
	const vosms = roundUp(s.mul(ep.vosms.rate))

	// ИПН: (зарплата - ОПВ - ВОСМС - вычет 30 МРП) × 10%
	const deduction = mrp.mul(ep.ipn.deduction_mrp)
	const ipnBase = s.minus(opv).minus(vosms).minus(deduction)
	const ipn = ipnBase.gt(0) ? roundUp(ipnBase.mul(ep.ipn.rate_standard)) : 0

	const withheldTotal = opv + vosms + ipn

	// За счёт работодателя
	const opvr = roundUp(s.mul(ep.opvr.rate))
	const oosms = roundUp(s.mul(ep.oosms.rate))
	const so = roundUp(s.minus(opv).mul(ep.so.rate))

	const employerTotal = opvr + oosms + so

	const netSalary = salary - withheldTotal
	const grossCost = salary + employerTotal

	return {
		opv,
		vosms,
		ipn,
		withheldTotal,
		opvr,
		oosms,
		so,
		employerTotal,
		netSalary,
		grossCost,
	}
}

// ─── КОНТРОЛЬ ЛИМИТОВ ────────────────────────────────

export type LimitStatus = 'safe' | 'warning' | 'critical' | 'exceeded'

export interface LimitCheckResult {
	status: LimitStatus
	usedPercent: number
	remainingTenge: number
	limitTenge: number
}

export function checkIncomeLimit(totalIncome: number): LimitCheckResult {
	const limit = cfg.limits.annual_income
	const limitTenge = limit.mrp_multiplier * cfg.constants.mrp.value
	const usedPercent = (totalIncome / limitTenge) * 100
	const remainingTenge = limitTenge - totalIncome

	let status: LimitStatus = 'safe'
	if (totalIncome >= limitTenge) status = 'exceeded'
	else if (usedPercent >= limit.critical_at_percent) status = 'critical'
	else if (usedPercent >= limit.warning_at_percent) status = 'warning'

	return { status, usedPercent, remainingTenge, limitTenge }
}

// ─── РИСК БЛОКИРОВКИ СЧЁТА ───────────────────────────

export type BlockRisk = 'none' | 'notice' | 'block' | 'property' | 'travel_ban'

export function checkBlockRisk(debtAmount: number): BlockRisk {
	const mrp = cfg.constants.mrp.value
	const levels = cfg.account_blocking.levels

	for (const level of levels) {
		const from = level.from_mrp * mrp
		const to = level.to_mrp ? level.to_mrp * mrp : Infinity
		if (debtAmount >= from && debtAmount < to) {
			return level.action as BlockRisk
		}
	}
	return 'none'
}

// ─── ИТОГОВЫЙ ЕЖЕМЕСЯЧНЫЙ РАСЧЁТ ─────────────────────

export interface MonthlyPaymentSummary {
	self: SelfPaymentsResult
	employees: EmployeePaymentsResult[]
	grandTotal: number
}

export function calculateMonthlyTotal(
	declaredSelfIncome: number,
	employeeSalaries: number[],
): MonthlyPaymentSummary {
	const self = calculateSelfPayments(declaredSelfIncome)
	const employees = employeeSalaries.map(calculateEmployeePayments)

	const employerCosts = employees.reduce((sum, e) => sum + e.employerTotal, 0)

	const grandTotal = self.total + employerCosts

	return { self, employees, grandTotal }
}
