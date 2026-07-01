import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { ShootingStarIcon, EnvelopeIcon, LockIcon } from "../../icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      if (mode === "register") {
        await register(name, email, password, passwordConfirmation);
      } else {
        await login(email, password);
      }
      setStatus("success");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Authentification impossible.");
    }
  };

  const fillCredentials = (nextEmail: string) => {
    setMode("login");
    setEmail(nextEmail);
    setPassword("password");
    setPasswordConfirmation("");
    setError("");
  };

  return (
    <>
      <XPageMeta title="Connexion" description="Connectez-vous a Gestion Tournois" />
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20">
                <ShootingStarIcon className="size-5 text-brand-400" />
              </div>
              <span className="text-lg font-semibold text-white">Gestion Tournois</span>
            </Link>
          </div>

          <GlassCard padding="lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {mode === "login" ? "Connexion" : "Inscription"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {mode === "login"
                    ? "Accedez a votre espace de gestion sportive"
                    : "Creez un compte organisateur"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="rounded-sm border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                {mode === "login" ? "Inscription" : "Connexion"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    required
                    className="w-full rounded-sm border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm text-slate-400">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full rounded-sm border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-slate-400">Mot de passe</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                    className="w-full rounded-sm border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">Confirmation</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="password"
                      required
                      className="w-full rounded-sm border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              {status === "success" && (
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Connexion reussie.
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading"
                  ? "Connexion..."
                  : mode === "login"
                    ? "Se connecter"
                    : "Creer le compte"}
              </Button>
            </form>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => fillCredentials("user@example.com")}>
                Login as User
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fillCredentials("admin@example.com")}>
                Login as Admin
              </Button>
            </div>
          </GlassCard>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/" className="text-brand-400 hover:text-brand-300">
              Retour a l'accueil
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
