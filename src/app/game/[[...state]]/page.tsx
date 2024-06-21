import * as crypto from '~/lib/crypto'
import Link from 'next/link'
import { Circle } from 'lucide-react'
import { ComponentProps, PropsWithChildren } from 'react'
import { cn } from '~/lib/utils'
import { cols, Position, rows, toPosition } from '~/lib/position'

type Player = 'red' | 'black'

type GameHistoryDefinition = {
    start: { position: Position; state: SquareState }
    move: { from: Position; to: Position }
}
export type GameHistory<TType extends keyof GameHistoryDefinition> = GameHistoryDefinition[TType] & { type: TType }
export type AnyGameHistory = GameHistory<keyof GameHistoryDefinition>

export type SquareState = {
    player?: Player
    content?: undefined | JSX.Element
}

const ButtonLink = ({
    children,
    ...props
}: ComponentProps<'button'> &
    Omit<ComponentProps<typeof Link>, 'href'> &
    Partial<Pick<ComponentProps<typeof Link>, 'href'>>) =>
    !props.disabled && props.href ? (
        <Link {...props} href={props.href}>
            <button {...props}>{children}</button>
        </Link>
    ) : (
        <button {...props}>{children}</button>
    )

class GameState {
    private static delimiter = '||'
    public board: Map<Position, SquareState>
    private activePosition: Position | undefined
    private serialized: string | undefined

    constructor(private history: GameHistory<'start'>[] = []) {
        this.board = new Map(history.map((move) => [move.position, move.state]))
    }

    toString() {
        return JSON.stringify({
            history: this.history,
            activePosition: this.activePosition,
        })
    }

    get currentTurn(): Player {
        return this.history.length % 2 === 0 ? 'red' : 'black'
    }

    static deserializeSync(serialized: string): GameState {
        const plaintext = crypto.decode(decodeURI(serialized))
        return new GameState(JSON.parse(plaintext).history)
    }

    static async deserialize(serialized: string): Promise<GameState> {
        console.log('deserialize', { serialized })
        return new Promise((resolve, reject) => {
            resolve(this.deserializeSync(serialized))
        })
    }

    serialize(): string {
        const ciphertext = crypto.encode(this.toString())
        return encodeURI(ciphertext)
    }

    setActivePosition(position: Position, mutate = false) {
        const t = mutate ? this : new GameState(this.history)
        t.activePosition = position
        return t
    }
}

const HeaderTile = ({ children }: PropsWithChildren<{}>) => (
    <div className="content-center p-4 text-center">{children}</div>
)

function Board({ game }: { game: GameState }) {
    return (
        <main className="min-w-[500px] max-w-4xl p-8">
            <span className="space-x-1 text-lg font-semibold tracking-wide">
                It is{' '}
                <span
                    className={cn(
                        'font-bold uppercase',
                        game.currentTurn === 'red' ? 'text-red-500' : 'text-neutral-400',
                    )}
                >
                    {game.currentTurn}
                </span>
                &apos;s turn
            </span>
            {/*<div className="grid-cols-[200px_repeat(8, 1fr))] grid-rows-[200px_repeat(8, 1fr))] grid h-[500px] w-[500px]">*/}
            <div className="grid-cols-checkerboard grid-rows-checkerboard grid aspect-square items-center justify-center align-middle">
                <div></div>
                {cols.map((col) => (
                    <HeaderTile key={col}>{col}</HeaderTile>
                ))}
                {rows.map((row, iRow) => {
                    return cols.map((col, iCol) => {
                        const position = toPosition(iCol, iRow)
                        const state = game.board.get(position)
                        return (
                            <>
                                {iCol === 0 && (
                                    <div key={row} className="content-center p-4 text-center">
                                        {row}
                                    </div>
                                )}
                                <div
                                    key={`${row}${col}`}
                                    className={cn(
                                        'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
                                        (iCol + iRow) % 2 === 0 && 'bg-amber-200',
                                        (iCol + iRow) % 2 !== 0 && 'bg-amber-500',
                                    )}
                                >
                                    {state?.content ? (
                                        <>
                                            <button
                                                key={`${row}${col}`}
                                                className={cn(
                                                    'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
                                                    {
                                                        'enabled:bg-blue-100': (iCol + iRow) % 2 === 0,
                                                        'enabled:bg-blue-400': (iCol + iRow) % 2 !== 0,
                                                    },
                                                )}
                                                disabled={state?.player !== game.currentTurn}
                                            >
                                                {state?.content}
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </>
                        )
                    })
                })}
            </div>
        </main>
    )
}

const piece = (player: Player = 'red', type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' = 'pawn') => ({
    player,
    content: (
        <Circle
            size={48}
            className={cn(
                'rounded-full',
                player === 'black' && 'fill-neutral-500 stroke-neutral-700',
                player === 'red' && 'fill-red-500 stroke-red-600',
            )}
        />
    ),
})

const initialHistory: GameHistory<'start'>[] = [
    { type: 'start', position: 'a1', state: piece('red') },
    { type: 'start', position: 'b2', state: piece('red') },
    { type: 'start', position: 'a3', state: piece('red') },
    { type: 'start', position: 'b4', state: piece('red') },
    { type: 'start', position: 'a5', state: piece('red') },
    { type: 'start', position: 'b6', state: piece('red') },
    { type: 'start', position: 'a7', state: piece('red') },
    { type: 'start', position: 'b8', state: piece('red') },
    { type: 'start', position: 'g1', state: piece('black') },
    { type: 'start', position: 'h2', state: piece('black') },
    { type: 'start', position: 'g3', state: piece('black') },
    { type: 'start', position: 'h4', state: piece('black') },
    { type: 'start', position: 'g5', state: piece('black') },
    { type: 'start', position: 'h6', state: piece('black') },
    { type: 'start', position: 'g7', state: piece('black') },
    { type: 'start', position: 'h8', state: piece('black') },
]

export default async function Home(props: any) {
    const urlState = props.params?.state?.join('/')
    const game = urlState ? await GameState.deserialize(urlState) : new GameState(initialHistory)
    return <Board game={game} />
}
