# 🏙️ SmartCity.OS — AI-Powered Civic Grievance Management System

> An intelligent, real-time civic grievance platform built for Tamil Nadu municipalities. Citizens report infrastructure issues via an interactive map, and the system uses **Google Gemini AI** to auto-triage, classify, and route complaints to the correct department — all monitored through a tactical admin dashboard.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js) ![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite) ![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-orange?logo=google)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [AI Triage Engine](#-ai-triage-engine)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## ✨ Features

### 🧑‍💻 Citizen Portal (`/`)
- **Multi-Step Grievance Form** — 3-phase guided flow: Identity → Location → Complaint Details
- **Interactive Tamil Nadu Map** — OpenStreetMap-powered map locked to Tamil Nadu state boundaries with village-level detail
- **GPS Auto-Detection** — "Use My Location" button with smooth fly-to animation and reverse geocoding
- **Draggable Pin** — Drop and drag a marker to pinpoint the exact issue location
- **Auto-Fill Intelligence** — Pin drops automatically resolve village, district, area, and pincode
- **Voice Input Support** — Multi-language voice recording for complaint text (English/Tamil/Hinglish)
- **Real-Time Ticket Tracking** — Track complaint status with a visual progress stepper
- **Anonymous Reporting** — Citizens can file complaints without revealing their identity

### 🛡️ Admin Tactical Dashboard (`/admin`)
- **KPI Command Cards** — Real-time stats: Total, Open, In-Progress, and Resolved grievances
- **Critical Incident Pipeline** — Pulsing red SLA-breach warnings for tickets expiring within 4 hours
- **Geospatial Heatmap** — Dark tactical map with color-coded pin markers across all Tamil Nadu cities
  - 🔴 Red Pins → Critical priority (Score ≥ 8 or SLA at risk)
  - 🔵 Indigo Pins → Standard priority
- **Department Distribution Charts** — Visual breakdown of complaints by department
- **Case Intelligence Modal** — Detailed ticket view with:
  - AI Neural Interpretation (Triage Note)
  - Exact SLA Deadline with breach countdown
  - Citizen profile and incident location metadata
  - One-click lifecycle status updates (Open → Processing → Resolved)
- **Auto-Refresh** — Dashboard polls every 10 seconds for live data
- **Resilient Fetching** — Uses `Promise.allSettled` so partial API failures don't crash the HUD

### 🤖 AI Triage Engine
- **Powered by Google Gemini 2.0 Flash** for real-time complaint analysis
- **Multi-Language Support** — Processes English, Hinglish, and transliterated Tamil
- **Auto-Classification** — Routes to: Roads, Water, Electricity, Sanitation, or General
- **Priority Scoring** — 1-10 scale with automatic severity labeling (Critical/High/Medium/Low)
- **SLA Assignment** — Critical = 2-4 hours, Standard = 24-48 hours
- **Safe-Fail Mechanism** — If AI is unavailable, system assigns intelligent defaults (never loses data)

### 🔒 Data Integrity
- **Ghost Ticket Prevention** — Resolved tickets automatically clear SLA breach flags
- **Proactive SLA Monitoring** — Pre-calculated breach warnings for instant dashboard detection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Maps** | Leaflet + React-Leaflet (OpenStreetMap tiles) |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite 3 (file-based, zero-config) |
| **AI Engine** | Google Gemini 2.0 Flash API |
| **Geocoding** | Nominatim (OpenStreetMap reverse geocoding) |
| **Icons** | Lucide React |

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTP      ┌──────────────────┐     SQL      ┌──────────┐
│  React Frontend │ ◄───────────► │  Express Backend │ ◄──────────► │  SQLite  │
│  (Vite :5173)   │               │   (Node :5000)   │              │   .db    │
└────────┬────────┘               └────────┬─────────┘              └──────────┘
         │                                 │
         │ Leaflet Maps                    │ Gemini API
         ▼                                 ▼
┌─────────────────┐              ┌──────────────────┐
│  OpenStreetMap   │              │  Google Gemini   │
│  Tile Server     │              │  2.0 Flash       │
└─────────────────┘              └──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **Google Gemini API Key** (get one at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pro-1

# ── Backend Setup ──
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your Gemini API key:
#   GEMINI_API_KEY=your_key_here

# Seed the database with Tamil Nadu demo data
node seed.js

# Start the backend server
node index.js
# → Server running at http://localhost:5000

# ── Frontend Setup (new terminal) ──
cd ../frontend
npm install

# Start the development server
npm run dev
# → Frontend running at http://localhost:5173
```

### Access Points
| Portal | URL |
|--------|-----|
| 🧑‍💻 Citizen Portal | http://localhost:5173/ |
| 🛡️ Admin Dashboard | http://localhost:5173/admin |
| 📊 Analytics API | http://localhost:5000/api/grievances/dashboard |

---

## 📁 Project Structure

```
pro-1/
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AllComplaintsTable.jsx    # Full grievance data table
│   │   │   ├── CriticalQueueTable.jsx   # SLA-breach incident table
│   │   │   ├── GrievanceChart.jsx       # Department distribution chart
│   │   │   ├── KPICards.jsx             # Analytics stat cards
│   │   │   ├── LiveMap.jsx              # Admin tactical geospatial map
│   │   │   ├── MapPicker.jsx            # Citizen Tamil Nadu pin-drop map
│   │   │   └── TicketDetailModal.jsx    # Case intelligence detail view
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx       # Admin tactical HUD
│   │   │   └── CitizenPage.jsx          # Citizen complaint & tracking portal
│   │   ├── App.jsx                      # Route definitions
│   │   └── index.css                    # Global design system
│   └── package.json
│
├── backend/                     # Express Backend
│   ├── index.js                # API routes & server entry
│   ├── database.js             # SQLite queries & schema
│   ├── ai.js                   # Gemini AI triage engine
│   ├── seed.js                 # Tamil Nadu demo data seeder
│   ├── .env.example            # Environment template
│   └── package.json
│
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/complaint` | Submit a new grievance (triggers AI triage) |
| `GET` | `/complaints` | List all grievances |
| `GET` | `/complaint/:id` | Get a specific ticket by ID |
| `PATCH` | `/complaint/:id` | Update ticket status (auto-clears SLA flags on RESOLVED) |
| `GET` | `/api/grievances/dashboard` | Analytics: counts + critical queue |

### Example: Submit a Complaint
```json
POST /complaint
{
  "text": "Broken road near temple junction",
  "citizen_name": "Karthik M",
  "citizen_phone": "9876543210",
  "area": "Madurai South",
  "locality": "Temple Area",
  "category": "Road and Footpath",
  "location": "9.9195,78.1193"
}
```

### Response
```json
{
  "message": "Complaint registered",
  "data": {
    "ticket_id": "TKT-A1B2C3",
    "department": "Roads",
    "priority_score": 7,
    "severity_label": "High",
    "estimated_resolution_time": "24 Hours",
    "normalized_text": "AI Processed: Road damage near temple junction..."
  }
}
```

---

## 🧠 AI Triage Engine

The system uses **Google Gemini 2.0 Flash** with a structured prompt to:

1. **Classify** the complaint into a department (Roads, Water, Electricity, Sanitation)
2. **Score** urgency on a 1-10 scale
3. **Generate** a citizen-friendly acknowledgment message
4. **Assign** SLA timelines based on severity

### Fallback Mechanism
If the AI API is unreachable, the system gracefully degrades:
- Department → `General`
- Priority → `5` (Medium)
- SLA → `48 Hours`
- No complaint data is ever lost

---

## 🗺️ Map Features

### Citizen Map (MapPicker)
- **Tile Layer**: OpenStreetMap (village-level detail)
- **Bounds**: Hard-locked to Tamil Nadu (`[8.0°N–13.6°N, 76.0°E–80.5°E]`)
- **Pin**: Draggable blue marker with auto reverse-geocoding
- **GPS**: Browser geolocation with smooth fly-to animation

### Admin Map (LiveMap)
- **Tile Layer**: CartoDB Dark Matter (tactical theme)
- **Markers**: Custom SVG pin icons (Red = Critical, Blue = Nominal)
- **Popups**: Ticket ID, department, response time, and description
- **Bounds**: Locked to Tamil Nadu state

---

## 🎨 Design Philosophy

- **Tactical Aesthetic**: Dark themes with indigo/rose accent palette
- **Typography**: Uppercase tracking, monospace ticket IDs, weighted hierarchy
- **Micro-Animations**: Slide-in cards, pulsing indicators, scale transitions
- **Glass Morphism**: Frosted glass cards with subtle borders
- **Responsive**: Fully functional on desktop and tablet viewports

---

## 📊 Demo Data

The seeder includes **15 realistic grievances** across major Tamil Nadu cities:

| City | Department | Priority |
|------|-----------|----------|
| Chennai (T. Nagar) | Sanitation | 🔴 Critical (10) |
| Madurai | Water Supply | 🔴 Critical (10) |
| Coimbatore (RS Puram) | Electricity | 🔴 Critical (9) |
| Thanjavur | Roads | High (7) |
| Salem | Sanitation | High (6) |
| Tiruchirappalli | Electricity | Medium (5) |
| Vellore | Roads | Medium (4) |
| Erode | Sanitation | High (6) |
| Tirunelveli | Sanitation | Medium (5) |
| Kanyakumari | Water Supply | High (7) |
| Thoothukudi | Roads | High (8) |
| Dindigul | Water Supply | Low (3) |
| Nagapattinam | Sanitation | High (6) |
| Karaikudi | Roads | Medium (4) |
| Hosur | Sanitation | High (7) |

---

## 🏆 Built For

**Tensor Hackathon 2026** — Smart City Track

---

## 👥 Team

Built with ❤️ for a smarter Tamil Nadu.

---

## 📄 License

This project is built for hackathon demonstration purposes.
