import React from 'react';
import { Eye, Shield, Cpu, Volume2, ArrowRight, Heart, Sparkles, Layers, Radio, Activity } from 'lucide-react';

export default function LandingPage({ onStartMobile, onOpenDashboard, onOpenDemo }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center space-y-6">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-POWERED ASSISTIVE VISION SYSTEM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          DRISHTIGUIDE AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            "Let AI Be Your Eyes."
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
          An AI-powered wearable vision assistant designed to transform complex environmental video feeds into simple, prioritized, non-intrusive voice guidance for visually impaired individuals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <button
            onClick={onStartMobile}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Eye className="w-5 h-5" />
            <span>START MOBILE ASSISTANT</span>
          </button>

          <button
            onClick={onOpenDemo}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-base rounded-2xl flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>START DEMO MODE</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-base rounded-2xl flex items-center space-x-2 transition-all"
          >
            <Activity className="w-5 h-5 text-blue-400" />
            <span>VIEW AI RESEARCH DASHBOARD</span>
          </button>
        </div>
      </section>

      {/* Feature / Architecture Cards */}
      <section className="bg-slate-900/60 border-y border-slate-800/80 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">System Architecture & Workflow</h2>
            <p className="text-slate-400 text-sm">How DRISHTIGUIDE AI transforms visual inputs into earphone guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">1</div>
              <h3 className="font-bold text-sm text-slate-100">Glasses Camera</h3>
              <p className="text-xs text-slate-400">Captures surroundings continuously</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">2</div>
              <h3 className="font-bold text-sm text-slate-100">YOLO Detection</h3>
              <p className="text-xs text-slate-400">Lightweight object & hazard detection</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">3</div>
              <h3 className="font-bold text-sm text-slate-100">Temporal & Risk</h3>
              <p className="text-xs text-slate-400">Movement tracking & dynamic risk scoring</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">4</div>
              <h3 className="font-bold text-sm text-slate-100">Priority Engine</h3>
              <p className="text-xs text-slate-400">Filters audio clutter, picks vital alert</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">5</div>
              <h3 className="font-bold text-sm text-slate-100">Earphone Speech</h3>
              <p className="text-xs text-slate-400">Short actionable voice phrasing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact & Problem Statement */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl w-fit">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white">The Challenge</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Visually impaired navigation faces severe audio overload when traditional computer vision systems announce every single detected object in sight. Continuous chatter ("tree, door, floor, chair, sky") creates confusion rather than safety.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl w-fit">
            <Heart className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Novel Contribution</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            DRISHTIGUIDE AI introduces <strong>Intelligent Guidance Prioritization</strong>. Instead of describing everything, the AI continuously asks: <em>"What does the user need to know right now?"</em> It delivers concise alerts only when critical hazards (approaching vehicles, stairs, potholes) enter the walking path.
          </p>
        </div>
      </section>
    </div>
  );
}
