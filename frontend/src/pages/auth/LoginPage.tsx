import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronLeftIcon,
  EnvelopeIcon,
  EyeCloseIcon,
  EyeIcon,
  LockIcon,
  ShootingStarIcon,
  UserIcon,
} from "../../icons";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
      {children} <span className="text-error-500">*</span>
    </label>
  );
}

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      <div className="relative min-h-screen bg-white p-6 dark:bg-gray-900 sm:p-0">
        <div className="relative flex min-h-screen flex-col justify-center lg:flex-row">
          <div className="flex flex-1 flex-col">
            <div className="w-full max-w-md pt-4 sm:pt-10 mx-auto">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronLeftIcon className="size-5" />
                Retour
              </Link>
            </div>

            <div className="flex w-full max-w-md flex-1 flex-col justify-center mx-auto">
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                  {mode === "login" ? "Connexion" : "Inscription"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        <UserIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
                        <input
                          id="login-name"
                          name="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom"
                          required
                          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Mot de passe</FieldLabel>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-11 text-sm text-gray-800 placeholder:text-gray-400 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <FieldLabel>Confirmation</FieldLabel>
                      <div className="relative">
                        <LockIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
                        <input
                          id="login-password-confirmation"
                          name="password_confirmation"
                          type={showPassword ? "text" : "password"}
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          placeholder="Confirmez le mot de passe"
                          required
                          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg border border-error-500/20 bg-error-500/10 px-4 py-3 text-sm text-error-600 dark:text-error-400">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="rounded-lg border border-success-500/20 bg-success-500/10 px-4 py-3 text-sm text-success-700 dark:text-success-400">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Compte utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@example.com")}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Compte admin
                  </button>
                </div>
              )}

              <p className="mt-5 text-center text-sm text-gray-700 dark:text-gray-400 sm:text-start">
                {mode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
                {mode === "login" ? (
                  <Link
                    to="/signup"
                    onClick={() => switchTo("register")}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Inscription
                  </Link>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => switchTo("login")}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Connexion
                  </Link>
                )}
              </p>
            </div>
          </div>

          <div className="hidden w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <div className="relative z-1 flex max-w-sm flex-col items-center px-8 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                  <ShootingStarIcon className="size-7 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Gestion Tournois</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Les comptes utilisateurs restent en attente jusqu'à validation par un administrateur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
