import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import Badge from "../../components/ui/Badge";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const t = useThemeTokens();
  const { user, loading } = useAuth();
  const displayUser = user ?? { name: "Invité", email: "Non connecté", role: "guest", avatar_url: null };

  return (
    <>
      <XPageMeta title="Mon Profil" description="Profil utilisateur" />
      <PageStack>
        <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
          <ComponentCard title="Profil" desc={loading ? "Chargement" : "Compte utilisateur"}>
            <div className="text-center">
              <EntityImage
                src={displayUser.avatar_url}
                name={displayUser.name}
                className={clsx("mx-auto h-24 w-24 rounded-xl text-2xl", t.border)}
              />
              <h2 className={clsx("mt-4 text-lg font-semibold", t.textPrimary)}>{displayUser.name}</h2>
              <p className={clsx("text-sm", t.textSecondary)}>{displayUser.email}</p>
              <Badge color={displayUser.role === "admin" ? "primary" : "light"}>{displayUser.role}</Badge>
            </div>
          </ComponentCard>

          <ComponentCard title="Informations" desc="Données du compte" className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom complet</label>
                <input value={displayUser.name} readOnly className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Email</label>
                <input value={displayUser.email} readOnly type="email" className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Rôle</label>
                <input value={displayUser.role} readOnly className={clsx("w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none", t.border, t.metricBg, t.textPrimary)} />
              </div>
            </div>
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
