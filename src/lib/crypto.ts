import crypto from 'crypto'
import { env } from '~/lib/utils'

export const getSecret = () => crypto.randomBytes(32).toString('base64')

const key = crypto.createHash('sha512').update(env(String, 'SECRET_KEY')).digest('hex').substring(0, 32)
const iv = crypto.createHash('sha512').update(env(String, 'SECRET_IV')).digest('hex').substring(0, 16)

export function encode(plaintext: string) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    // Encrypts data and converts to hex and base64
    return Buffer.from(cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')).toString('base64')
}

export function decode(ciphertext: string) {
    const buffer = Buffer.from(ciphertext, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    // Decrypts data and converts to utf8
    return decipher.update(buffer.toString('utf8'), 'hex', 'utf8') + decipher.final('utf8')
}
