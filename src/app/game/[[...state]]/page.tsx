import * as crypto from '~/lib/crypto'
import Link from 'next/link'
import { Circle } from 'lucide-react'
import { ComponentProps } from 'react'
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

function Board({ game }: { game: GameState }) {
    return (
        <main>
            Current player: {game.currentTurn}
            <div className="flex h-fit w-fit flex-col gap-1 border-neutral-600 bg-neutral-700 p-1">
                {cols.map((col, iCol) => {
                    return (
                        <div key={col} className="flex gap-1">
                            {rows.map((row, iRow) => {
                                const position = toPosition(iRow, iCol)
                                const state = game.board.get(position)
                                return (
                                    <ButtonLink
                                        href={`/game/${game.setActivePosition(position).serialize()}`}
                                        key={`${col}`}
                                        className={cn('h-24 w-24 hover:enabled:bg-blue-500', {
                                            'bg-amber-500 enabled:bg-blue-300': (iRow + iCol) % 2 === 0,
                                            'bg-amber-200 enabled:bg-blue-100': (iRow + iCol) % 2 !== 0,
                                        })}
                                        disabled={state?.player !== game.currentTurn}
                                    >
                                        <div className="flex w-full justify-center">{state?.content}</div>
                                    </ButtonLink>
                                )
                            })}
                        </div>
                    )
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

export default async function Home(props: any) {
    const urlState = props.params?.state?.join('/')
    const game = urlState
        ? await GameState.deserialize(urlState)
        : new GameState([
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
          ])
    return <Board game={game} />
}
