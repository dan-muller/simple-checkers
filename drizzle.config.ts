import { config } from 'dotenv-flow'
import { defineConfig } from 'drizzle-kit'
import { env } from '~/lib/utils'

config({ purge_dotenv: true })

export default defineConfig({
    schema: './schema.ts',
    dialect: 'sqlite',
    driver: 'turso',
    dbCredentials: {
        url: env(String, 'TURSO_CONNECTION_URL'),
        authToken: env(String, 'TURSO_AUTH_TOKEN'),
    },
    verbose: true,
    strict: true,
})
