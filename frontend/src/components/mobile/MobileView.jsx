import React, { useState, useEffect, useRef } from 'react';
import { Eye, ShieldAlert, Volume2, VolumeX, RefreshCw, Power, Camera, Headphones, Radio, AlertTriangle } from 'lucide-react';
import { analyzeImageBlob, checkHealth } from '../../services/api';
import { speechService } from '../../services/speechService';

export default function MobileView() {
  const [isActive, setIsActive] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [earphonesConnected, setEarphonesConnected] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // environment = rear camera
  
  const [currentRiskLevel, setCurrentRiskLevel] = useState('SAFE');
  const [currentInstruction, setCurrentInstruction] = useState('System ready. Press start journey.');
  const [lastAnnounced, setLastAnnounced] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Check backend status on mount
  useEffect(() => {
    checkHealth().then(res => {
      setBackendOnline(res.status === 'online');
    });

    // Detect media device audio output if supported
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasHeadphones = devices.some(d => d.kind === 'audiooutput' && (d.label.includes('Bluetooth') || d.label.includes('Headphones')));
        if (hasHeadphones) setEarphonesConnected(true);
      }).catch(() => {});
    }
  }, []);

  // Handle starting journey
  const startJourney = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraConnected(true);
      setIsActive(true);
      speechService.speak("Assistance active. Starting environmental navigation.", true);

      // Start periodic 4-second frame analysis loop
      intervalRef.current = setInterval(captureAndAnalyze, 4000);
    } catch (err) {
      alert("Camera permission denied or camera unavailable: " + err.message);
      setCameraConnected(false);
    }
  };

  const stopJourney = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setCameraConnected(false);
    setCurrentRiskLevel('SAFE');
    setCurrentInstruction('Journey stopped.');
    speechService.speak("Journey stopped.");
  };

  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isActive) {
      stopJourney();
      setTimeout(() => startJourney(), 500);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const res = await analyzeImageBlob(blob);
      if (res) {
        setBackendOnline(true);
        setCurrentRiskLevel(res.risk_level || 'SAFE');
        
        if (res.instruction) {
          setCurrentInstruction(res.instruction);
          setLastAnnounced(res.instruction);
          speechService.speak(res.instruction, res.critical);
        }
      }
    }, 'image/jpeg', 0.7);
  };

  const toggleMute = () => {
    const muted = speechService.toggleMute();
    setIsVoiceOn(!muted);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-400 animate-pulse';
      case 'HIGH': return 'bg-amber-600 text-white border-amber-400';
      case 'CAUTION': return 'bg-yellow-500 text-black border-yellow-300';
      default: return 'bg-emerald-600 text-white border-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 max-w-md mx-auto relative overflow-hidden select-none">
      
      {/* Hidden camera preview & canvas */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Branding */}
      <header className="w-full text-center pt-4 pb-2 border-b border-slate-800">
        <div className="flex items-center justify-center space-x-3 mb-1">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
            <Eye className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            DRISHTIGUIDE AI
          </h1>
        </div>
        <p className="text-cyan-300/80 font-medium text-xs tracking-widest uppercase">
          AI VISION ASSISTANT — "Let AI Be Your Eyes."
        </p>
      </header>

      {/* Main Screen State */}
      {!isActive ? (
        /* HOME SCREEN */
        <main className="w-full flex-1 flex flex-col justify-center items-center my-6 space-y-8">
          
          {/* Big Start Button */}
          <button
            onClick={startJourney}
            className="w-full py-8 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-2xl tracking-wide rounded-3xl shadow-2xl shadow-cyan-500/30 border-2 border-cyan-300 flex flex-col items-center justify-center space-y-2 transition-all duration-200"
            aria-label="Start Journey Assistance"
          >
            <Power className="w-12 h-12 stroke-[2.5]" />
            <span>START JOURNEY</span>
          </button>

          {/* Accessible System Status Pills */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Diagnostics</h2>

            <div className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-800/60">
              <span className="flex items-center space-x-2 text-slate-300">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Voice Guidance:</span>
              </span>
              <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${isVoiceOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isVoiceOn ? 'ON' : 'OFF'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-800/60">
              <span className="flex items-center space-x-2 text-slate-300">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Camera:</span>
              </span>
              <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${cameraConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {cameraConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-800/60">
              <span className="flex items-center space-x-2 text-slate-300">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>AI Backend:</span>
              </span>
              <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${backendOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {backendOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-800/60">
              <span className="flex items-center space-x-2 text-slate-300">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>Earphones:</span>
              </span>
              <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${earphonesConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {earphonesConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </main>
      ) : (
        /* JOURNEY ACTIVE SCREEN */
        <main className="w-full flex-1 flex flex-col justify-between my-4 space-y-6">
          
          {/* Active Banner */}
          <div className="w-full flex items-center justify-between bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3">
            <span className="flex items-center space-x-2 font-bold text-xs text-cyan-400 tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>ASSISTANCE ACTIVE</span>
            </span>
            <button
              onClick={toggleCameraFacing}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center space-x-1"
              title="Switch Rear/Front Camera"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
            </button>
          </div>

          {/* Current Risk Badge */}
          <div className={`w-full py-6 px-4 rounded-3xl border-2 text-center transition-all duration-300 shadow-xl ${getRiskColor(currentRiskLevel)}`}>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-1">Safety Risk Level</div>
            <div className="text-4xl font-black tracking-tight">{currentRiskLevel}</div>
          </div>

          {/* Spoken Guidance Text Box */}
          <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg text-center space-y-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Spoken AI Guidance</span>
            <p className="text-xl sm:text-2xl font-extrabold text-cyan-300 leading-snug">
              "{currentInstruction}"
            </p>
          </div>

          {/* Action Controls */}
          <div className="space-y-3">
            <button
              onClick={stopJourney}
              className="w-full py-5 bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-xl tracking-wider rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-3 transition-all"
            >
              <Power className="w-6 h-6" />
              <span>STOP JOURNEY</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleMute}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center space-x-2"
              >
                {isVoiceOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                <span>{isVoiceOn ? 'MUTE VOICE' : 'UNMUTE'}</span>
              </button>

              <button
                onClick={() => speechService.repeatLast()}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>REPEAT LAST</span>
              </button>
            </div>
          </div>

        </main>
      )}

      {/* Footer Disclaimer */}
      <footer className="w-full text-center pt-2 pb-2 text-[10px] text-slate-500 border-t border-slate-800/80">
        Camera frames are processed in-memory for real-time inference and not stored.
      </footer>
    </div>
  );
}
