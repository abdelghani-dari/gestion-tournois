import { Link } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import Button from "../../components/common/Button";

export default function NotFoundPage() {
  return (
    <>
      <XPageMeta title="404" description="Page introuvable" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <h1 className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-gradient-to-b from-white/90 to-white/10 bg-clip-text drop-shadow-[0_0_60px_rgba(70,95,255,0.4)] md:text-[180px]">
            404
          </h1>
          <p className="mt-4 text-xl font-medium text-white md:text-2xl">
            Page introuvable
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/dashboard">
              <Button>Retour au dashboard</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
