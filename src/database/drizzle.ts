import { config } from 'dotenv-flow'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from '~/lib/utils'
import { migrate } from 'drizzle-orm/libsql/migrator'

config({ purge_dotenv: true })

const client = createClient({
    url: env(String, 'TURSO_CONNECTION_URL'),
    authToken: env(String, 'TURSO_AUTH_TOKEN'),
})

export const db = drizzle(client)

export type Database = typeof db

export const runMigrations = async (dir: string) => {
    return migrate(db, { migrationsFolder: dir })
}
