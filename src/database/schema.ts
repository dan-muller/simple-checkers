import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

import type { GameHistoryType, PieceType, Player, Position } from '~/lib/game'

const id = (name: string) => text(name).primaryKey().$default(createId)
const position = (name: string) => text(name).$type<Position>()

const createdAt = (name?: string) =>
    text(name ?? 'created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull()

const updateAt = (name?: string) => integer(name ?? 'updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())

export const player = sqliteTable('player', {
    id: text('player_id').primaryKey().$type<Player>(),
    createdAt: createdAt(),
    updatedAt: updateAt(),
})
const playerIdRef = (name: string) => text(name).references(() => player.id, { onDelete: 'cascade' })

export const game = sqliteTable('game', {
    id: id('game_id'),
    createdAt: createdAt(),
    updatedAt: updateAt(),
})
export const gameRelations = relations(game, ({ many }) => ({
    pieces: many(piece),
    history: many(history),
    players: many(player),
}))
const gameIdRef = (name: string) => text(name).references(() => game.id, { onDelete: 'cascade' })

export const piece = sqliteTable(
    'piece',
    {
        id: id('piece_id'),
        gameId: gameIdRef('game_id').notNull(),
        playerId: playerIdRef('player_id').notNull(),
        type: text('type').notNull().$type<PieceType>(),
        createdAt: createdAt(),
        updatedAt: updateAt(),
    },
    (table) => ({
        gameIdx: index('piece_game_idx').on(table.gameId),
        playerIdx: index('piece_player_idx').on(table.playerId),
    }),
)
export const pieceRelations = relations(piece, ({ one }) => ({
    game: one(game, {
        fields: [piece.gameId],
        references: [game.id],
    }),
    player: one(player, {
        fields: [piece.playerId],
        references: [player.id],
    }),
}))
const pieceIdRef = (name: string) => text(name).references(() => piece.id, { onDelete: 'cascade' })

export const history = sqliteTable(
    'history',
    {
        id: id('history_id'),
        gameId: gameIdRef('game_id').notNull(),
        createdAt: createdAt(),
        updatedAt: updateAt(),
        pieceId: pieceIdRef('piece_id').notNull(),
        from: position('from'),
        to: position('to').notNull(),
        type: text('type').notNull().$type<GameHistoryType>(),
    },
    (table) => ({
        gameIdx: index('history_game_idx').on(table.gameId),
        pieceIdx: index('history_piece_idx').on(table.pieceId),
    }),
)
export const historyRelations = relations(history, ({ one }) => ({
    game: one(game, {
        fields: [history.gameId],
        references: [game.id],
    }),
    piece: one(piece, {
        fields: [history.pieceId],
        references: [piece.id],
    }),
}))
const historyIdRef = (name: string) => text(name).references(() => history.id, { onDelete: 'cascade' })
