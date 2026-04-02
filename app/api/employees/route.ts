import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { employeeSchema } from '@/lib/validation'
import { calculateEmployeePayments } from '@/lib/calculations'

// GET — список сотрудников с расчётом платежей
export async function GET() {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const employees = await prisma.employee.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: 'desc' },
	})

	// Добавляем расчёт платежей к каждому сотруднику
	const employeesWithPayments = employees.map(emp => ({
		...emp,
		payments: calculateEmployeePayments(Number(emp.salary)),
	}))

	// Считаем итого по всем активным сотрудникам
	const activeEmployees = employeesWithPayments.filter(e => e.isActive)
	const totalEmployerCost = activeEmployees.reduce(
		(sum, e) => sum + e.payments.grossCost,
		0,
	)
	const totalEmployerExtra = activeEmployees.reduce(
		(sum, e) => sum + e.payments.employerTotal,
		0,
	)

	return Response.json({
		employees: employeesWithPayments,
		summary: {
			activeCount: activeEmployees.length,
			totalEmployerCost,
			totalEmployerExtra,
		},
	})
}

// POST — добавить сотрудника
export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const body = await request.json()

	const result = employeeSchema.safeParse(body)
	if (!result.success) {
		return Response.json(
			{ error: 'Ошибка валидации', issues: result.error.issues },
			{ status: 400 },
		)
	}

	const { name, salary, hiredAt } = result.data

	const employee = await prisma.employee.create({
		data: {
			userId: session.user.id,
			name,
			salary,
			hiredAt: hiredAt ? new Date(hiredAt) : new Date(),
		},
	})

	return Response.json({
		employee: {
			...employee,
			payments: calculateEmployeePayments(Number(employee.salary)),
		},
	})
}

// PATCH — уволить сотрудника (soft delete)
export async function PATCH(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id')

	if (!id) {
		return Response.json({ error: 'ID не указан' }, { status: 400 })
	}

	const employee = await prisma.employee.findFirst({
		where: { id, userId: session.user.id },
	})

	if (!employee) {
		return Response.json({ error: 'Сотрудник не найден' }, { status: 404 })
	}

	const updated = await prisma.employee.update({
		where: { id },
		data: {
			isActive: false,
			firedAt: new Date(),
		},
	})

	return Response.json({ employee: updated })
}
