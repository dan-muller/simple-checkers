'use server'

import { db } from '~/database'
import { eq, or } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function getPlayers() {
    const players = await db
        .select()
        .from(db.player)
        .where(or(eq(db.player.id, 'red'), eq(db.player.id, 'black')))
    const red = players.find((p) => p.id === 'red')!
    const black = players.find((p) => p.id === 'black')!

    return [red, black] as const
}

export async function newGame() {
    console.log('newGame')
    const [red, black] = await getPlayers()
    const [game] = await db.insert(db.game).values({}).returning()
    const gameId = game.id
    const [redPieces, blackPieces, history] = await db.transaction(async (tx) => {
        const [redPieces, blackPieces] = await Promise.all([
            tx
                .insert(db.piece)
                .values([
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                    { gameId, playerId: red.id, type: 'pawn' },
                ])
                .returning(),
            tx
                .insert(db.piece)
                .values([
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                    { gameId, playerId: black.id, type: 'pawn' },
                ])
                .returning(),
        ])
        const history = await tx
            .insert(db.history)
            .values([
                { type: 'init', gameId, pieceId: redPieces[0].id, to: 'a1' },
                { type: 'init', gameId, pieceId: redPieces[1].id, to: 'b2' },
                { type: 'init', gameId, pieceId: redPieces[2].id, to: 'a3' },
                { type: 'init', gameId, pieceId: redPieces[3].id, to: 'b4' },
                { type: 'init', gameId, pieceId: redPieces[4].id, to: 'a5' },
                { type: 'init', gameId, pieceId: redPieces[5].id, to: 'b6' },
                { type: 'init', gameId, pieceId: redPieces[6].id, to: 'a7' },
                { type: 'init', gameId, pieceId: redPieces[7].id, to: 'b8' },
                { type: 'init', gameId, pieceId: blackPieces[0].id, to: 'g1' },
                { type: 'init', gameId, pieceId: blackPieces[1].id, to: 'h2' },
                { type: 'init', gameId, pieceId: blackPieces[2].id, to: 'g3' },
                { type: 'init', gameId, pieceId: blackPieces[3].id, to: 'h4' },
                { type: 'init', gameId, pieceId: blackPieces[4].id, to: 'g5' },
                { type: 'init', gameId, pieceId: blackPieces[5].id, to: 'h6' },
                { type: 'init', gameId, pieceId: blackPieces[6].id, to: 'g7' },
                { type: 'init', gameId, pieceId: blackPieces[7].id, to: 'h8' },
            ])
            .returning()
        return [redPieces, blackPieces, history] as const
    })
    console.log('newGame', game, redPieces, blackPieces, history)
    redirect(`/game/${game.id}`)
}
