import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, Volume2, Globe, History, Settings, Play, Pause, Upload, Camera,
  CheckCircle2, RefreshCw, Sliders, Sparkles, AlertOctagon, Smartphone, ShieldAlert
} from 'lucide-react';
import { checkHealth, getModelInfo, analyzeImageBlob, API_BASE_URL } from '../../services/api';
import { speechService } from '../../services/speechService';
import { LANGUAGES, getObjectTranslation, NO_OBJECT_TRANSLATIONS } from '../../services/translations';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'language', 'history', 'settings', 'demo'
  const [selectedLang, setSelectedLang] = useState('en'); // 'en', 'kn', 'te', 'ta', 'ml'
  const [backendOnline, setBackendOnline] = useState(true);
  const [backendError, setBackendError] = useState(null);
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
    checkHealth().then(res => {
      const isOk = res.status === 'online';
      setBackendOnline(isOk);
      if (!isOk) {
        setBackendError(res.error || 'Failed connecting to API base URL');
      } else {
        setBackendError(null);
      }
    });
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

  const getCanvasBlob = (canvas) => {
    return new Promise(resolve => {
      try {
        const maxDim = 640;
        let w = canvas.width || 640;
        let h = canvas.height || 480;

        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0, w, h);

        tempCanvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
      } catch (e) {
        resolve(null);
      }
    });
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

    try {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await getCanvasBlob(canvas);
        if (blob) {
          const res = await analyzeImageBlob(blob, true);
          handleDetectionResponse(res, canvas, ctx);
        } else {
          handleNoDetectionResponse();
        }
      } else {
        handleNoDetectionResponse();
      }
    } catch (err) {
      console.error("Detection execution error:", err);
      handleNoDetectionResponse();
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle uploaded image file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsDetecting(true);

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const blob = await getCanvasBlob(canvas);
        if (blob) {
          const res = await analyzeImageBlob(blob, true);
          handleDetectionResponse(res, canvas, ctx);
        } else {
          handleNoDetectionResponse();
        }
      } catch (err) {
        console.error("File detection error:", err);
        handleNoDetectionResponse();
      } finally {
        setIsDetecting(false);
      }
    };
    img.onerror = () => {
      setIsDetecting(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDetectionResponse = (res, canvas, ctx) => {
    if (!res || !res.detections || res.detections.length === 0) {
      handleNoDetectionResponse();
      return;
    }

    setCurrentFrameResults(res);
    drawBoundingBoxes(ctx, res.detections, canvas.width, canvas.height);

    const primaryDetection = res.detections[0];
    if (primaryDetection) {
      announceDetection(primaryDetection);
    }
  };

  const handleNoDetectionResponse = () => {
    const noObjMessage = NO_OBJECT_TRANSLATIONS[selectedLang] || NO_OBJECT_TRANSLATIONS.en;
    const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];

    setCurrentFrameResults({
      detections: [],
      risk_score: 0,
      risk_level: 'NORMAL',
      message: noObjMessage
    });

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    speechService.triggerVibration([200]);

    if (autoSpeak) {
      speechService.speak(noObjMessage, currentLangObj.code, true);
    }
  };

  const announceDetection = (detection) => {
    const clsName = detection.class_name || detection.class;
    const translation = getObjectTranslation(clsName, selectedLang);
    const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];

    speechService.triggerVibration([100, 50, 100]);

    const announcementPhrases = {
      en: `${translation.translatedName} detected.`,
      kn: `${translation.translatedName} ಪತ್ತೆಯಾಗಿದೆ.`,
      te: `${translation.translatedName} గుర్తించబడింది.`,
      ta: `${translation.translatedName} கண்டறியப்பட்டது.`,
      ml: `${translation.translatedName} കണ്ടെത്തി.`
    };
    const announcementText = announcementPhrases[selectedLang] || announcementPhrases.en;

    if (autoSpeak) {
      speechService.speak(announcementText, currentLangObj.code, true);
    }

    setDetectionLogs(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        class: clsName,
        translatedName: translation.translatedName,
        englishName: translation.englishName,
        emoji: translation.emoji,
        confidence: detection.confidence,
        position: detection.position || 'CENTER',
        lang: currentLangObj.name
      },
      ...prev.slice(0, 49)
    ]);
  };

  const drawBoundingBoxes = (ctx, detections, imgW, imgH) => {
    detections.forEach(d => {
      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      if (Array.isArray(d.bbox)) {
        [x1, y1, x2, y2] = d.bbox;
      } else if (d.bbox && typeof d.bbox === 'object') {
        x1 = d.bbox.x1 || 0;
        y1 = d.bbox.y1 || 0;
        x2 = d.bbox.x2 || 0;
        y2 = d.bbox.y2 || 0;
      }
      const width = x2 - x1;
      const height = y2 - y1;

      const clsName = d.class_name || d.class;
      const translation = getObjectTranslation(clsName, selectedLang);
      const strokeColor = '#06b6d4';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, width, height);

      const confPct = (d.confidence * 100).toFixed(1);
      const labelText = `${translation.emoji} ${translation.translatedName.toUpperCase()} ${confPct}%`;
      ctx.font = 'bold 15px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = strokeColor;
      ctx.fillRect(x1, y1 > 28 ? y1 - 28 : y1, textWidth + 14, 28);

      ctx.fillStyle = '#0f172a';
      ctx.fillText(labelText, x1 + 7, y1 > 28 ? y1 - 9 : y1 + 19);
    });
  };

  const primaryDet = currentFrameResults?.detections?.[0];
  const primaryTranslation = primaryDet ? getObjectTranslation(primaryDet.class_name || primaryDet.class, selectedLang) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER BAR */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white flex items-center space-x-2">
                <span>DRISHTI AI</span>
                <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold px-2 py-0.5 rounded-full">v1.0 REAL</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Assistive Vision for Visually Impaired Users</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full border ${
              backendOnline ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/80 border-rose-500/50 text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span>{backendOnline ? 'Backend connected' : 'Backend not connected'}</span>
            </div>

            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 transition"
              title="Upload photo for object detection"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 sticky top-[73px] z-40">
        <div className="max-w-4xl mx-auto flex space-x-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'home', label: 'Home Dashboard', icon: Eye },
            { id: 'language', label: 'Language', icon: Globe },
            { id: 'history', label: 'Detection History', icon: History },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'demo', label: 'Evaluation', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto w-full p-4 flex-1 space-y-6">

        {/* BACKEND DISCONNECTED ALERT */}
        {!backendOnline && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl flex items-start space-x-3 text-rose-200 text-xs">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-300">Backend Connection Error</p>
              <p>Target URL: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-cyan-300">{API_BASE_URL}</code></p>
              {backendError && <p className="mt-1 text-slate-400 font-mono">Detail: {backendError}</p>}
            </div>
          </div>
        )}

        {/* CAMERA ERROR ALERT */}
        {cameraError && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl flex items-start space-x-3 text-rose-200 text-xs">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-300">Camera Notice</p>
              <p>{cameraError}</p>
            </div>
          </div>
        )}

        {/* 1. HOME DASHBOARD TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* LIVE CAMERA VIEWER & DETECT PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-cyan-400" />
                  <span className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                    MOBILE CAMERA FRAME (ENVIRONMENT REAR CAMERA)
                  </span>
                </div>
                <button
                  onClick={switchCameraFacing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-cyan-400 flex items-center space-x-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>FLIP CAMERA</span>
                </button>
              </div>

              {/* CAMERA VIDEO & DRAWING CANVAS */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {!isWebcamActive && (
                  <div className="text-center p-6 space-y-3">
                    <Smartphone className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-400 font-medium text-sm">Camera stream is paused.</p>
                    <button
                      onClick={toggleWebcam}
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
                    >
                      START ENVIRONMENT CAMERA
                    </button>
                  </div>
                )}
              </div>

              {/* HUGE DETECT OBJECT BUTTON (~45% HEIGHT AREA) */}
              <button
                onClick={triggerObjectDetection}
                disabled={isDetecting}
                className={`w-full py-8 sm:py-10 rounded-3xl font-black text-2xl sm:text-3xl tracking-wider uppercase transition shadow-2xl flex items-center justify-center space-x-4 border-2 ${
                  isDetecting
                    ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                    : primaryDet
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-cyan-300 text-slate-950 shadow-cyan-500/30'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400 text-white shadow-cyan-500/20'
                }`}
              >
                <Eye className="w-9 h-9 sm:w-11 sm:h-11" />
                <span>
                  {isDetecting
                    ? 'DETECTING...'
                    : primaryDet
                    ? 'OBJECT DETECTED 🔍'
                    : currentFrameResults?.message
                    ? 'NO OBJECT DETECTED 🔍'
                    : 'DETECT OBJECT 🔍'}
                </span>
              </button>

              {/* DETECTION RESULTS PANEL */}
              {currentFrameResults && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  {primaryDet ? (
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{primaryTranslation.emoji}</span>
                        <div>
                          <h2 className="text-2xl font-black text-cyan-400 tracking-tight">
                            {primaryTranslation.translatedName}
                          </h2>
                          <p className="text-xs text-slate-400 font-bold">
                            {primaryTranslation.englishName} ({selectedLang.toUpperCase()})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-emerald-400">
                          {(primaryDet.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest">
                          CONFIDENCE
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                      <p className="font-extrabold text-amber-400 text-base">
                        {currentFrameResults.message || 'No object detected. Please adjust the camera.'}
                      </p>
                    </div>
                  )}

                  {/* MULTIPLE DETECTED OBJECTS LIST */}
                  {currentFrameResults.detections && currentFrameResults.detections.length > 1 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Detected Objects:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentFrameResults.detections.map((det, idx) => {
                          const trans = getObjectTranslation(det.class_name || det.class, selectedLang);
                          return (
                            <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200">{trans.emoji} {trans.translatedName}</span>
                              <span className="font-extrabold text-emerald-400">{(det.confidence * 100).toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                      <td className="p-3 font-bold text-emerald-400">{(log.confidence * 100).toFixed(1)}%</td>
                      <td className="p-3 font-bold text-slate-400">{log.lang}</td>
                    </tr>
                  ))}
                  {detectionLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
                        No detection history yet. Point camera and tap DETECT OBJECT to perform real detection.
                      </td>
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

        {/* 5. DEMO & EVALUATION SECTION */}
        {activeTab === 'demo' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  <span>CAMERA EVALUATION MODE</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Tap DETECT OBJECT below or upload a photo to evaluate real model inference.</p>
              </div>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1 rounded-lg">100% REAL AI</span>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
              <Eye className="w-12 h-12 text-cyan-400 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">
                Point your mobile camera at any object or upload an image to run real YOLO detection.
              </p>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
              >
                UPLOAD PHOTO FOR REAL INFERENCE
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
