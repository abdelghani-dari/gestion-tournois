import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import DataTable from "../../components/common/DataTable";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { users } from "../../components/data/mockData";
import adminAvatar from "../../data/botola-pro-logo.png";

const ADMIN = {
  name: "Admin",
  email: "admin@gestion-tournois.ma",
  role: "admin",
};
import type { User } from "../../components/types";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

export default function UsersPage() {
  const t = useThemeTokens();

  const columns = [
    {
      key: "user",
      header: "Utilisateur",
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar} size="medium" status={u.role === "admin" ? "online" : "offline"} />
          <span className={clsx("font-medium", t.textPrimary)}>{u.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u: User) => <span className={t.textSecondary}>{u.email}</span> },
    {
      key: "role",
      header: "Rôle",
      render: (u: User) => (
        <Badge color={u.role === "admin" ? "primary" : "light"}>{u.role}</Badge>
      ),
    },
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
      <XPageMeta title="Utilisateurs" description="Gestion des utilisateurs" />
      <PageStack>
        <SectionBar
          action={
            <Button className="gap-2">
              <PlusIcon className="size-4" /> Créer
            </Button>
          }
        />

        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Connecté" desc="Session active">
            <div className="flex items-center gap-4">
              <Avatar src={adminAvatar} size="xlarge" status="online" />
              <div>
                <p className={clsx("font-semibold", t.textPrimary)}>{ADMIN.name}</p>
                <p className={clsx("text-sm", t.textSecondary)}>{ADMIN.email}</p>
                <Badge color="primary">{ADMIN.role}</Badge>
              </div>
            </div>
          </ComponentCard>
          <div className="lg:col-span-2">
            <DataTable columns={columns} data={users} />
          </div>
        </div>
      </PageStack>
    </>
  );
}
