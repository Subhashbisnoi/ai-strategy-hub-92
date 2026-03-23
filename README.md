# FinCRM AI — AI-Powered Financial Intelligence & Procurement Platform

> A full-stack, multi-agent AI platform for electronics retailers and SMBs — combining real-time financial analytics, quantum-inspired inventory optimization, automated invoicing, and an end-to-end agentic procurement pipeline.

**Live Demo:** [collabup.live](https://www.collabup.live) &nbsp;|&nbsp; **Backend API:** [ai-strategy-hub-92.onrender.com](https://ai-strategy-hub-92.onrender.com/api/health)

---

## Features

### Financial Dashboard
- Revenue, expenses, profit trends (12-month area charts)
- Category-wise breakdown and product performance rankings
- Multi-axis business health radar (profitability, liquidity, efficiency, growth, inventory)

### AI-Powered Invoice Management
- **4 input modes:** Manual entry, PDF upload (GPT-4o vision), plain English text, voice (Groq Whisper)
- GST-compliant auto-calculation with customer management
- Receivables aging, payment tracking, and AI-generated payment reminders

### Quantum-Inspired Inventory Optimization (QUBO)
- QUBO matrix formulation with simulated annealing solver
- Per-SKU decisions: BUY_NOW, DEFER, or OVERSTOCK with urgency levels
- Budget and capacity constraints with side-by-side QUBO vs EOQ comparison

### Price & Demand Forecasting
- Holt-Winters exponential smoothing for revenue, demand, and price prediction
- Per-SKU historical trends with 6-month forward projections and confidence intervals
- Seasonality analysis

### A2P Payment Protocol (Agent-to-Payment)
- Purchase Order creation with risk-based approval workflows
- Auto-approve < ₹10K, manual review for ₹50K+, auto-reject > ₹1L
- Payment execution with simulated callbacks and full audit trail

### Agentic Orchestrator
- 7-step autonomous pipeline: Forecast → QUBO Optimize → PO Creation → Risk Assessment → Approval → Payment → Dispatch
- Real-time step-by-step progress visualization

### AI Insights & Chatbot
- GPT-4o mini generates 4 strategic recommendations (growth, cost, product) with confidence scores
- Context-aware chatbot with live database access for real-time Q&A

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vercel)                  │
│  React 18 + TypeScript + TailwindCSS + Recharts     │
│  /api/* ──rewrites──→ Render Backend                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Backend (Render)                     │
│  FastAPI + SQLAlchemy + 10 AI Agents                 │
│                                                      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Aggregation  │ │  Analytics   │ │  Inventory   │  │
│  │  (GPT-4o)   │ │  (KPIs)      │ │  (EOQ/Stock) │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Invoice    │ │ Forecasting  │ │Recommendation│  │
│  │  (Vision)   │ │(Holt-Winters)│ │  (GPT-4o)    │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │QUBO Solver  │ │ Quantum Inv  │ │ A2P Payment  │  │
│  │  (SA)       │ │ Optimization │ │  Protocol    │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
│  ┌──────────────────────────────────────────────┐    │
│  │           Orchestrator (7-step pipeline)      │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  PostgreSQL (Neon)      │
          │  SQLite (local dev)     │
          └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Radix UI, Recharts, Framer Motion, React Query |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic, Uvicorn |
| **AI/ML** | OpenAI GPT-4o mini (classification, vision, recommendations), Groq Whisper (speech-to-text), Statsmodels (Holt-Winters), Custom QUBO solver (simulated annealing) |
| **Database** | PostgreSQL (Neon) in production, SQLite locally |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Local Development

```bash
# Clone
git clone https://github.com/Subhashbisnoi/ai-strategy-hub-92.git
cd ai-strategy-hub-92

# Frontend
npm install
npm run dev          # http://localhost:8080

# Backend (new terminal)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

Create a `.env` in the project root:

```env
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
# DATABASE_URL=postgresql://...  (optional — omit for SQLite locally)
```


---

## API Endpoints

<details>
<summary>Click to expand all 30+ endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Demo login with pre-seeded data |
| POST | `/api/sessions` | Create fresh session |
| GET | `/api/health` | Health check |
| POST | `/api/aggregation/process` | Classify transactions via GPT |
| POST | `/api/aggregation/upload` | Upload CSV bank statement |
| GET | `/api/analytics/summary` | Revenue/expense/profit KPIs |
| GET | `/api/analytics/monthly` | Monthly trend data |
| GET | `/api/analytics/products` | Product performance |
| GET | `/api/analytics/hero` | MVP product analysis |
| GET | `/api/analytics/health-score` | Business health radar |
| GET | `/api/inventory` | All inventory items |
| GET | `/api/inventory/alerts` | Low-stock alerts |
| GET | `/api/inventory/optimise` | EOQ recommendations |
| POST | `/api/inventory` | Add inventory item |
| PATCH | `/api/inventory/stock` | Update stock |
| POST | `/api/inventory/draft-po` | Draft purchase order |
| GET | `/api/invoices` | All invoices |
| POST | `/api/invoices` | Create invoice |
| POST | `/api/invoices/extract` | Extract from PDF/image/text |
| GET | `/api/invoices/dashboard` | Invoice KPIs |
| GET | `/api/invoices/aging` | Receivables aging |
| PATCH | `/api/invoices/{id}/pay` | Mark invoice paid |
| POST | `/api/invoices/{id}/reminder` | AI payment reminder |
| GET | `/api/forecast/revenue` | Revenue forecast |
| GET | `/api/forecast/price` | Price forecast by SKU |
| POST | `/api/qubo/optimize` | Run QUBO solver |
| GET | `/api/qubo/compare` | QUBO vs EOQ comparison |
| POST | `/api/orchestrator/run` | Full 7-step pipeline |
| GET | `/api/orchestrator/status` | Pipeline status |
| POST | `/api/chat` | AI chatbot |
| POST | `/api/speech-to-text` | Voice transcription |

</details>

---

## Deployment

**Frontend** → Vercel (auto-deploys from `main` branch, rewrites `/api/*` to Render)

**Backend** → Render (Python 3.11, `render.yaml` included)

**Database** → Neon PostgreSQL (connection pooling, set `DATABASE_URL` env var on Render)

---

## Project Structure

```
├── src/                    # React frontend
│   ├── components/crm/     # 9 CRM panels (Dashboard, Invoices, QUBO, A2P, etc.)
│   ├── components/home/    # Landing page sections
│   ├── pages/              # Routes (Login, Demo, About, Contact, etc.)
│   └── api/                # API base config
├── backend/                # FastAPI backend
│   ├── agents/             # 10 AI agents (analytics, forecasting, QUBO, A2P, etc.)
│   ├── main.py             # Routes & session seeding
│   ├── models.py           # SQLAlchemy models (12 tables)
│   └── database.py         # SQLite/PostgreSQL auto-switching
├── data/                   # Sample datasets (retail, F&B, SaaS, services)
├── vercel.json             # Frontend deployment config
└── render.yaml             # Backend deployment config
```

---

Built by [CollabUp](https://www.collabup.live) — AI infrastructure for businesses that move fast.

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
