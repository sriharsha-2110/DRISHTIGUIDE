# DRISHTIGUIDE AI
> **"Let AI Be Your Eyes."**  
> *Full-Stack Deep Learning Assistive Vision & Priority Risk Guidance System*

---

## 👁️ Project Overview
**DRISHTIGUIDE AI** is a production-grade assistive vision prototype designed to empower visually impaired individuals with real-time, non-intrusive, spatial environmental awareness. Utilizing computer vision, temporal movement tracking, heuristic distance estimation, and dynamic risk scoring, the system converts complex camera streams into concise voice instructions delivered straight to connected Bluetooth earphones.

Unlike conventional object-detection systems that continuously announce every visible item ("tree, wall, chair, sky"), DRISHTIGUIDE AI features an **Intelligent Guidance Priority Engine** that answers a single crucial question:
> *"What information does the user actually need to know right now?"*

---

## 🎯 Problem Statement & Motivation
For over 253 million visually impaired people worldwide, independent navigation poses constant challenges from unexpected physical obstacles, staircases, potholes, open drains, and approaching traffic. Existing object-detection projects suffer from **audio clutter and cognitive overload**:
1. **Unfiltered Announcements**: Describing 15 objects simultaneously confuses users during navigation.
2. **Lack of Spatial & Temporal Context**: Knowing an object exists is useless without knowing if it lies directly in the walking path or is moving closer.
3. **Audio Latency & Intrusiveness**: Slow edge processing or continuous repetitive speech prevents timely reactions during sudden dangers.

---

## 💡 Proposed Solution & Main Novelty
DRISHTIGUIDE AI combines computer vision with spatial and temporal risk modeling:
- **Spatial Positioning**: Categorizes bounding box centroids into `LEFT`, `CENTER`, and `RIGHT` walking zones.
- **Approximate Distance**: Estimates proximity (`VERY_NEAR`, `NEAR`, `MEDIUM`, `FAR`) using bounding box dimensions and vertical ground alignment.
- **Temporal Analysis**: Tracks centroids across consecutive frames to detect object movement vectors (`STATIONARY`, `APPROACHING`, `MOVING_AWAY`, `MOVING_LATERALLY`).
- **Dynamic Risk Engine**: Computes a dynamic 0–100 risk score mapped to `SAFE`, `CAUTION`, `HIGH`, or `CRITICAL`.
- **Intelligent Guidance Priority Engine (Core Novelty)**: Prioritizes critical fall risks and approaching vehicles over routine background objects. Enforces speech cooldowns (4 seconds default) and suppresses duplicate repetitions while enabling emergency alerts to interrupt routine audio immediately.

---

## 🏗️ Hardware-Independent Prototype Architecture
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

---

## 📁 Repository Structure
```
drishtiguide-ai/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── config.py         # App configuration & settings
│   │   ├── main.py           # FastAPI entrypoint & router mounts
│   │   ├── detection/        # YOLO detector, preprocessing & temporal tracking
│   │   ├── spatial/          # Position, distance & walking path logic
│   │   ├── risk/             # Dynamic risk engine (0-100 scoring)
│   │   ├── guidance/         # Intelligent priority engine & speech rules
│   │   ├── models/           # YOLO model loader singleton
│   │   └── routes/           # API endpoints (/detect, /analyze, /health, /metrics)
│   ├── tests/                # Pytest unit test suite
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container definition
├── frontend/                 # React (Vite + Tailwind CSS) App
│   ├── src/
│   │   ├── components/
│   │   │   ├── mobile/       # Accessible Mobile View (Screen-reader ready)
│   │   │   ├── dashboard/    # Laptop AI Research Dashboard (9 Telemetry Tabs)
│   │   │   ├── landing/      # Project Vision Landing Page
│   │   │   └── demo/         # Offline Demo Scenario Mode
│   │   ├── services/         # API & Web Speech API integration
│   │   ├── App.jsx           # Main View Switcher
│   │   └── main.jsx
│   └── package.json
├── datasets/                 # YOLO Dataset YAML & Structure
├── training/                 # Training, Validation, Predict & Export scripts
├── docs/                     # Academic documentation & viva scripts
├── render.yaml               # Render Cloud Deployment Spec
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
```

Run backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Unit Tests
Backend test suite verifies spatial rules, distance estimation, risk scores, tracking, speech deduplication, emergency overrides, and API contracts:
```bash
cd backend
pytest tests/test_backend.py -v
```

---

## 🚀 Model Training & Evaluation

Train custom YOLO model on the 23 navigation classes:
```bash
python training/train.py --data datasets/dataset.yaml --epochs 100
```

Evaluate model performance (Precision, Recall, mAP@50, mAP@50-95, FPS):
```bash
python training/validate.py --model yolov8n.pt
```

Export model to ONNX format:
```bash
python training/export.py --model yolov8n.pt --format onnx
```

---

## ☁️ Render Cloud Deployment
1. Connect repository to [Render.com](https://render.com).
2. Create Web Service for backend using `backend/Dockerfile` or `render.yaml`.
3. Deploy frontend static build (`npm run build`) to Vercel/Render with `VITE_API_URL=https://your-backend.onrender.com`.

---

## 🔒 Privacy & Safety Notice
> **Privacy Notice**: Camera frames are processed strictly in-memory for real-time inference and are not permanently stored by default. Facial recognition is not performed.  
> **Academic Disclaimer**: DRISHTIGUIDE AI is an academic research prototype and is not a certified medical, safety, or primary navigation device.

---

## 👥 Authors & Academic Contribution
Developed as an advanced agentic computer vision project for assistive technology.
