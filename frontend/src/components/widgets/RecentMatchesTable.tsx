import MatchRowList from "../matches/MatchRowList";
import { useSeasonData } from "../context/SeasonContext";

interface RecentMatchesTableProps {
  limit?: number;
  fill?: boolean;
}

export default function RecentMatchesTable({ limit = 4, fill = false }: RecentMatchesTableProps) {
  const { matches } = useSeasonData();
  const recent = [...matches]
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, limit);

  return <MatchRowList matches={recent} compact fill={fill} />;
}
