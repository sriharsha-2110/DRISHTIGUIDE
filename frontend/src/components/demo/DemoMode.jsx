import React, { useState } from 'react';
import { Play, Volume2, ShieldAlert, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { speechService } from '../../services/speechService';

export default function DemoMode() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const demoScenarios = [
    {
      id: 1,
      title: "Scenario 1: Person Ahead",
      object: "person",
      confidence: 0.94,
      position: "CENTER",
      distance: "NEAR",
      movement: "STATIONARY",
      riskScore: 35,
      riskLevel: "CAUTION",
      priority: "INFORMATION",
      instruction: "Person ahead.",
      reason: "Person detected directly in center walking path at near distance."
    },
    {
      id: 2,
      title: "Scenario 2: Chair on Right",
      object: "chair",
      confidence: 0.88,
      position: "RIGHT",
      distance: "MEDIUM",
      movement: "STATIONARY",
      riskScore: 28,
      riskLevel: "CAUTION",
      priority: "INFORMATION",
      instruction: "Obstacle on your right.",
      reason: "Furniture obstacle detected on right side at medium distance."
    },
    {
      id: 3,
      title: "Scenario 3: Stairs Ahead",
      object: "stairs",
      confidence: 0.96,
      position: "CENTER",
      distance: "NEAR",
      movement: "STATIONARY",
      riskScore: 78,
      riskLevel: "HIGH",
      priority: "IMPORTANT",
      instruction: "Stairs ahead. Move carefully.",
      reason: "Fall hazard (stairs) detected directly in walking path."
    },
    {
      id: 4,
      title: "Scenario 4: Vehicle Approaching (Critical)",
      object: "car",
      confidence: 0.92,
      position: "CENTER",
      distance: "VERY_NEAR",
      movement: "APPROACHING",
      riskScore: 95,
      riskLevel: "CRITICAL",
      priority: "CRITICAL",
      instruction: "STOP. Vehicle approaching.",
      reason: "High hazard vehicle expanding rapidly in center path. Critical emergency override triggered."
    },
    {
      id: 5,
      title: "Scenario 5: Pothole Ahead",
      object: "pothole",
      confidence: 0.90,
      position: "CENTER",
      distance: "NEAR",
      movement: "STATIONARY",
      riskScore: 72,
      riskLevel: "HIGH",
      priority: "IMPORTANT",
      instruction: "Pothole ahead. Step carefully.",
      reason: "Ground tripping hazard detected near center walking path."
    },
    {
      id: 6,
      title: "Scenario 6: Multiple Objects (Priority Filter Test)",
      object: "car",
      confidence: 0.95,
      position: "CENTER",
      distance: "NEAR",
      movement: "APPROACHING",
      riskScore: 92,
      riskLevel: "CRITICAL",
      priority: "CRITICAL",
      instruction: "STOP. Vehicle approaching.",
      reason: "Multiple objects present (Chair, Person, Vehicle). Guidance engine prioritized critical vehicle hazard over routine obstacles."
    }
  ];

  const runScenario = (scenario) => {
    setSelectedScenario(scenario);
    speechService.speak(scenario.instruction, scenario.priority === 'CRITICAL');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
          <Play className="w-5 h-5 text-cyan-400" />
          <span>OFFLINE DEMONSTRATION MODE</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Guarantees flawless presentation even without hardware camera streams or active cloud backend connections.
        </p>
      </div>

      {/* Scenario Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demoScenarios.map(sc => (
          <button
            key={sc.id}
            onClick={() => runScenario(sc)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedScenario?.id === sc.id
                ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm text-cyan-300 mb-1">
              <span>{sc.title}</span>
              {sc.priority === 'CRITICAL' && <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded animate-pulse">CRITICAL</span>}
            </div>
            <div className="text-xs text-slate-400">Class: <strong className="text-white uppercase">{sc.object}</strong></div>
          </button>
        ))}
      </div>

      {/* Active Scenario Detailed Breakdown */}
      {selectedScenario && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Simulation Results: {selectedScenario.title}
            </h3>
            <button
              onClick={() => speechService.speak(selectedScenario.instruction, true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-lg flex items-center space-x-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>PLAY EARPHONE AUDIO</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Detected Class</span>
              <strong className="text-cyan-300 text-sm uppercase">{selectedScenario.object}</strong>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Position & Distance</span>
              <strong className="text-slate-200 text-sm">{selectedScenario.position} | {selectedScenario.distance}</strong>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
              <strong className={`text-sm ${selectedScenario.riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                {selectedScenario.riskScore}/100 ({selectedScenario.riskLevel})
              </strong>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority Filter</span>
              <strong className="text-emerald-400 text-sm">{selectedScenario.priority}</strong>
            </div>
          </div>

          {/* Spoken Output Banner */}
          <div className="bg-slate-900 border-2 border-cyan-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">Generated Spoken Instruction</span>
              <span className="text-xl font-black text-white mt-1 block">"{selectedScenario.instruction}"</span>
            </div>
          </div>

          {/* AI Decision Reason */}
          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <strong className="text-slate-200 uppercase font-bold block mb-1">AI Guidance Engine Explanation:</strong>
            {selectedScenario.reason}
          </div>
        </div>
      )}
    </div>
  );
}
