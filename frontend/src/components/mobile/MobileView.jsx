import React, { useState, useEffect, useRef } from 'react';
import { Eye, Volume2, VolumeX, RefreshCw, Power, Camera, Headphones, Radio } from 'lucide-react';
import { analyzeImageBlob, checkHealth } from '../../services/api';
import { speechService } from '../../services/speechService';

export default function MobileView() {
  const [isActive, setIsActive] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [cameraReady, setCameraReady] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [earphonesConnected, setEarphonesConnected] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // Rear environment camera
  const [permissionError, setPermissionError] = useState(null);
  
  const [currentInstruction, setCurrentInstruction] = useState('System ready. Press start journey.');
  const [lastAnnounced, setLastAnnounced] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    checkHealth().then(res => {
      setBackendOnline(res.status === 'online');
    });

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasHeadphones = devices.some(d => d.kind === 'audiooutput' && (d.label.includes('Bluetooth') || d.label.includes('Headphones')));
        if (hasHeadphones) setEarphonesConnected(true);
      }).catch(() => {});
    }
  }, []);

  const startJourney = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      speechService.speak("Assistance active. Starting environmental navigation.", true);

      // Frame capture loop every 4 seconds
      intervalRef.current = setInterval(captureAndAnalyze, 4000);
    } catch (err) {
      setPermissionError("Camera permission is required to start the journey.");
      setIsActive(false);
    }
  };

  const stopJourney = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setCurrentInstruction('Journey stopped.');
    speechService.speak("Journey stopped.");
  };

  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isActive) {
      stopJourney();
      setTimeout(() => startJourney(), 400);
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 max-w-md mx-auto relative overflow-hidden select-none">
      
      {/* Hidden camera preview & canvas */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Branding */}
      <header className="w-full text-center pt-4 pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          DRISHTIGUIDE AI
        </h1>
        <p className="text-cyan-300/90 font-medium text-xs tracking-widest uppercase mt-1">
          "Let AI Be Your Eyes."
        </p>
      </header>

      {/* Main Screen Content */}
      {!isActive ? (
        /* HOME SCREEN */
        <main className="w-full flex-1 flex flex-col justify-center items-center my-6 space-y-8">
          
          {/* Eye Icon Symbol */}
          <div className="p-6 bg-cyan-500/10 rounded-full border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
            <Eye className="w-20 h-20 text-cyan-400" />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={startJourney}
            className="w-full py-7 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-2xl tracking-wide rounded-3xl shadow-2xl shadow-cyan-500/30 border-2 border-cyan-300 flex flex-col items-center justify-center space-y-1 transition-all"
            aria-label="Start Journey Assistance"
          >
            <Power className="w-10 h-10 stroke-[2.5]" />
            <span>LET'S START THE JOURNEY</span>
          </button>

          {/* Permission Error Message Banner */}
          {permissionError && (
            <div className="w-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold p-3 rounded-xl text-center">
              {permissionError}
            </div>
          )}

          {/* Accessible Status Pills */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-slate-800/80">
              <span className="flex items-center space-x-2 text-slate-300">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>Earbuds:</span>
              </span>
              <span className={`font-bold text-xs uppercase px-2.5 py-1 rounded-lg ${earphonesConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {earphonesConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-slate-800/80">
              <span className="flex items-center space-x-2 text-slate-300">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Camera:</span>
              </span>
              <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                Ready
              </span>
            </div>
          </div>
        </main>
      ) : (
        /* JOURNEY ACTIVE SCREEN */
        <main className="w-full flex-1 flex flex-col justify-between my-4 space-y-6">
          
          {/* Status Header */}
          <div className="w-full flex items-center justify-between bg-cyan-950/50 border border-cyan-500/40 rounded-xl p-3">
            <span className="flex items-center space-x-2 font-bold text-xs text-cyan-400 tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>● JOURNEY ACTIVE</span>
            </span>
            
            <button
              onClick={toggleCameraFacing}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
            </button>
          </div>

          {/* Simple Diagnostic Row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Camera</span>
              <strong className="text-emerald-400 font-bold">ON</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">AI Backend</span>
              <strong className={`font-bold ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {backendOnline ? 'ONLINE' : 'CONNECTING'}
              </strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Voice</span>
              <strong className={`font-bold ${isVoiceOn ? 'text-emerald-400' : 'text-red-400'}`}>
                {isVoiceOn ? 'ON' : 'OFF'}
              </strong>
            </div>
          </div>

          {/* Large Guidance Text Output */}
          <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-center space-y-2 shadow-2xl flex-1 flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Current Guidance</span>
            <p className="text-2xl sm:text-3xl font-black text-cyan-300 leading-snug">
              "{currentInstruction}"
            </p>
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleMute}
                className="py-4 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-base rounded-2xl flex items-center justify-center space-x-2"
              >
                {isVoiceOn ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
                <span>{isVoiceOn ? 'MUTE' : 'UNMUTE'}</span>
              </button>

              <button
                onClick={() => speechService.repeatLast()}
                className="py-4 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-base rounded-2xl flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5 text-cyan-400" />
                <span>REPEAT</span>
              </button>
            </div>

            <button
              onClick={stopJourney}
              className="w-full py-5 bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-xl tracking-wider rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center space-x-3 transition-all"
            >
              <Power className="w-6 h-6" />
              <span>STOP JOURNEY</span>
            </button>
          </div>

        </main>
      )}

      {/* Footer Privacy Disclaimer */}
      <footer className="w-full text-center pt-2 pb-2 text-[10px] text-slate-500 border-t border-slate-800/80">
        Camera images are processed for environmental assistance and are not permanently stored by default.
      </footer>
    </div>
  );
}
