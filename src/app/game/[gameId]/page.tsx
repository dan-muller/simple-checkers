import Link from 'next/link'
import { Circle } from 'lucide-react'
import { ComponentProps, FC, PropsWithChildren } from 'react'
import { cn } from '~/lib/utils'
import {
    PieceState,
    cols,
    GameHistory,
    Player,
    Position,
    rows,
    toPosition,
    indexFromPosition,
    AnyGameHistory,
} from '~/lib/game/common'
import { db } from '~/database'
import { notFound } from 'next/navigation'

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

type FCWC<P = any> = FC<PropsWithChildren<P>>

const ColHeader: FCWC = ({ children }) => <div className="content-center text-center">{children}</div>
const RowHeader: FCWC = ({ children }) => <div className="content-center text-center">{children}</div>

function Header(props: { currentPlayer: Player }) {
    return (
        <span className="space-x-1 text-lg font-semibold tracking-wide">
            It is{' '}
            <span
                className={cn(
                    'font-bold uppercase',
                    props.currentPlayer === 'red' ? 'text-red-500' : 'text-neutral-400',
                )}
            >
                {props.currentPlayer}
            </span>
            &apos;s turn
        </span>
    )
}

function ATile(
    props: PropsWithChildren<{
        gameId: string
        state: PieceState | undefined
        position: Position
        isActive?: boolean
        isAvailable?: boolean
        currentPlayer: Player
    }>,
) {
    // (activePosition && activePosition !== position && availableMoves && !availableMoves.has(position)) ||
    // state?.player !== currentPlayer
    const content = <></>
    return (
        <ButtonLink
            href={props.isActive ? `/game/${props.gameId}` : `/game/${props.gameId}?activePosition=${props.position}`}
            key={`${props.position}`}
            className={cn(
                'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
                props.isActive ? 'enabled:bg-blue-300' : 'enabled:bg-blue-400',
            )}
            disabled={!props.isActive && !props.isAvailable}
        >
            {content}
        </ButtonLink>
    )
}
function Tile({
    state,
    activePosition,
    availableMoves,
    currentPlayer,
    href,
    position,
    children,
}: PropsWithChildren<{
    position: Position
    href: string
    currentPlayer: Player
    state: PieceState | undefined
    availableMoves?: Set<Position>
    activePosition?: Position
}>) {
    const [iCol, iRow] = indexFromPosition(position)
    let enabled = state?.player === currentPlayer
    if (activePosition) enabled = activePosition === position
    if (availableMoves) enabled = enabled || availableMoves.has(position)
    return (
        <ButtonLink
            disabled={!enabled}
            href={href}
            className={cn(
                'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
                (iCol + iRow) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-500',
                activePosition !== position
                    ? state?.player === currentPlayer && 'enabled:bg-blue-400'
                    : 'enabled:bg-blue-400',
                availableMoves?.has(position) && 'enabled:bg-green-300',
                availableMoves?.has(position) && state?.player !== currentPlayer && 'enabled:bg-red-300',
            )}
        >
            {children}
        </ButtonLink>
    )
}
function Piece({ piece, player }: PieceState) {
    return (
        <Circle
            size={48}
            className={cn(
                'rounded-full',
                player === 'black' && 'fill-neutral-500 stroke-neutral-700',
                player === 'red' && 'fill-red-500 stroke-red-600',
            )}
        />
    )
}

function Board({
    board,
    history,
    gameId,
    activePosition,
    availableMoves,
}: {
    activePosition: Position | undefined
    gameId: string
    board: Map<Position, PieceState>
    history: GameHistory[]
    availableMoves?: Set<Position>
}) {
    const currentPlayer = history.length % 2 === 0 ? 'red' : 'black'
    const setActivePosition = (position: Position) => {
        if (activePosition === position) return `/game/${gameId}`
        return `/game/${gameId}?activePosition=${position}`
    }
    return (
        <main className="min-w-[500px] max-w-4xl p-8">
            <Header currentPlayer={currentPlayer} />
            <div className="grid aspect-square grid-cols-checkerboard grid-rows-checkerboard items-center justify-center align-middle font-semibold capitalize">
                <div></div>
                {cols.map((col) => (
                    <ColHeader key={col}>{col}</ColHeader>
                ))}
                {rows.map((row, iRow) => {
                    return cols.map((col, iCol) => {
                        const position = toPosition(iCol, iRow)
                        const state = board.get(position)
                        return (
                            <>
                                {iCol === 0 ? <RowHeader key={row}>{row}</RowHeader> : null}
                                <Tile
                                    href={setActivePosition(position)}
                                    key={`${position}`}
                                    position={position}
                                    state={state}
                                    currentPlayer={currentPlayer}
                                    availableMoves={availableMoves}
                                    activePosition={activePosition}
                                    // isActive={activePosition === position}
                                    // isAvailable={availableMoves?.has(position) ?? false}
                                    // highlightAvailable={!activePosition && activePosition !== position}
                                    // isThreat={!!state?.player && state?.player !== currentPlayer}
                                >
                                    {state ? <Piece {...state} /> : null}
                                </Tile>
                            </>
                        )
                    })
                })}
            </div>
        </main>
    )
}

// (
//     <>
//         {iCol === 0 ? <RowHeader key={row}>{row}</RowHeader> : null}
//         <div
//             key={`${row}${col}`}
//             className={cn(
//                 'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
//                 !availableMoves?.has(position)
//                     ? {
//                         'bg-amber-200': (iCol + iRow) % 2 === 0,
//                         'bg-amber-500': (iCol + iRow) % 2 !== 0,
//                     }
//                     : {
//                         'bg-green-200': (iCol + iRow) % 2 === 0,
//                         'bg-green-500': (iCol + iRow) % 2 !== 0,
//                     },
//             )}
//         >
//             <Tile
//                 gameId={gameId}
//                 position={position}
//                 currentPlayer={currentPlayer}
//                 state={state}
//                 isActive={activePosition === position}
//                 isAvailable={availableMoves?.has(position)}
//             />
//         </div>
//     </>
// )

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

const getGameData = async (gameId: string) => {
    const gameData = await db.query.game.findFirst({
        where: (game, { eq }) => eq(game.id, gameId),
        with: { history: { with: { piece: true } } },
    })
    if (!gameData) return null
    const history: GameHistory[] = gameData.history.map((hist) => ({
        ...hist,
        player: hist.piece.playerId as Player,
        piece: hist.piece.type,
    }))
    const init = history.filter((move) => move.type === 'init') as GameHistory<'init'>[]
    const moves = history.filter((move) => move.type === 'move') as GameHistory<'move'>[]
    const board = new Map<Position, PieceState>(init.map((move) => [move.to as Position, move]))
    moves.forEach((move) => {
        board.set(move.to as Position, board.get(move.from as Position)!)
        board.delete(move.from as Position)
    })
    return { board, history }
}
// content: (
//     <Circle
//         size={48}
//         className={cn(
//             'rounded-full',
//             move.player === 'black' && 'fill-neutral-500 stroke-neutral-700',
//             move.player === 'red' && 'fill-red-500 stroke-red-600',
//         )}
//     />
// ),
export default async function Home(props: any) {
    const searchParams = new URLSearchParams(props?.searchParams)
    const activePosition = searchParams.get('activePosition') as Position | undefined
    const gameId = props?.params?.gameId
    if (!gameId) return notFound()
    const data = await getGameData(gameId)
    if (!data) return notFound()
    const availableMoves = activePosition ? new Set<Position>(['g7']) : undefined
    return (
        <Board
            board={data.board}
            history={data.history}
            gameId={gameId}
            activePosition={activePosition}
            availableMoves={availableMoves}
        />
    )
}
