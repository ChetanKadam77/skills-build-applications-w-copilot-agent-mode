import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<Ranking>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      collection="leaderboard"
      emptyMessage="No leaderboard rankings yet."
      renderItem={(ranking) => <><strong>#{ranking.rank} {ranking.teamName}</strong>: {ranking.totalPoints} points</>}
    />
  );
}
