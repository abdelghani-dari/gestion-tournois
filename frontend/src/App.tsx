import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'classement'>('home');

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden font-sans select-none">
      
      {/* 1. Translucent Sticky Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-black/60 backdrop-blur-md h-16 flex items-center">
        <div className="max-w-[1440px] mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}      {/* DIMA RAJA */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(37,99,235,0.6)]">
              T
            </div>
            <span className="font-semibold text-sm tracking-widest text-zinc-50 uppercase">
              Gestion<span className="text-blue-500">Tournois</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-zinc-400">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`hover:text-zinc-100 transition-all focus:outline-none cursor-pointer py-1.5 ${
                currentPage === 'home' 
                  ? 'text-zinc-100 font-bold border-b-2 border-blue-500' 
                  : 'border-b-2 border-transparent'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('classement')}
              className={`hover:text-zinc-100 transition-all focus:outline-none cursor-pointer py-1.5 ${
                currentPage === 'classement' 
                  ? 'text-zinc-100 font-bold border-b-2 border-blue-500' 
                  : 'border-b-2 border-transparent'
              }`}
            >
              Classements & Stats
            </button>
          </nav>

          {/* Simple Connexion Button */}
          <div>
            <button className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold tracking-wider text-white transition-colors cursor-pointer select-none">
              Connexion
            </button>
          </div>
        </div>
      </header>

      {/* 2. Content view depending on state routing */}
      <div className="flex-grow overflow-hidden bg-black">
        {currentPage === 'home' ? (
          <div className="h-full overflow-y-auto pt-0">
            <LandingPage onNavigateToClassement={() => setCurrentPage('classement')} />
          </div>
        ) : (
          <Dashboard />
        )}
      </div>

    </div>
  );
}

export default App;
