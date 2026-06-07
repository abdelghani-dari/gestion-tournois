import { Outlet } from "react-router";

export default function XAppLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 p-4">
        <h2 className="font-bold mb-4">Tournoi Manager</h2>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard">Dashboard (WIP)</a>
          <a href="/tournaments">Tournaments</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}