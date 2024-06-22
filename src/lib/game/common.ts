import { db } from '~/database'

// Keep the definitions or numerals and letters separate from rows and cols so that it is easier to change the orientation of the board
const numerals = ['1', '2', '3', '4', '5', '6', '7', '8'] as const
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

// Define Rows and Columns as the union of the respective arrays
export const rows = numerals.toReversed()
export const cols = letters
export type Row = (typeof rows)[number]
export type Column = (typeof cols)[number]
export type Position = `${Column}${Row}`

export const toPosition = (...[col, row]: [col: number, row: number] | [col: Column, row: Row]): Position =>
    typeof col === 'number' ? `${cols[col]}${rows[row]}` : (`${col}${row}` as Position)

export const splitFromPosition = (position: Position): [col: Column, row: Row] => [
    position[0] as Column,
    position[1] as Row,
]

export const indexFromPosition = (position: Position): [col: number, row: number] => {
    const [col, row] = splitFromPosition(position)
    return [cols.indexOf(col), rows.indexOf(row)]
}

export type Player = 'red' | 'black'
export type PieceType = 'pawn' | 'king'

type GameHistoryDefinition = {
    init: { player: Player; piece: PieceType; to: Position }
    move: { from: Position; to: Position }
}
export type GameHistoryType = keyof GameHistoryDefinition
export type GameHistory<TType extends GameHistoryType = GameHistoryType> = GameHistoryDefinition[TType] & {
    type: TType
}

export type PieceState = { player: Player; piece: PieceType }
