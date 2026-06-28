import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AppLogo from "../../components/common/AppLogo";
import AuthTournamentVisual from "../../components/common/AuthTournamentVisual";
import { XPageMeta } from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronLeftIcon,
  EnvelopeIcon,
  EyeCloseIcon,
  EyeIcon,
  LockIcon,
  UserIcon,
} from "../../icons";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-300">
      {children} <span className="text-error-500">*</span>
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-md border border-white/[0.08] bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-60";

const passwordInputClassName =
  "h-11 w-full rounded-md border border-white/[0.08] bg-white/[0.04] py-2.5 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(
    location.pathname.includes("signup") ? "register" : "login",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setStatus("loading");

    try {
      if (mode === "register") {
        const registerMessage = await register(name, email, password, passwordConfirmation);
        setStatus("success");
        setMessage(registerMessage);
        setPassword("");
        setPasswordConfirmation("");
        return;
      }

      await login(email, password);
      setStatus("success");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Authentification impossible.");
    }
  };

  const fillCredentials = (nextEmail: string) => {
    setEmail(nextEmail);
    setPassword("password");
    setPasswordConfirmation("");
    setError("");
    setMessage("");
  };

  const switchTo = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPasswordConfirmation("");
  };

  return (
    <>
      <XPageMeta title={mode === "login" ? "Connexion" : "Inscription"} description="Gestion Tournois" />
      <div className="relative min-h-screen overflow-hidden bg-[#07111F] p-5 text-white sm:p-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_46%_80%,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="relative flex min-h-screen flex-col justify-center lg:flex-row">
          <div className="flex flex-1 flex-col lg:bg-slate-950/40">
            <div className="mx-auto flex w-full max-w-md items-center justify-between pt-4 sm:pt-10">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white"
              >
                <ChevronLeftIcon className="size-5" />
                Retour
              </Link>
              <AppLogo variant="compact" size="sm" />
            </div>

            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
              <div className="mb-8">
                <AppLogo size="lg" />
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#10B981]">
                  Espace tournoi
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                  {mode === "login" ? "Connexion" : "Inscription"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {mode === "login"
                    ? "Entrez votre email et votre mot de passe."
                    : "Créez un compte utilisateur. Il sera validé par un administrateur."}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {mode === "register" && (
                    <div>
                      <FieldLabel>Nom</FieldLabel>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-slate-500" />
                        <input
                          id="login-name"
                          name="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom"
                          required
                          disabled={status === "loading"}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-slate-500" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        disabled={status === "loading"}
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Mot de passe</FieldLabel>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-slate-500" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        disabled={status === "loading"}
                        className={passwordInputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-5 fill-slate-500 transition hover:fill-white" />
                        ) : (
                          <EyeCloseIcon className="size-5 fill-slate-500 transition hover:fill-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <FieldLabel>Confirmation</FieldLabel>
                      <div className="relative">
                        <LockIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-slate-500" />
                        <input
                          id="login-password-confirmation"
                          name="password_confirmation"
                          type={showPassword ? "text" : "password"}
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          placeholder="Confirmez le mot de passe"
                          required
                          disabled={status === "loading"}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md border border-error-500/20 bg-error-500/10 px-4 py-3 text-sm text-error-400">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="rounded-md border border-success-500/20 bg-success-500/10 px-4 py-3 text-sm text-success-400">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center rounded-md bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_42px_rgba(59,130,246,0.25)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading"
                      ? "Traitement..."
                      : mode === "login"
                        ? "Se connecter"
                        : "Créer le compte"}
                  </button>
                </div>
              </form>

              {mode === "login" && (
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("user@example.com")}
                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Compte utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@example.com")}
                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Compte admin
                  </button>
                </div>
              )}

              <p className="mt-5 text-center text-sm text-slate-400 sm:text-start">
                {mode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
                {mode === "login" ? (
                  <Link
                    to="/signup"
                    onClick={() => switchTo("register")}
                    className="font-medium text-[#10B981] hover:text-emerald-300"
                  >
                    Inscription
                  </Link>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => switchTo("login")}
                    className="font-medium text-[#10B981] hover:text-emerald-300"
                  >
                    Connexion
                  </Link>
                )}
              </p>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/2">
            <AuthTournamentVisual />
          </div>
        </div>
      </div>
    </>
  );
}
