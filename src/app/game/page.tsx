'use client'

import { newGame } from '~/lib/game/server'

export default function GamePage(props: any) {
    return (
        <form action={newGame}>
            <button type="submit">New Game</button>
        </form>
    )
}
