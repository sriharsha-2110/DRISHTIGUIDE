# DRISHTI AI
> **"Multilingual AI-Powered Assistive Vision System for Visually Impaired Users"**

---

## 👁️ Project Overview
**Drishti AI** is a multilingual computer-vision assistance system designed to empower visually impaired users to recognize everyday objects and navigation landmarks in their environment.

A smartphone camera captures visual frames, while a lightweight YOLO deep learning model detects objects. Upon pressing a prominent, high-contrast **`DETECT OBJECT 🔍`** button, the system translates the identified object into 1 of 5 supported Indian languages (**English 🇬🇧, Kannada 🇮🇳, Telugu 🇮🇳, Tamil 🇮🇳, Malayalam 🇮🇳**) and speaks the translated name aloud via Text-to-Speech (TTS) to connected Bluetooth earbuds.

---

## 📦 20 Target Everyday & Navigation Objects

| ID | Object Name | Emoji | Example Use Case |
|---|---|---|---|
| 0 | Bottle | 🍾 | Hydration / Tableware |
| 1 | Cup | ☕ | Beverage / Kitchen |
| 2 | Mobile Phone | 📱 | Personal Device |
| 3 | Book | 📖 | Reading / Study |
| 4 | Chair | 🪑 | Furniture / Seating |
| 5 | Laptop | 💻 | Work / Electronics |
| 6 | Pen | 🖊️ | Writing Instrument |
| 7 | Keys | 🔑 | Personal Belongings |
| 8 | Backpack | 🎒 | Storage / Travel |
| 9 | Water Glass | 🥛 | Tableware |
| 10 | Plate | 🍽️ | Tableware |
| 11 | Spoon | 🥄 | Tableware |
| 12 | Shoes | 👟 | Wearable / Footwear |
| 13 | Clock | ⏰ | Time keeping |
| 14 | Remote | 📺 | Electronics |
| 15 | Keyboard | ⌨️ | Electronics |
| 16 | Mouse | 🖱️ | Electronics |
| 17 | Sunglasses | 🕶️ | Wearable |
| 18 | Umbrella | ☂️ | Travel / Weather |
| 19 | Helmet | 🪖 | Safety Gear |

---

## 🌐 5-Language Multilingual Dictionary Matrix

| Object | English 🇬🇧 | Kannada 🇮🇳 (ಕನ್ನಡ) | Telugu 🇮🇳 (తెలుగు) | Tamil 🇮🇳 (தமிழ்) | Malayalam 🇮🇳 (മലയാളം) |
|---|---|---|---|---|---|
| **Bottle** | Bottle | ಬಾಟಲಿ | బాటిల్ | பாட்டில் | കുപ്പി |
| **Cup** | Cup | ಕಪ್ | కప్ | கப் | കപ്പ് |
| **Mobile Phone** | Mobile Phone | ಮೊಬೈಲ್ ಫೋನ್ | మొబైల్ ఫోన్ | மொபைல் போன் | മൊബൈൽ |
| **Book** | Book | ಪುಸ್ತಕ | పుస్తకం | புத்தகம் | പുസ്തകം |
| **Chair** | Chair | ಕುರ್ಚಿ | కుర్చీ | நாற்காலி | കസേര |
| **Laptop** | Laptop | ಲ್ಯಾಪ್‌ಟಾಪ್ | ల్యాప్‌టాప్ | லேப்டாப் | ലാപ്‌ടോപ്പ് |
| **Pen** | Pen | ಪೆನ್ | పెన్ | பேனா | പേന |
| **Keys** | Keys | ಕೀಲಿಗಳು | తాళంచెవులు | சாவி | താക്കോലുകൾ |
| **Backpack** | Backpack | ಬ್ಯಾಕ್‌ಪ್ಯಾಕ್ | బ్యాక్‌ప్యాక్ | பயணப் பை | ബാഗ് |
| **Water Glass** | Water Glass | ನೀರಿನ ಲೋಟ | గ్లాస్ | தண்ணீர் டம்ளர் | ഗ്ലാസ് |
| **Plate** | Plate | ತಟ್ಟೆ | ప్లేట్ | தட்டு | പ്ലേറ്റ് |
| **Spoon** | Spoon | ಚಮಚ | స్పూన్ | கரண்டி | സ്പൂൺ |
| **Shoes** | Shoes | ಶೂಗಳು | షూస్ | காலணிகள் | ഷൂസ് |
| **Clock** | Clock | ಗಡಿಯಾರ | గడియారం | கடிகாரம் | ക്ലോക്ക് |
| **Remote** | Remote | ರಿಮೋಟ್ | రిమోట్ | ரிமோட் | റിമോട്ട് |
| **Keyboard** | Keyboard | ಕೀಬೋರ್ಡ್ | కీబోర్డ్ | விசைப்பலகை | കീബോർഡ് |
| **Mouse** | Mouse | ಮೌಸ್ | మౌస్ | மவுஸ் | മൗസ് |
| **Sunglasses** | Sunglasses | ಸನ್ಗ್ಲಾಸ್ | సన్‌గ్లాసెస్ | சூரியக் கண்ணாடி | സൺഗ്ലാസ് |
| **Umbrella** | Umbrella | ಛತ್ರಿ | గొడుగు | குடை | കുട |
| **Helmet** | Helmet | ಹೆಲ್ಮೆಟ್ | హెల్మెట్ | ஹெல்மெட் | ഹെൽമെറ്റ് |

---

## 📱 Mobile-First Accessible UI Sections

1. 🏠 **Home**: Live Camera Viewport + **HUGE DETECT OBJECT 🔍** button (~40-50% height) + Last Detection Card showing Emoji, Translated Name, Confidence %, Position, and `🔊 Speak Result`.
2. 🌐 **Language Selector**: English 🇬🇧, Kannada 🇮🇳, Telugu 🇮🇳, Tamil 🇮🇳, Malayalam 🇮🇳.
3. 📊 **Detection History**: Log table of past detections with timestamps, emojis, confidence %, and language spoken.
4. ⚙️ **Settings**: Voice speed slider (0.5x – 1.5x), voice volume slider, vibration toggle, auto-speak toggle.
5. 🧪 **Demo Mode**: Offline scenario buttons (Bottle, Cup, Mobile, Book, Chair, Laptop, Stairs, Vehicle) for college evaluation.

---

## ⚙️ How to Run Locally

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
Open **[http://localhost:5173](http://localhost:5173)** on your laptop browser.

---

## ☁️ How to Deploy on Render

### Backend Deployment (Render Web Service)
1. Sign up / Log into [Render.com](https://render.com).
2. Create **New Web Service** and link your GitHub repository.
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Render URL: `https://drishtiguide-backend.onrender.com`

### Frontend Deployment (Vercel / Netlify / Render Static Site)
1. Environment Variable: `VITE_API_URL` = `https://drishtiguide-backend.onrender.com`
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
