import { Circle, CirclePlus } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';
import {
    AvailableMoves,
    cols,
    indexFromPosition,
    Player,
    PlayerPiece,
    Position,
    rows,
    toPosition,
} from '~/lib/game/common';
import { redirect } from 'next/navigation';
import { match, P } from 'ts-pattern';
import { GameData, getAvailableMoves, movePiece, queryGameData, undoMove } from '~/lib/game/actions';
import { LinkButton } from '~/components/LinkButton';

const ColHeader = ({ children }: PropsWithChildren) => <div className="content-center text-center">{children}</div>;
const RowHeader = ({ children }: PropsWithChildren) => <div className="content-center text-center">{children}</div>;

function Header(props: { currentPlayer: Player; gameId: string; scores: GameData['scores'] }) {
    return (
        <div className="flex w-full flex-row justify-between">
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
            <span className="flex flex-row gap-2">
                Scores:
                <span>
                    <span className="font-bold uppercase text-red-500">Red:</span> {props.scores.get('red') ?? 0}
                </span>
                <span>
                    <span className="font-bold uppercase text-neutral-500">Black:</span>{' '}
                    {props.scores.get('black') ?? 0}
                </span>
            </span>
            <span className="flew-row flex gap-2">
                <form action={undoMove}>
                    <input type="hidden" name="gameId" value={props.gameId} />
                    <button>undo</button>
                </form>
                <form action={undoMove}>
                    <input type="hidden" name="gameId" value={props.gameId} />
                    <button>redo</button>
                </form>
            </span>
        </div>
    );
}

function Piece({ piece, player }: PlayerPiece) {
    const Component = piece === 'pawn' ? Circle : CirclePlus;
    return (
        <Component
            size={48}
            className={cn(
                player === 'black' && 'fill-neutral-500 stroke-neutral-700',
                player === 'red' && 'fill-red-500 stroke-red-600',
            )}
        />
    );
}

function AvailableMove({
    children,
    position,
    activePosition,
    gameId,
    currentPlayer,
}: PropsWithChildren<{
    currentPlayer: Player;
    position: Position;
    activePosition: Position;
    gameId: string;
}>) {
    return (
        <form action={movePiece} className={cn('flex h-full w-full items-center justify-center', 'bg-green-400')}>
            <input type="hidden" name="from" value={activePosition} />
            <input type="hidden" name="to" value={position} />
            <input type="hidden" name="gameId" value={gameId} />
            <input type="hidden" name="playerId" value={currentPlayer} />
            <button className="flex h-full w-full items-center justify-center hover:bg-green-500">{children}</button>
        </form>
    );
}

function AvailableCapture({
    children,
    position,
    activePosition,
    gameId,
    currentPlayer,
}: PropsWithChildren<{
    currentPlayer: Player;
    position: Position;
    activePosition: Position;
    gameId: string;
}>) {
    return (
        <form action={movePiece} className={cn('flex h-full w-full items-center justify-center', 'bg-red-400')}>
            <input type="hidden" name="from" value={activePosition} />
            <input type="hidden" name="to" value={position} />
            <input type="hidden" name="gameId" value={gameId} />
            <input type="hidden" name="playerId" value={currentPlayer} />
            <button className="flex h-full w-full items-center justify-center hover:bg-red-500">{children}</button>
        </form>
    );
}

function BasicTile({ children, position }: PropsWithChildren<{ position: Position }>) {
    const [iCol, iRow] = indexFromPosition(position);
    return (
        <div
            className={cn(
                'flex h-full w-full items-center justify-center hover:enabled:bg-blue-500',
                (iCol + iRow) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-500',
            )}
        >
            {children}
        </div>
    );
}

function PlayerTile({
    children,
    href,
}: PropsWithChildren<{
    href: string;
}>) {
    return (
        <LinkButton
            href={href}
            className="flex h-full w-full items-center justify-center bg-blue-400 hover:enabled:bg-blue-500"
        >
            {children}
        </LinkButton>
    );
}

function Board({
    activePosition,
    availableMoves,
    board,
    currentPlayer,
    gameId,
    scores,
}: Readonly<
    GameData & {
        activePosition: Position | undefined;
        availableMoves?: AvailableMoves;
    }
>) {
    const setActivePosition = (position: Position) => {
        if (activePosition === position) return `/game/${gameId}`;
        return `/game/${gameId}?activePosition=${position}`;
    };
    return (
        <main className="min-w-[500px] max-w-4xl">
            <Header currentPlayer={currentPlayer} gameId={gameId} scores={scores} />
            <div className="grid aspect-square grid-cols-checkerboard grid-rows-checkerboard items-center justify-center align-middle font-semibold capitalize">
                <div></div>
                {cols.map((col) => (
                    <ColHeader key={col}>{col}</ColHeader>
                ))}
                {rows.map((row, iRow) =>
                    cols.map((col, iCol) => {
                        const position = toPosition(iCol, iRow);
                        if (!position) return null;
                        const currentPiece = board.get(position);
                        return (
                            <>
                                {iCol === 0 ? <RowHeader key={row}>{row}</RowHeader> : null}
                                {match({
                                    currentPiece,
                                    position,
                                    currentPlayer,
                                    activePosition,
                                    availableMoves,
                                    gameId,
                                    isAvailable: availableMoves?.has(position),
                                })
                                    .with(
                                        {
                                            isAvailable: true,
                                            currentPiece: P.nullish,
                                            activePosition: P.not(P.nullish),
                                        },
                                        (state) => <AvailableMove {...state} />,
                                    )
                                    .with(
                                        {
                                            isAvailable: true,
                                            currentPiece: { player: P.not(P.union([P.nullish, currentPlayer])) },
                                            activePosition: P.not(P.nullish),
                                        },
                                        (state) => (
                                            <AvailableCapture {...state}>
                                                <Piece {...state} {...state.currentPiece} />
                                            </AvailableCapture>
                                        ),
                                    )
                                    .with(
                                        P.union(
                                            { activePosition: position, currentPiece: P.not(P.nullish) },
                                            { activePosition: P.nullish, currentPiece: { player: currentPlayer } },
                                        ),
                                        (state) => (
                                            <PlayerTile {...state} href={setActivePosition(position)}>
                                                <Piece {...state} {...state.currentPiece} />
                                            </PlayerTile>
                                        ),
                                    )
                                    .otherwise(() => (
                                        <BasicTile position={position}>
                                            {currentPiece ? <Piece {...currentPiece} /> : null}
                                        </BasicTile>
                                    ))}
                            </>
                        );
                    }),
                )}
            </div>
        </main>
    );
}

export default async function Home(props: any) {
    const searchParams = new URLSearchParams(props?.searchParams);
    const activePosition = searchParams.get('activePosition') as Position | undefined;
    const gameId = props?.params?.gameId;
    if (!gameId) return redirect('/game');
    const data = await queryGameData(gameId);
    if (!data) return redirect('/game');
    const availableMoves: AvailableMoves | undefined = activePosition
        ? await getAvailableMoves(gameId, activePosition)
        : undefined;
    return <Board {...data} activePosition={activePosition} availableMoves={availableMoves} />;
}
