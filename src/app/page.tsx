import { Board } from '~/components/game/board';

export default function Home() {
  const theme = 'theme-oceanic'; // theme-oceanic // theme-berry // theme-forest
  return (
    <div className={theme}>
      <Board />
    </div>
  );
}

export const dynamic = 'force-dynamic';
