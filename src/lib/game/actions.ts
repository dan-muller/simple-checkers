'use server';

import { db } from '~/database';
import { and, desc, eq, not, or } from 'drizzle-orm';
import {
    AvailableMoves,
    GameHistory,
    indexFromPosition,
    Player,
    PlayerPiece,
    Position,
    toPosition,
} from '~/lib/game/common';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPlayers() {
    await db
        .insert(db.player)
        .values([{ id: 'red' }, { id: 'black' }])
        .onConflictDoNothing();

    const players = await db
        .select()
        .from(db.player)
        .where(or(eq(db.player.id, 'red'), eq(db.player.id, 'black')));

    const red = players.find((p) => p.id === 'red')!;
    const black = players.find((p) => p.id === 'black')!;

    return [red, black] as const;
}

export async function newGame() {
    const [red, black] = await getPlayers();
    const [game] = await db.insert(db.game).values({}).returning();
    if (!game) throw new Error('Failed to create game');
    const gameId = game.id;
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
        ]);
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
            .returning();
        return [redPieces, blackPieces, history] as const;
    });
    redirect(`/game/${game.id}`);
}

function refresh(gameIdInput: string) {
    revalidatePath(`/game/${gameIdInput}`);
    redirect(`/game/${gameIdInput}`);
}

export const queryGameData = cache(async (gameId: string) => {
    const scores = new Map<Player, number>([
        ['red', 0],
        ['black', 0],
    ]);
    const gameData = await db.query.game.findFirst({
        where: (game, { eq }) => eq(game.id, gameId),
        with: {
            history: {
                with: { piece: { with: { player: true } } },
                where: (history, { eq }) => eq(history.active, true),
            },
        },
    });
    if (!gameData) return null;
    const history: GameHistory[] = gameData.history.map((hist) => ({
        ...hist,
        player: hist.piece.playerId as Player,
        piece: hist.piece.type,
    }));
    const init = history.filter((move) => move.type === 'init') as GameHistory<'init'>[];
    const board = new Map<Position, PlayerPiece>(init.map((move) => [move.to as Position, move]));

    const moves = history.filter((move) => move.type === 'move' || move.type === 'capture') as GameHistory<
        'move' | 'capture'
    >[];
    moves.forEach((move) => {
        if (move.type === 'move') {
            board.set(move.to as Position, board.get(move.from as Position)!);
            board.delete(move.from as Position);
        } else if (move.type === 'capture') {
            const [iColFrom, iRowFrom] = indexFromPosition(move.from as Position);
            const [iColTo, iRowTo] = indexFromPosition(move.to as Position);
            const [colOffset, rowOffset] = [iColTo - iColFrom, iRowTo - iRowFrom];
            const col = iColTo + colOffset;
            const row = iRowTo + rowOffset;
            const finalPosition = toPosition(col, row);
            if (finalPosition) {
                board.set(finalPosition, board.get(move.from as Position)!);
                board.delete(move.from as Position);
                board.delete(move.to as Position);
                scores.set(move.player, (scores.get(move.player) ?? 0) + 1);
            }
        }
    });
    const currentPlayer = (history.filter((h) => h.type === 'move').length % 2 === 0 ? 'red' : 'black') as Player;
    return { gameId, board, history, currentPlayer, scores } as const;
});

export type GameData = Exclude<Awaited<ReturnType<typeof queryGameData>>, null>;

export async function undoMove(formData: FormData) {
    const gameIdInput = formData.get('gameId');
    if (!gameIdInput || typeof gameIdInput !== 'string') return null;

    const last = await db.query.history.findFirst({
        where: and(
            eq(db.history.active, true),
            eq(db.history.gameId, gameIdInput as string),
            not(eq(db.history.type, 'init')),
        ),
        orderBy: [desc(db.history.createdAt)],
    });
    if (!last) return null;
    const updated = await db.update(db.history).set({ active: false }).where(eq(db.history.id, last.id)).returning();
    if (!updated) return null;
    refresh(gameIdInput);
}

export async function getAvailableMoves(gameId: string, position: Position) {
    const data = await queryGameData(gameId);
    if (!data) throw new Error('Game not found');
    const piece = data.board.get(position);
    if (!piece) throw new Error('No piece found at position');

    const [iCol, iRow] = indexFromPosition(position);
    const offsets = [
        piece.piece === 'king' || piece.player == 'red' ? [1, 1] : undefined,
        piece.piece === 'king' || piece.player == 'red' ? [1, -1] : undefined,
        piece.piece === 'king' || piece.player == 'black' ? [-1, 1] : undefined,
        piece.piece === 'king' || piece.player == 'black' ? [-1, -1] : undefined,
    ].filter((v) => !!v) as [number, number][];
    const testPositions = offsets
        .map(([colOffset, rowOffset]) => {
            const testPosition = toPosition(iCol + colOffset, iRow + rowOffset);
            return testPosition
                ? {
                      testPosition,
                      colOffset,
                      rowOffset,
                  }
                : undefined;
        })
        .filter((v) => !!v);
    const availableMoves: AvailableMoves = new Map();
    testPositions.forEach(({ testPosition, rowOffset, colOffset }) => {
        const testPiece = data.board.get(testPosition);
        if (testPiece) {
            if (testPiece.player !== piece.player) {
                const endingPosition = toPosition(iCol + colOffset * 2, iRow + rowOffset * 2);
                if (!endingPosition) return;
                const endingPiece = data.board.get(endingPosition);
                if (!endingPiece) {
                    availableMoves.set(testPosition, 'capture');
                }
            }
        } else {
            availableMoves.set(testPosition, 'move');
        }
    });
    return availableMoves;
}

export async function movePiece(formData: FormData) {
    const gameIdInput = formData.get('gameId');
    if (!gameIdInput || typeof gameIdInput !== 'string') throw new Error('Invalid game ID');
    const fromPositionInput = formData.get('from');
    if (!fromPositionInput || typeof fromPositionInput !== 'string') throw new Error('Invalid from position');
    const toPositionInput = formData.get('to');
    if (!toPositionInput || typeof toPositionInput !== 'string') throw new Error('Invalid to position');
    const playerIdInput = formData.get('playerId');
    if (!playerIdInput || typeof playerIdInput !== 'string') throw new Error('Invalid player ID');

    const data = await queryGameData(gameIdInput);
    if (!data) throw new Error('Game not found');

    const piece = data.board.get(fromPositionInput as Position);
    const moves = await getAvailableMoves(gameIdInput, fromPositionInput as Position);
    const moveType = moves.get(toPositionInput as Position);
    if (!piece || !moveType) throw new Error('Invalid move');

    const history = await db
        .insert(db.history)
        .values({
            pieceId: piece.pieceId,
            gameId: gameIdInput,
            type: moveType,
            to: toPositionInput as Position,
            from: fromPositionInput as Position,
        })
        .returning();
    refresh(gameIdInput);
}

export async function capturePiece(formData: FormData) {
    const gameIdInput = formData.get('gameId');
    if (!gameIdInput || typeof gameIdInput !== 'string') throw new Error('Invalid game ID');
    const fromPositionInput = formData.get('from');
    if (!fromPositionInput || typeof fromPositionInput !== 'string') throw new Error('Invalid from position');
    const toPositionInput = formData.get('to');
    if (!toPositionInput || typeof toPositionInput !== 'string') throw new Error('Invalid to position');
    const playerIdInput = formData.get('playerId');
    if (!playerIdInput || typeof playerIdInput !== 'string') throw new Error('Invalid player ID');

    const data = await queryGameData(gameIdInput);
    if (!data) throw new Error('Game not found');

    const piece = data.board.get(fromPositionInput as Position);
    const moves = await getAvailableMoves(gameIdInput, fromPositionInput as Position);
    const moveType = moves.get(toPositionInput as Position);
    if (!piece || !moveType) throw new Error('Invalid move');

    const history = await db
        .insert(db.history)
        .values({
            pieceId: piece.pieceId,
            gameId: gameIdInput,
            type: moveType,
            to: toPositionInput as Position,
            from: fromPositionInput as Position,
        })
        .returning();
    refresh(gameIdInput);
}
