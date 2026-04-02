import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY =
	process.env['ENCRYPTION_KEY'] ?? 'salyq-default-key-32-characters!!'


// Ключ должен быть ровно 32 байта
function getKey(): Buffer {
	return crypto.scryptSync(SECRET_KEY, 'salyq-salt', 32)
}

// Шифрование ИИН
export function encryptIIN(iin: string): string {
	const key = getKey()
	const iv = crypto.randomBytes(16)
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

	let encrypted = cipher.update(iin, 'utf8', 'hex')
	encrypted += cipher.final('hex')

	const authTag = cipher.getAuthTag()

	// Формат: iv:authTag:encrypted
	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// Дешифрование ИИН
export function decryptIIN(encryptedData: string): string {
	const key = getKey()
	const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

	if (!ivHex || !authTagHex || !encrypted) {
		throw new Error('Неверный формат зашифрованных данных')
	}

	const iv = Buffer.from(ivHex, 'hex')
	const authTag = Buffer.from(authTagHex, 'hex')

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
	decipher.setAuthTag(authTag)

	let decrypted = decipher.update(encrypted, 'hex', 'utf8')
	decrypted += decipher.final('utf8')

	return decrypted
}


