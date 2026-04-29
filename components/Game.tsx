import { PlayProvider } from '@/lib/play-context';
import PlayGame from './PlayGame';

export default function Game() {
  return (
    <PlayProvider>
      <PlayGame />
    </PlayProvider>
  );
}
