import React, { useState, useMemo } from 'react';

// Structs for bracket simulator
interface Team {
  id: string;
  name: string;
  seed: number;
  logo: string;
}

const INITIAL_TEAMS: Team[] = [
  { id: 't1', name: 'Apex Legends', seed: 1, logo: '🏆' },
  { id: 't2', name: 'Shadow Wolves', seed: 8, logo: '🐺' },
  { id: 't3', name: 'Cyber Knights', seed: 4, logo: '⚔️' },
  { id: 't4', name: 'Neon Samurai', seed: 5, logo: '👹' },
  { id: 't5', name: 'Nova Titans', seed: 2, logo: '⚡' },
  { id: 't6', name: 'Vortex Esports', seed: 7, logo: '🌀' },
  { id: 't7', name: 'Echo Esports', seed: 3, logo: '🔊' },
  { id: 't8', name: 'Quantum Vipers', seed: 6, logo: '🐍' },
];

interface LandingPageProps {
  onNavigateToClassement: () => void;
}

export default function LandingPage({ onNavigateToClassement }: LandingPageProps) {
  // Bracket Simulator State
  const [qfWinners, setQfWinners] = useState<{ [key: string]: Team }>({});
  const [sfWinners, setSfWinners] = useState<{ [key: string]: Team }>({});
  const [champion, setChampion] = useState<Team | null>(null);
  
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const advanceTeam = (round: number, matchIndex: number, team: Team) => {
    if (round === 1) {
      const matchKey = `m${matchIndex}`;
      if (qfWinners[matchKey]?.id === team.id) return;
      setQfWinners({ ...qfWinners, [matchKey]: team });
      
      const sfMatchIndex = Math.floor(matchIndex / 2);
      const sfMatchKey = `m${sfMatchIndex}`;
      if (sfWinners[sfMatchKey]) {
        const newSfWinners = { ...sfWinners };
        delete newSfWinners[sfMatchKey];
        setSfWinners(newSfWinners);
        setChampion(null);
      }
    } else if (round === 2) {
      const matchKey = `m${matchIndex}`;
      const sourceMatch1 = `m${matchIndex * 2}`;
      const sourceMatch2 = `m${matchIndex * 2 + 1}`;
      if (!qfWinners[sourceMatch1] || !qfWinners[sourceMatch2]) return;
      if (sfWinners[matchKey]?.id === team.id) return;
      setSfWinners({ ...sfWinners, [matchKey]: team });
      setChampion(null);
    } else if (round === 3) {
      if (!sfWinners['m0'] || !sfWinners['m1']) return;
      setChampion(team);
    }
  };

  const resetBracket = () => {
    setQfWinners({});
    setSfWinners({});
    setChampion(null);
  };

  const qfMatches = useMemo(() => [
    { id: 'q1', t1: INITIAL_TEAMS[0], t2: INITIAL_TEAMS[1] },
    { id: 'q2', t1: INITIAL_TEAMS[2], t2: INITIAL_TEAMS[3] },
    { id: 'q3', t1: INITIAL_TEAMS[4], t2: INITIAL_TEAMS[5] },
    { id: 'q4', t1: INITIAL_TEAMS[6], t2: INITIAL_TEAMS[7] },
  ], []);

  const sfMatches = useMemo(() => [
    { id: 's1', t1: qfWinners['m0'] || null, t2: qfWinners['m1'] || null },
    { id: 's2', t1: qfWinners['m2'] || null, t2: qfWinners['m3'] || null },
  ], [qfWinners]);

  const finalMatch = useMemo(() => ({
    id: 'f1', t1: sfWinners['m0'] || null, t2: sfWinners['m1'] || null
  }), [sfWinners]);

  return (
    <div className="bg-black text-zinc-400 font-sans pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Glow ambient lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Tournament Engine v2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-50 leading-tight">
            Raw simplicity.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-400 to-blue-500">
              Unrivaled tournament speed.
            </span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-450 max-w-lg mx-auto leading-relaxed font-light">
            Generate complex brackets, balance seeds, and coordinate streams in real time. Build matching matrices within minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onNavigateToClassement}
              className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold tracking-wider text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 cursor-pointer"
            >
              Lancer la Console
            </button>
            <a
              href="#bracket-demo"
              className="px-6 py-2.5 rounded border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-xs font-semibold tracking-wider text-zinc-200 transition-all hover:-translate-y-0.5"
            >
              Simulateur Live
            </a>
          </div>

          {/* Minimal visual metrics */}
          <div className="flex items-center justify-center gap-x-8 text-[9px] font-mono tracking-widest text-zinc-550 uppercase pt-4">
            <div>
              Platform: <span className="text-zinc-400">Fixed Layout</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-850"></div>
            <div>
              Updates: <span className="text-zinc-400">Real-time Hook</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Bracket Section */}
      <section id="bracket-demo" className="py-20 bg-zinc-950/25 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-50 uppercase">
              Interactive Bracket Simulator
            </h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              Click on a qualified team in each match node below to advance them to the next round, all the way to crowning the champion.
            </p>
            <div className="flex justify-center pt-2">
              <button
                onClick={resetBracket}
                className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
              >
                Reset Simulator
              </button>
            </div>
          </div>

          {/* Bracket Tree */}
          <div className="overflow-x-auto pb-6">
            <div className="min-w-[850px] flex items-center justify-between gap-4 py-4 relative">
              
              {/* QF */}
              <div className="flex-1 space-y-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center mb-4">
                  Quarterfinals
                </div>
                {qfMatches.map((m, idx) => {
                  const isWinner1 = qfWinners[`m${idx}`]?.id === m.t1.id;
                  const isWinner2 = qfWinners[`m${idx}`]?.id === m.t2.id;
                  return (
                    <div key={m.id} className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden divide-y divide-zinc-900 text-left">
                      <button
                        onClick={() => advanceTeam(1, idx, m.t1)}
                        className={`w-full flex items-center justify-between p-3 transition-colors cursor-pointer focus:outline-none ${isWinner1 ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                      >
                        <span className={`text-xs ${isWinner1 ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{m.t1.logo} {m.t1.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">#{m.t1.seed}</span>
                      </button>
                      <button
                        onClick={() => advanceTeam(1, idx, m.t2)}
                        className={`w-full flex items-center justify-between p-3 transition-colors cursor-pointer focus:outline-none ${isWinner2 ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                      >
                        <span className={`text-xs ${isWinner2 ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{m.t2.logo} {m.t2.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">#{m.t2.seed}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Connector */}
              <div className="hidden lg:flex w-8 flex-col justify-around h-[300px] text-zinc-800 pointer-events-none -mx-2">
                <div className="h-[100px] border-r border-t border-b border-dashed border-zinc-800 rounded-r"></div>
                <div className="h-[100px] border-r border-t border-b border-dashed border-zinc-800 rounded-r"></div>
              </div>

              {/* SF */}
              <div className="flex-1 space-y-16 mt-8">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center mb-4">
                  Semifinals
                </div>
                {sfMatches.map((m, idx) => {
                  const isWinner1 = m.t1 && sfWinners[`m${idx}`]?.id === m.t1.id;
                  const isWinner2 = m.t2 && sfWinners[`m${idx}`]?.id === m.t2.id;
                  return (
                    <div key={m.id} className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden divide-y divide-zinc-900 text-left">
                      {m.t1 ? (
                        <button
                          onClick={() => advanceTeam(2, idx, m.t1!)}
                          className={`w-full flex items-center justify-between p-3.5 transition-colors cursor-pointer focus:outline-none ${isWinner1 ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                        >
                          <span className={`text-xs ${isWinner1 ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{m.t1.logo} {m.t1.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">QFA</span>
                        </button>
                      ) : (
                        <div className="p-3.5 text-[10px] text-zinc-600 italic text-center">Waiting...</div>
                      )}
                      {m.t2 ? (
                        <button
                          onClick={() => advanceTeam(2, idx, m.t2!)}
                          className={`w-full flex items-center justify-between p-3.5 transition-colors cursor-pointer focus:outline-none ${isWinner2 ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                        >
                          <span className={`text-xs ${isWinner2 ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{m.t2.logo} {m.t2.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">QFB</span>
                        </button>
                      ) : (
                        <div className="p-3.5 text-[10px] text-zinc-600 italic text-center">Waiting...</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Connector */}
              <div className="hidden lg:flex w-8 flex-col justify-around h-[200px] text-zinc-800 pointer-events-none -mx-2">
                <div className="h-[120px] border-r border-t border-b border-dashed border-zinc-800 rounded-r"></div>
              </div>

              {/* Finals */}
              <div className="flex-1 space-y-24 mt-16">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center mb-4">
                  Grand Finals
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden divide-y divide-zinc-900 text-left">
                  {finalMatch.t1 ? (
                    <button
                      onClick={() => advanceTeam(3, 0, finalMatch.t1!)}
                      className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer focus:outline-none ${champion?.id === finalMatch.t1.id ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                    >
                      <span className={`text-xs font-semibold ${champion?.id === finalMatch.t1.id ? 'text-amber-500 font-bold' : 'text-zinc-350'}`}>{finalMatch.t1.logo} {finalMatch.t1.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">SFA</span>
                    </button>
                  ) : (
                    <div className="p-4 text-[10px] text-zinc-650 italic text-center">Waiting...</div>
                  )}
                  {finalMatch.t2 ? (
                    <button
                      onClick={() => advanceTeam(3, 0, finalMatch.t2!)}
                      className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer focus:outline-none ${champion?.id === finalMatch.t2.id ? 'bg-blue-600/10' : 'hover:bg-zinc-900/30'}`}
                    >
                      <span className={`text-xs font-semibold ${champion?.id === finalMatch.t2.id ? 'text-amber-500 font-bold' : 'text-zinc-350'}`}>{finalMatch.t2.logo} {finalMatch.t2.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">SFB</span>
                    </button>
                  ) : (
                    <div className="p-4 text-[10px] text-zinc-650 italic text-center">Waiting...</div>
                  )}
                </div>
              </div>

              {/* Connector */}
              <div className="hidden lg:flex w-8 items-center text-zinc-800 pointer-events-none -mx-2">
                <div className="w-8 border-b border-dashed border-zinc-800"></div>
              </div>

              {/* Champion */}
              <div className="flex-1 flex flex-col items-center justify-center mt-20">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 text-center">
                  Crowned Champion
                </div>
                {champion ? (
                  <div className="p-6 rounded-lg border border-amber-500 bg-zinc-950 text-center space-y-4 max-w-[200px] w-full animate-pulse">
                    <div className="text-3xl">👑</div>
                    <h4 className="text-xs font-black text-zinc-200 uppercase tracking-tight">{champion.name}</h4>
                    <p className="text-[10px] text-amber-500 font-bold">Champion</p>
                  </div>
                ) : (
                  <div className="w-full max-w-[180px] border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 flex flex-col justify-center items-center h-[180px] bg-zinc-950/20">
                    <span className="text-2xl mb-2">🏆</span>
                    <span className="text-[9px] font-mono uppercase tracking-widest">Advance players to claim cup</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Platform features details */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded border border-zinc-900 bg-zinc-950/40 text-left space-y-3">
            <div className="text-[10px] font-mono text-blue-500 uppercase font-bold">01 // BRACKETS</div>
            <h3 className="text-xs font-bold text-zinc-250 uppercase tracking-wider">Dynamic Tree Generation</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Build single or double elimination trees instantly. Completely integrated seed balances.
            </p>
          </div>
          <div className="p-6 rounded border border-zinc-900 bg-zinc-950/40 text-left space-y-3">
            <div className="text-[10px] font-mono text-blue-500 uppercase font-bold">02 // LATENCY</div>
            <h3 className="text-xs font-bold text-zinc-250 uppercase tracking-wider">Real-Time Sync Engine</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Watch scores and updates render instantly without window reloads. Server-coordinated socket feeds.
            </p>
          </div>
          <div className="p-6 rounded border border-zinc-900 bg-zinc-950/40 text-left space-y-3">
            <div className="text-[10px] font-mono text-blue-500 uppercase font-bold">03 // STYLING</div>
            <h3 className="text-xs font-bold text-zinc-250 uppercase tracking-wider">CSS Custom Presets</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Inject custom widgets, fonts, and dark theme gradients straight into your game overlays, stream widgets, and profiles.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQs accordion */}
      <section className="py-20 max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-50 uppercase">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500">Core metrics, configurations, and rosters answers.</p>
        </div>

        <div className="space-y-3 text-left">
          {[
            { q: "How many bracket styles does Gestion Tournois support?", a: "We support single-elimination, double-elimination, round-robin, Swiss formats, and custom multi-stage groups. All can be configured with automated seeding rules." },
            { q: "Can we embed scoreboards directly into our website?", a: "Yes. Every tournament automatically creates a shareable, responsive widget that can be embedded into any website using a simple iframe or custom HTML tag." },
            { q: "How does the timezone conflict solver operate?", a: "When participants register, they specify their availability window. Our match coordinator checks for overlaps and automatically spaces matches, notifying players in their local time." }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-zinc-300 hover:bg-zinc-900/40 cursor-pointer focus:outline-none"
                >
                  <span>{item.q}</span>
                  <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-zinc-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`transition-all overflow-hidden ${isOpen ? 'max-h-24 border-t border-zinc-900' : 'max-h-0'}`}>
                  <p className="p-4 text-xs leading-relaxed text-zinc-500 bg-zinc-900/10">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
