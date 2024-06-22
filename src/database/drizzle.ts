import * as schema from './schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { config } from 'dotenv-flow'
import { env } from '~/lib/utils'
import { initDb } from '~/database/util'

config()

export const db = initDb({
    url: env(String, 'TURSO_CONNECTION_URL'),
    authToken: env(String, 'TURSO_AUTH_TOKEN'),
})

export type Database = LibSQLDatabase<typeof schema>
