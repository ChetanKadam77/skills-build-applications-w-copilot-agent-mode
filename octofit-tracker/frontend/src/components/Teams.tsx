import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      collection="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => <><strong>{team.name}</strong> ({team.members.length} members)</>}
    />
  );
}
