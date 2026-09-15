# DRISHTIGUIDE AI
> **"Let AI Be Your Eyes."**  
> *DrishtiGuide AI: A Deep Learning-Based Visual Assistance System for Visually Impaired People*

---

## 👁️ Project Overview
**DrishtiGuide AI** is a Deep Learning-based visual assistance prototype designed to help visually impaired users interpret their surroundings through short, context-aware voice instructions. A smartphone camera acts as the prototype equivalent of a camera integrated into smart glasses, while Bluetooth earbuds provide the audio output. The system uses YOLO-based object detection, spatial positioning, approximate proximity estimation and priority-based risk analysis to determine which environmental information should be communicated to the user. A separate laptop dashboard provides dataset visualization, model evaluation metrics, live detection and AI decision explanations.

---

## 📱 Mobile Assistance Workflow
1. User connects Bluetooth earbuds to smartphone.
2. User opens the application on mobile browser and taps **`[ LET'S START THE JOURNEY ]`**.
3. Camera activates in environmental rear-facing mode.
4. Frames are analyzed every ~4 seconds (or immediately on sudden hazards).
5. Earbuds speak short actionable instructions (e.g. *"Person ahead"*, *"Obstacle on your right"*, *"Stairs ahead. Move carefully"*, *"STOP. Vehicle approaching"*).

---

## 💻 Laptop AI Telemetry Dashboard (For Evaluators & Viva)
The laptop dashboard provides 5 specialized technical tabs:
1. **Overview**: Model status (`PRETRAINED MODEL` vs `CUSTOM TRAINED MODEL`), dataset size, active classes count, inference speed, confidence, current risk level, and active spoken guidance.
2. **Dataset**: Dataset gallery filtering by class (`All`, `Person`, `Stairs`, `Door`, `Pothole`, `Vehicle`). Displays *"Dataset not configured."* if unpopulated.
3. **Model Performance**: Displays Precision, Recall, F1, mAP@50, mAP@50-95, FPS, and parameter count from `models/metrics.json`. Displays *"Custom model evaluation not available."* if custom model is not trained.
4. **Live Detection**: Shows live camera/webcam/upload feed with rendered bounding boxes, class, confidence %, horizontal position (`LEFT`, `CENTER`, `RIGHT`), distance (`VERY NEAR`, `NEAR`, `MEDIUM`, `FAR`), risk level, and guidance.
5. **AI Decision ("WHY DID AI GIVE THIS INSTRUCTION?")**: Step-by-step decision audit trace (Object + Position + Distance + Movement + Risk Score $\rightarrow$ Spoken Guidance).

---

## ⚙️ Local Execution Guide

### 1. Start Python FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` on your laptop browser.

---

## 🎬 2-Minute College Demonstration Procedure

1. **Step 1 — Mobile Journey Demo**:
   - Open app on phone browser (or mobile view tab).
   - Point phone camera at surroundings.
   - Tap **`LET'S START THE JOURNEY`**.
   - Show earphone audio delivering short guidance (*"Stairs ahead. Move carefully"*, *"Obstacle on your right"*).

2. **Step 2 — Emergency Priority Override**:
   - Point camera at approaching vehicle or trigger critical test scenario.
   - Show audio immediately overriding routine interval: *"STOP. Vehicle approaching."*

3. **Step 3 — Laptop Technical Telemetry**:
   - Show Evaluator the **Laptop Dashboard**.
   - Navigate through Dataset, Model Specs, Live Bounding Boxes, and the **AI Decision Explanation Panel**.

---

## 🧠 Viva Q&A & Academic Explanation

- **Problem Statement**: Visually impaired navigation suffers from severe audio overload when traditional object-detection systems announce every visible object in sight.
- **Proposed Solution**: DrishtiGuide AI introduces **Intelligent Guidance Prioritization**, continuously answering *"What does the user need to know right now?"* to suppress audio clutter.
- **Deep Learning Model**: YOLO (You Only Look Once) nano object detector.
- **Spatial & Proximity Logic**: Bounding box centroid horizontal position ($x < 33\%$ LEFT, $33-66\%$ CENTER, $>66\%$ RIGHT) and height ratio proximity estimation (`VERY NEAR`, `NEAR`, `MEDIUM`, `FAR`).
- **Dynamic Risk Engine**: 0-100 heuristic scoring mapping to `SAFE`, `CAUTION`, `HIGH`, `CRITICAL`.

---

## ⚠️ Documented Prototype Limitations
- **Approximate Proximity**: Distance estimation relies on 2D bounding box height ratio heuristics rather than hardware depth sensors.
- **Lighting & Camera Dependency**: Detection accuracy is influenced by environmental lighting and phone camera clarity.
- **Not a Certified Medical Device**: Designed strictly as an academic research prototype; not a replacement for primary mobility aids.

---

## ☁️ Render Deployment Instructions

### Backend (Web Service):
1. Connect repository to [Render.com](https://render.com).
2. Set Build Command: `pip install -r backend/requirements.txt`.
3. Set Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Set Env Vars: `MODEL_PATH=yolov8n.pt`, `CONFIDENCE_THRESHOLD=0.45`.

### Frontend (Static Site / Vercel):
1. Set Env Var: `VITE_API_URL=https://your-backend.onrender.com`.
2. Set Build Command: `npm run build` (Root directory `frontend`, Output directory `dist`).
