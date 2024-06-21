import { registerOTel } from '@vercel/otel'
import { env } from '~/lib/utils'
import { runMigrations } from '~/database/drizzle'

export function register() {
    registerOTel()
}
