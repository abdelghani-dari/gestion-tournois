import { useState } from "react";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import DataTable from "../../components/common/DataTable";
import ComponentCard from "../../components/common/ComponentCard";
import SectionBar from "../../components/common/SectionBar";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import GlassCard from "../../components/common/GlassCard";
import XModal from "../../components/common/XModal";
import Badge from "../../components/ui/Badge";
import ProgressLine from "../../components/common/ProgressLine";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useSeasonData } from "../../components/context/SeasonContext";
import type { Season } from "../../components/types";
import { PlusIcon, PencilIcon, TrashBinIcon, CalenderIcon } from "../../icons";

export default function SeasonsPage() {
  const t = useThemeTokens();
  const { seasons, formatDate } = useSeasonData();
  const [showModal, setShowModal] = useState(false);
  const active = seasons.filter((s) => s.status === "active").length;

  const columns = [
    { key: "name", header: "Nom", render: (s: Season) => <span className={clsx("font-medium", t.textPrimary)}>{s.name}</span> },
    { key: "start", header: "Début", render: (s: Season) => formatDate(s.start_date) },
    { key: "end", header: "Fin", render: (s: Season) => formatDate(s.end_date) },
    { key: "status", header: "Statut", render: (s: Season) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <div className="flex gap-2">
          <button className={clsx("hover:text-brand-500", t.textMuted)}><PencilIcon className="size-4" /></button>
          <button className={clsx("hover:text-red-400", t.textMuted)}><TrashBinIcon className="size-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <XPageMeta title="Saisons" description="Gestion des saisons sportives" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <GlassCard className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-violet-500/15 text-violet-400">
              <CalenderIcon className="size-6" />
            </div>
            <div>
              <p className={clsx("text-sm", t.textSecondary)}>Total saisons</p>
              <p className={clsx("text-2xl font-bold", t.textPrimary)}>{seasons.length}</p>
            </div>
            <span className="ml-auto"><Badge color="success">{active} active</Badge></span>
          </GlassCard>

          <ComponentCard title="Progression" desc="Saison 2025-2026" className="lg:col-span-2">
            <ProgressLine
              value={68}
              label="Saison complétée"
              sublabel="22 / 30 journées jouées"
            />
          </ComponentCard>
        </div>

        <SectionBar
          action={
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <PlusIcon className="size-4 shrink-0" />
              <span>Ajouter</span>
            </Button>
          }
        />
        <DataTable columns={columns} data={seasons} />
      </PageStack>

      <XModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle saison"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={() => setShowModal(false)}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-3">
          <input placeholder="Nom de la saison" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
          <input type="date" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
          <input type="date" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
        </div>
      </XModal>
    </>
  );
}
