import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ApiError, updatePassword } from "../../api";
import ComponentCard from "../../components/common/ComponentCard";
import { modalFormFooterClass } from "../../components/common/formStyles";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import PasswordInput from "../../components/common/PasswordInput";
import RoleBadge from "../../components/common/RoleBadge";
import UserAvatar from "../../components/common/UserAvatar";
import {
  accountRoleDescription,
  ACCOUNT_ROLE_COLORS,
  resolveAccountType,
} from "../../components/common/userRoleTheme";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const t = useThemeTokens();
  const { user, refreshMe } = useAuth();
  const displayUser = user ?? { name: "Invité", email: "Non connecté", role: "guest", avatar_url: null };
  const accountType = resolveAccountType(displayUser);
  const roleColors = ACCOUNT_ROLE_COLORS[accountType];

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.message);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Impossible de mettre à jour le mot de passe.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <XPageMeta title="Mon Profil" description="Profil utilisateur" />
      <PageStack>
        <div
          className={clsx("overflow-hidden rounded-md border", t.border)}
          style={{ background: `linear-gradient(135deg, ${roleColors.muted} 0%, transparent 55%)` }}
        >
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <UserAvatar
              user={displayUser}
              name={displayUser.name}
              showRoleRing
              className="mx-auto h-24 w-24 sm:mx-0"
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <RoleBadge user={displayUser} className="mb-3" />
              <h2 className={clsx("text-xl font-semibold", t.textPrimary)}>{displayUser.name}</h2>
              <p className={clsx("mt-1 text-sm", t.textSecondary)}>{displayUser.email}</p>
              <p className={clsx("mt-3 text-sm leading-relaxed", t.textSecondary)}>
                {accountRoleDescription(accountType)}
              </p>
            </div>
          </div>
        </div>

        <div className={clsx("grid grid-cols-1 lg:grid-cols-2", GRID_GAP)}>
          <ComponentCard title="Informations" desc="Données du compte">
            <div className="space-y-4">
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom complet</label>
                <input
                  value={displayUser.name}
                  readOnly
                  className={clsx(
                    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
                    t.border,
                    t.metricBg,
                    t.textPrimary,
                  )}
                />
              </div>
              <div>
                <label className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Email</label>
                <input
                  value={displayUser.email}
                  readOnly
                  type="email"
                  className={clsx(
                    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
                    t.border,
                    t.metricBg,
                    t.textPrimary,
                  )}
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Sécurité" desc="Modifier votre mot de passe">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <PasswordInput
                label="Mot de passe actuel"
                name="current_password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <PasswordInput
                label="Nouveau mot de passe"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <PasswordInput
                label="Confirmer le nouveau mot de passe"
                name="password_confirmation"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />

              {message && <p className="text-sm text-emerald-400">{message}</p>}
              {error && <p className="text-sm text-red-300">{error}</p>}

              <div className={modalFormFooterClass()}>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-sm bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
                </button>
              </div>
            </form>
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
