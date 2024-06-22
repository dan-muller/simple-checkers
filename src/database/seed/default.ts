import { db } from '~/database'

console.log('Starting default seed...')

console.log('Inserting players...')
const players = await db
    .insert(db.player)
    .values([{ id: 'red' }, { id: 'black' }])
    .onConflictDoNothing()
    .returning()

console.log(JSON.stringify({ message: 'Finished default seed.', players }, null, 2))
