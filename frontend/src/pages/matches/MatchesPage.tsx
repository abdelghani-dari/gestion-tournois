import { useState, useMemo } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import Button from "../../components/common/Button";
import FilterTabs from "../../components/common/FilterTabs";
import MatchRowList from "../../components/matches/MatchRowList";
import { useSeasonData } from "../../components/context/SeasonContext";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { PlusIcon } from "../../icons";

export default function MatchesPage() {
  const t = useThemeTokens();
  const { matches } = useSeasonData();
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      all: matches.length,
      scheduled: matches.filter((m) => m.status === "scheduled").length,
      completed: matches.filter((m) => m.status === "completed").length,
      live: matches.filter((m) => m.status === "live").length,
    }),
    [matches]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return matches;
    return matches.filter((m) => m.status === filter);
  }, [filter, matches]);

  return (
    <>
      <XPageMeta title="Matchs" description="Liste des matchs" />
      <PageStack>
        <SectionBar
          action={
            <Link to="/matches/create">
              <Button className="gap-2">
                <PlusIcon className="size-4 shrink-0" />
                <span>Planifier</span>
              </Button>
            </Link>
          }
        >
          <FilterTabs
            tabs={[
              { id: "all", label: "Tous", count: counts.all },
              { id: "scheduled", label: "Programmés", count: counts.scheduled },
              { id: "completed", label: "Terminés", count: counts.completed },
              { id: "live", label: "En direct", count: counts.live },
            ]}
            active={filter}
            onChange={setFilter}
          />
        </SectionBar>

        {filtered.length > 0 ? (
          <MatchRowList matches={filtered} />
        ) : (
          <p className={clsx("py-12 text-center text-sm", t.textMuted)}>
            Aucun match dans cette catégorie.
          </p>
        )}
      </PageStack>
    </>
  );
}
