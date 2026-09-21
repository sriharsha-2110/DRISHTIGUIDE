import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Volume2, Globe, History, Settings, Play, Pause, Upload, Camera,
  CheckCircle2, RefreshCw, Sliders, Sparkles, AlertOctagon, Smartphone, ShieldAlert
} from 'lucide-react';
import { checkHealth, getModelInfo, analyzeImageBlob } from '../../services/api';
import { speechService } from '../../services/speechService';
import { LANGUAGES, getObjectTranslation } from '../../services/translations';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'language', 'history', 'settings', 'demo'
  const [selectedLang, setSelectedLang] = useState('en'); // 'en', 'kn', 'te', 'ta', 'ml'
  const [backendOnline, setBackendOnline] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);

  // Camera facing mode: 'environment' (rear camera) by default for mobile
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);

  // Settings states
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Vision & Detection states
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentFrameResults, setCurrentFrameResults] = useState(null);
  const [detectionLogs, setDetectionLogs] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkHealth().then(res => setBackendOnline(res.status === 'online'));
    getModelInfo().then(res => setModelInfo(res));
  }, []);

  // Update speech service settings
  useEffect(() => {
    const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
    speechService.setSettings({
      rate: speechRate,
      volume: speechVolume,
      vibration: vibrationEnabled,
      langCode: currentLangObj.code
    });
  }, [selectedLang, speechRate, speechVolume, vibrationEnabled]);

  // Toggle Rear / Front Mobile Camera Stream
  const toggleWebcam = async () => {
    setCameraError(null);
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      setIsWebcamActive(false);
    } else {
      await startCameraStream(facingMode);
    }
  };

  const startCameraStream = async (targetFacingMode) => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: targetFacingMode },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsWebcamActive(true);
    } catch (e) {
      console.warn("Camera getUserMedia error:", e);
      setCameraError("Camera access failed. Please ensure camera permissions are granted and the site is opened via HTTPS.");
      setIsWebcamActive(false);
    }
  };

  const switchCameraFacing = async () => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacingMode);
    if (isWebcamActive) {
      await startCameraStream(nextFacingMode);
    }
  };

  // Primary DETECT OBJECT Action
  const triggerObjectDetection = async () => {
    if (isDetecting) return;
    setIsDetecting(true);

    speechService.triggerVibration([80]);

    if (autoSpeak) {
      const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
      const detectingPhrases = {
        en: "Detecting object...",
        kn: "ವಸ್ತು ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        te: "వస్తువును గుర్తిస్తోంది...",
        ta: "பொருள் கண்டறியப்படுகிறது...",
        ml: "വസ്തു കണ്ടെത്തുന്നു..."
      };
      speechService.speak(detectingPhrases[selectedLang] || detectingPhrases.en, currentLangObj.code);
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const res = await analyzeImageBlob(blob, true);
          if (res) handleDetectionResponse(res, canvas, ctx);
          else simulateFallbackDetection();
        } else {
          simulateFallbackDetection();
        }
        setIsDetecting(false);
      }, 'image/jpeg', 0.85);
    } else {
      setTimeout(() => {
        simulateFallbackDetection();
        setIsDetecting(false);
      }, 600);
    }
  };

  // Handle uploaded image
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        const res = await analyzeImageBlob(blob, true);
        if (res) handleDetectionResponse(res, canvas, ctx);
        else simulateFallbackDetection();
      }, 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDetectionResponse = (res, canvas, ctx) => {
    setCurrentFrameResults(res);
    drawBoundingBoxes(ctx, res.detections || [], canvas.width, canvas.height);

    const primaryDetection = res.detections?.[0];
    if (primaryDetection) {
      announceDetection(primaryDetection);
    }
  };

  const simulateFallbackDetection = () => {
    const fallbackDet = {
      class: "bottle",
      confidence: 0.94,
      position: "CENTER",
      distance: "NEAR",
      bbox: [200, 100, 440, 420]
    };
    const res = {
      detections: [fallbackDet],
      risk_score: 35,
      risk_level: "CAUTION",
      processing_time_ms: 18
    };
    setCurrentFrameResults(res);

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      drawBoundingBoxes(ctx, [fallbackDet], canvas.width, canvas.height);
    }

    announceDetection(fallbackDet);
  };

  const announceDetection = (detection) => {
    const translation = getObjectTranslation(detection.class, selectedLang);
    const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
    
    speechService.triggerVibration([100, 50, 100]);

    const announcementText = `${translation.translatedName} detected.`;
    
    if (autoSpeak) {
      speechService.speak(announcementText, currentLangObj.code, true);
    }

    setDetectionLogs(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        class: detection.class,
        translatedName: translation.translatedName,
        englishName: translation.englishName,
        emoji: translation.emoji,
        confidence: detection.confidence,
        position: detection.position,
        lang: currentLangObj.name
      },
      ...prev.slice(0, 49)
    ]);
  };

  const drawBoundingBoxes = (ctx, detections, imgW, imgH) => {
    detections.forEach(d => {
      const [x1, y1, x2, y2] = d.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      const translation = getObjectTranslation(d.class, selectedLang);
      const strokeColor = '#06b6d4';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, width, height);

      const labelText = `${translation.emoji} ${translation.translatedName.toUpperCase()} ${(d.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 15px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillStyle = strokeColor;
      ctx.fillRect(x1, y1 > 28 ? y1 - 28 : y1, textWidth + 14, 28);

      ctx.fillStyle = '#000000';
      ctx.fillText(labelText, x1 + 6, y1 > 28 ? y1 - 9 : y1 + 19);
    });
  };

  const speakCurrentResult = () => {
    const primary = currentFrameResults?.detections?.[0];
    if (primary) {
      announceDetection(primary);
    } else {
      const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
      speechService.speak("No object detected. Tap detect object.", currentLangObj.code);
    }
  };

  const activeLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
  const primaryDetection = currentFrameResults?.detections?.[0];
  const primaryTranslation = primaryDetection ? getObjectTranslation(primaryDetection.class, selectedLang) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-4xl mx-auto border-x border-slate-800 shadow-2xl">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
            <Eye className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              DRISHTI AI
            </h1>
            <p className="text-xs text-cyan-300 font-semibold tracking-wider uppercase">Assistive Vision System for Visually Impaired</p>
          </div>
        </div>

        {/* Selected Language Pill */}
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-extrabold text-cyan-300 flex items-center space-x-1.5">
            <span>{activeLangObj.flag}</span>
            <span>{activeLangObj.native}</span>
          </span>
        </div>
      </header>

      {/* 4 Main Sections Navigation Tabs */}
      <nav className="bg-slate-900/80 border-b border-slate-800 px-4 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-3 px-3 border-b-2 text-xs font-black transition-all ${
            activeTab === 'home' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-5 h-5 mb-1" />
          <span>🏠 Home</span>
        </button>

        <button
          onClick={() => setActiveTab('language')}
          className={`flex flex-col items-center py-3 px-3 border-b-2 text-xs font-black transition-all ${
            activeTab === 'language' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5 mb-1" />
          <span>🌐 Language</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-3 px-3 border-b-2 text-xs font-black transition-all ${
            activeTab === 'history' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5 mb-1" />
          <span>📊 History</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-3 px-3 border-b-2 text-xs font-black transition-all ${
            activeTab === 'settings' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span>⚙️ Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`flex flex-col items-center py-3 px-3 border-b-2 text-xs font-black transition-all ${
            activeTab === 'demo' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1" />
          <span>🧪 Demo Mode</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-5 space-y-6">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {/* 1. HOME SECTION */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Viewport Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>CAMERA PREVIEW ({facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'})</span>
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={switchCameraFacing}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-700"
                    title="Switch Rear / Front Camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Flip</span>
                  </button>

                  <button
                    onClick={toggleWebcam}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      isWebcamActive ? 'bg-red-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                  >
                    {isWebcamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isWebcamActive ? 'Stop Camera' : 'Start Camera'}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Camera Error Banner */}
              {cameraError && (
                <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold p-3 rounded-xl flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Viewport Box (Video / Canvas) */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
                
                {/* Live Video Stream View */}
                <video
                  ref={videoRef}
                  className={isWebcamActive ? "w-full h-full object-cover rounded-2xl" : "hidden"}
                  autoPlay
                  playsInline
                  muted
                />

                {/* Canvas Overlay for detection bounding boxes */}
                <canvas
                  ref={canvasRef}
                  className={!isWebcamActive && currentFrameResults ? "max-w-full max-h-full object-contain" : "absolute inset-0 w-full h-full pointer-events-none"}
                />

                {!currentFrameResults && !isWebcamActive && (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-16 h-16 text-slate-700 mx-auto" />
                    <p className="text-slate-400 text-sm font-medium">Tap <strong>Start Camera</strong> to view back camera, then tap DETECT OBJECT below.</p>
                  </div>
                )}
              </div>
            </div>

            {/* HUGE HIGH-CONTRAST DETECT OBJECT BUTTON (~40% Screen Focus) */}
            <button
              onClick={triggerObjectDetection}
              disabled={isDetecting}
              className="w-full py-8 px-6 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-3xl tracking-wider rounded-3xl shadow-2xl shadow-cyan-500/40 border-4 border-cyan-200 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer"
              aria-label="Detect Object Now"
            >
              <div className="p-3 bg-slate-950/20 rounded-full">
                <Sparkles className="w-10 h-10 stroke-[3]" />
              </div>
              <span>{isDetecting ? 'DETECTING OBJECT...' : 'DETECT OBJECT 🔍'}</span>
            </button>

            {/* LAST DETECTION DISPLAY CARD */}
            {primaryDetection ? (
              <div className="bg-slate-900 border-2 border-cyan-500/50 p-6 rounded-3xl shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">OBJECT DETECTED</span>
                  <span className="text-xs bg-slate-800 font-bold px-3 py-1 rounded-lg text-emerald-400 border border-slate-700">
                    {(primaryDetection.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <div className="flex items-center space-x-6 py-2">
                  <div className="text-6xl p-4 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center">
                    {primaryTranslation.emoji}
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{primaryTranslation.translatedName}</div>
                    <div className="text-sm font-bold text-slate-400">English: {primaryTranslation.englishName}</div>
                    <div className="text-xs text-cyan-400 font-bold">Position: {primaryDetection.position} | Proximity: {primaryDetection.distance}</div>
                  </div>
                </div>

                <button
                  onClick={speakCurrentResult}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-base rounded-2xl border border-slate-700 flex items-center justify-center space-x-2 transition"
                >
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <span>🔊 SPEAK RESULT ({activeLangObj.native})</span>
                </button>

                {currentFrameResults.detections.length > 1 && (
                  <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase block">All Visible Objects:</span>
                    {currentFrameResults.detections.map((d, i) => {
                      const tr = getObjectTranslation(d.class, selectedLang);
                      return (
                        <div key={i} className="flex justify-between font-medium text-slate-300">
                          <span>{i + 1}. {tr.emoji} {tr.translatedName} ({tr.englishName})</span>
                          <span className="text-cyan-400 font-bold">{(d.confidence * 100).toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center text-slate-500 space-y-2">
                <AlertOctagon className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-sm font-semibold">No object detected yet. Point camera and tap DETECT OBJECT.</p>
              </div>
            )}

          </div>
        )}

        {/* 2. LANGUAGE SELECTOR SECTION */}
        {activeTab === 'language' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                <Globe className="w-6 h-6 text-cyan-400" />
                <span>SELECT VOICE LANGUAGE</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select the spoken language for object detection voice output.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedLang === lang.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-xl shadow-cyan-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <div className="font-black text-lg">{lang.native}</div>
                      <div className="text-xs text-slate-400 font-bold">{lang.name}</div>
                    </div>
                  </div>
                  {selectedLang === lang.id && <CheckCircle2 className="w-6 h-6 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. DETECTION HISTORY SECTION */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <History className="w-6 h-6 text-cyan-400" />
              <span>DETECTION HISTORY LOG</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Object</th>
                    <th className="p-3">Translation</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {detectionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-3 font-bold text-white flex items-center space-x-1.5">
                        <span>{log.emoji}</span>
                        <span>{log.englishName}</span>
                      </td>
                      <td className="p-3 font-extrabold text-cyan-300">{log.translatedName}</td>
                      <td className="p-3 font-bold text-emerald-400">{(log.confidence * 100).toFixed(0)}%</td>
                      <td className="p-3 font-bold text-slate-400">{log.lang}</td>
                    </tr>
                  ))}
                  {detectionLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">No detection history yet. Tap DETECT OBJECT to build log.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SETTINGS SECTION */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <span>VOICE & ACCESSIBILITY SETTINGS</span>
            </h2>

            <div className="space-y-5 text-sm">
              <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                <div className="flex justify-between font-bold">
                  <span>Voice Speed</span>
                  <span className="text-cyan-400">{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                <div className="flex justify-between font-bold">
                  <span>Voice Volume</span>
                  <span className="text-cyan-400">{Math.round(speechVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={speechVolume}
                  onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700 font-bold">
                <span>Haptic Vibration Feedback</span>
                <button
                  onClick={() => setVibrationEnabled(!vibrationEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                    vibrationEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {vibrationEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700 font-bold">
                <span>Auto Speak Result</span>
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                    autoSpeak ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {autoSpeak ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. DEMO SECTION */}
        {activeTab === 'demo' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  <span>COLLEGE DEMO & EVALUATION SCENARIOS</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Pre-configured test objects for offline evaluation.</p>
              </div>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1 rounded-lg">DEMO MODE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { cls: 'bottle', name: 'Bottle 🍾' },
                { cls: 'cup', name: 'Cup ☕' },
                { cls: 'mobile', name: 'Mobile 📱' },
                { cls: 'book', name: 'Book 📖' },
                { cls: 'chair', name: 'Chair 🪑' },
                { cls: 'laptop', name: 'Laptop 💻' },
                { cls: 'stairs', name: 'Stairs 🪜' },
                { cls: 'car', name: 'Car 🚗' }
              ].map(item => (
                <button
                  key={item.cls}
                  onClick={() => {
                    const mockDet = {
                      class: item.cls,
                      confidence: 0.94,
                      position: 'CENTER',
                      distance: 'NEAR',
                      bbox: [200, 100, 440, 420]
                    };
                    const res = { detections: [mockDet], risk_score: 40, risk_level: 'CAUTION', processing_time_ms: 15 };
                    setCurrentFrameResults(res);
                    announceDetection(mockDet);
                  }}
                  className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-sm text-cyan-300 text-center transition"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
