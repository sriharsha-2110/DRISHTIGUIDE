# DRISHTIGUIDE AI — System Architecture & Data Flow

## Hardware & Deployment Concept
DRISHTIGUIDE AI is an assistive computer vision system designed to function hardware-independently. 

```
Smart Glasses Camera / Mobile Camera / Laptop Webcam / Uploaded Video
                           │
                           ▼
                  Smartphone Web App
           (navigator.mediaDevices.getUserMedia)
                           │
               HTTP POST /api/analyze (JSON)
                           │
                           ▼
                 FastAPI Backend (Render)
      ┌────────────────────┴────────────────────┐
      ▼                                         ▼
Ultralytics YOLOv8                       Spatial Analyzer
(Object Detection)                    (Position & Distance)
      │                                         │
      └────────────────────┬────────────────────┘
                           ▼
                 Temporal State Tracker
           (Movement Vector: APPROACHING, etc.)
                           │
                           ▼
                  Dynamic Risk Engine
               (Risk Score 0-100 & Level)
                           │
                           ▼
            Intelligent Priority Engine
           (CRITICAL > IMPORTANT > INFO)
                           │
                           ▼
           Short Speech Phrasing Generator
                           │
                           ▼
                 Smartphone Web App
                           │
              Web Speech API (window.speechSynthesis)
                           │
                           ▼
               Bluetooth Earphones / Earbuds
```

## System Components
1. **Camera Module**: Captures 640x480 environment video frames at 4-second routine intervals (or immediate on movement).
2. **AI Inference Backend**: Python FastAPI service running lightweight YOLO object detection, temporal state tracking, spatial position calculations, and dynamic risk scoring.
3. **Guidance Priority Engine**: Eliminates audio overload by prioritizing critical hazards (approaching vehicles, fall risks) over routine stationary background obstacles.
4. **Earphone Speech Output**: Converts prioritized text instructions into clear, short audio spoken via connected earbuds.
5. **Technical Research Dashboard**: Provides real-time telemetry, model metrics (mAP, Precision, Recall), confusion matrix analysis, and step-by-step AI decision explanation for developers and faculty evaluators.
