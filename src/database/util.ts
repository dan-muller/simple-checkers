import * as schema from '~/database/schema'
import { Config as LibSQLClientConfig, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

export const initDb = (config: LibSQLClientConfig) => {
    const client = createClient(config)
    return Object.assign(drizzle(client, { schema }), schema)
}

export const runMigrations = async (config: LibSQLClientConfig & { migrationsFolder: string }) => {
    return migrate(initDb(config), config)
}
