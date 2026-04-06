# ELMU IT Ticketing System

A full-featured IT helpdesk ticketing system built with React + Vite.

## 🚀 Deploy to Vercel (Step-by-Step)

### Option A — GitHub + Vercel (Recommended)

1. **Upload this folder to GitHub:**
   - Go to github.com → New Repository → name it `elmu-ticketing`
   - Upload ALL files in this folder (keep the folder structure intact)

2. **Deploy on Vercel:**
   - Go to vercel.com → Add New Project
   - Import your GitHub repo
   - **Framework Preset:** Select **Vite**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - Click **Deploy** ✅

### Option B — Vercel CLI

```bash
npm install -g vercel
cd elmu-ticketing
npm install
vercel --prod
```

## 🖥️ Run Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## 📁 File Structure

```
elmu-ticketing/
├── index.html          ← HTML entry point
├── vite.config.js      ← Vite configuration
├── vercel.json         ← Vercel routing config
├── package.json        ← Dependencies
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← Full ticketing app
```
