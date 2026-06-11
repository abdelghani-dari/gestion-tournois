import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import Badge from "../../components/ui/Badge";
import ProgressLine from "../../components/common/ProgressLine";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import adminAvatar from "../../data/botola-pro-logo.png";

const ADMIN = { name: "Admin", email: "admin@gestion-tournois.ma", role: "admin" };

export default function ProfilePage() {
  const t = useThemeTokens();

  return (
    <>
      <XPageMeta title="Mon Profil" description="Profil administrateur" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Profil" desc="Compte administrateur">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border p-3" style={{ borderColor: "inherit" }}>
                <img src={adminAvatar} alt="Admin" className="h-full w-full object-contain" />
              </div>
              <h2 className={clsx("mt-4 text-lg font-semibold", t.textPrimary)}>{ADMIN.name}</h2>
              <p className={clsx("text-sm", t.textSecondary)}>{ADMIN.email}</p>
              <Badge color="primary">{ADMIN.role}</Badge>
            </div>
            <div className={clsx("mt-6 border-t pt-4", t.border)}>
              <ProgressLine value={85} label="Profil complété" size="sm" />
            </div>
          </ComponentCard>

          <ComponentCard title="Informations" desc="Modifier vos données" className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom complet</label>
                <input defaultValue={ADMIN.name} className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Email</label>
                <input defaultValue={ADMIN.email} type="email" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
              <Button>Enregistrer les modifications</Button>
            </div>
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
