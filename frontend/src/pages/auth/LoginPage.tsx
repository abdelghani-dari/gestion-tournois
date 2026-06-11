import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import { ShootingStarIcon, EnvelopeIcon, LockIcon } from "../../icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <>
      <XPageMeta title="Connexion" description="Connectez-vous à Gestion Tournois" />
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/x" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20">
                <ShootingStarIcon className="size-5 text-brand-400" />
              </div>
              <span className="text-lg font-semibold text-white">Gestion Tournois</span>
            </Link>
          </div>

          <GlassCard padding="lg">
            <h1 className="text-xl font-semibold text-white">Connexion</h1>
            <p className="mt-1 text-sm text-slate-400">
              Accédez à votre espace de gestion sportive
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-slate-400">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gestion-tournois.ma"
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
                    placeholder="••••••••"
                    className="w-full rounded-sm border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
          </GlassCard>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/x" className="text-brand-400 hover:text-brand-300">
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
