import { Link } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import ChampionshipDashboard from "../../components/championships/ChampionshipDashboard";
import StatusBadge from "../../components/common/StatusBadge";
import Badge from "../../components/ui/Badge";
import { useSeasonData } from "../../components/context/SeasonContext";
import type { Championship } from "../../components/types";
import { PlusIcon } from "../../icons";

export default function ChampionshipsPage() {
  const { championships, getSeasonById } = useSeasonData();
  const multiple = championships.length > 1;

  const columns = [
    {
      key: "name",
      header: "Championnat",
      render: (c: Championship) => (
        <Link to={`/championships/${c.id}`} className="font-medium text-brand-500 hover:text-brand-400">
          {c.name}
        </Link>
      ),
    },
    {
      key: "season",
      header: "Saison",
      render: (c: Championship) => (
        <Badge color="primary">{getSeasonById(c.season_id)?.name ?? "—"}</Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (c: Championship) => (
        <span className="max-w-xs truncate opacity-70">{c.description}</span>
      ),
    },
    { key: "status", header: "Statut", render: (c: Championship) => <StatusBadge status={c.status} /> },
    {
      key: "ranking",
      header: "Classement",
      render: (c: Championship) => (
        <Link to={`/championships/${c.id}/ranking`} className="text-xs text-brand-500 hover:text-brand-400">
          Voir →
        </Link>
      ),
    },
  ];

  return (
    <>
      <XPageMeta title="Championnats" description="Liste des championnats" />
      <PageStack>
        <ChampionshipDashboard
          showSelector={multiple}
          action={
            <Button className="gap-2">
              <PlusIcon className="size-4 shrink-0" />
              <span>Créer</span>
            </Button>
          }
        />

        {multiple && <DataTable columns={columns} data={championships} />}
      </PageStack>
    </>
  );
}
