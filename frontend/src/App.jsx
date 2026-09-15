import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import MobileView from './components/mobile/MobileView';
import Dashboard from './components/dashboard/Dashboard';
import DemoMode from './components/demo/DemoMode';
import { Eye, Smartphone, Monitor, Play, Home } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'mobile', 'dashboard', 'demo'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Global View Selector Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 text-xs shadow-md">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-cyan-300">DRISHTIGUIDE AI</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              currentView === 'landing' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => setCurrentView('mobile')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              currentView === 'mobile' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              currentView === 'dashboard' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Laptop Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('demo')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              currentView === 'demo' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartMobile={() => setCurrentView('mobile')}
            onOpenDashboard={() => setCurrentView('dashboard')}
            onOpenDemo={() => setCurrentView('demo')}
          />
        )}

        {currentView === 'mobile' && <MobileView />}

        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'demo' && (
          <div className="max-w-6xl mx-auto p-6">
            <DemoMode />
          </div>
        )}
      </div>

    </div>
  );
}
