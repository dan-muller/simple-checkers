import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

const id = (name: string) => text(name).primaryKey().$default(createId)

const createdAt = (name?: string) =>
    text(name ?? 'created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull()

const updateAt = (name?: string) => integer(name ?? 'updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())

const game = sqliteTable('game', {
    id: id('id'),
    createdAt: createdAt(),
    updatedAt: updateAt(),
})
