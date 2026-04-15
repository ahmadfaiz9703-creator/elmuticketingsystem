# ELMU Ticketing — Supabase Database Integration Guide

## Why Supabase?
- Free tier: 500MB database, unlimited API calls
- Has a REST API — works directly from React (no server needed)
- Real-time updates possible later
- Hosted PostgreSQL — your data persists across all users and devices

---

## Step 1 — Create Supabase Project

1. Go to https://supabase.com and sign up (free)
2. Click **"New Project"**
3. Name it `elmu-ticketing`, choose a region close to Malaysia (Singapore)
4. Set a database password (save it)
5. Wait ~2 minutes for it to provision

---

## Step 2 — Create Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Tickets table
create table tickets (
  id text primary key,
  title text not null,
  category text,
  priority text,
  status text,
  assignee text,
  requester text,
  dept text,
  created text,
  updated text,
  sla text,
  tags jsonb default '[]',
  comments jsonb default '[]',
  description text,
  submitted_by_user boolean default false
);

-- Agents / Team table
create table agents (
  id bigint primary key,
  name text not null,
  role text,
  email text,
  dept text,
  status text,
  username text unique,
  password text,
  is_admin boolean default false
);

-- Knowledge base table
create table kb_articles (
  id text primary key,
  title text not null,
  category text,
  content text,
  created_at timestamp default now()
);

-- Allow public read/write (since no auth system yet)
-- In production you'd add Row Level Security (RLS) policies
alter table tickets enable row level security;
alter table agents enable row level security;
alter table kb_articles enable row level security;

create policy "Allow all" on tickets for all using (true) with check (true);
create policy "Allow all" on agents for all using (true) with check (true);
create policy "Allow all" on kb_articles for all using (true) with check (true);
```

---

## Step 3 — Get Your API Keys

In Supabase dashboard → **Settings → API**:
- Copy **Project URL** (looks like `https://xxxx.supabase.co`)
- Copy **anon public** key (long string starting with `eyJ...`)

---

## Step 4 — Add Keys to Vercel

In your Vercel project → **Settings → Environment Variables**, add:

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For local development, create a `.env.local` file in your project root:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 5 — Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Step 6 — Add the integration files

Copy the two files from this package into your `src/` folder:
- `src/supabase.js` — Supabase client setup
- `src/useDB.js` — React hook for all database operations

Then update `src/App.jsx` — replace the top import line:
```js
// BEFORE:
import { useState, useEffect, useRef } from "react";

// AFTER:
import { useState, useEffect, useRef } from "react";
import { useDB } from "./useDB";
```

And replace the Root App state section (see useDB.js for instructions).

---

## Seed Initial Data

After setting up, run this in Supabase SQL Editor to add the default agents:

```sql
insert into agents (id, name, role, email, dept, status, username, password, is_admin) values
(0, 'Admin', 'System Admin', 'admin@elmu.local', 'IT', 'Online', 'admin', 'elmu2026', true),
(1, 'Raj Patel', 'IT Manager', 'raj@elmu.local', 'IT', 'Online', 'raj', 'raj1234', false),
(2, 'Carlos M.', 'Senior IT Agent', 'carlos@elmu.local', 'IT', 'Online', 'carlos', 'carlos1234', false),
(3, 'Sara Lee', 'IT Agent', 'sara@elmu.local', 'IT', 'Online', 'sara', 'sara1234', false),
(4, 'James Okafor', 'IT Agent', 'james@elmu.local', 'IT', 'Away', 'james', 'james1234', false),
(5, 'Nina Cruz', 'Junior Agent', 'nina@elmu.local', 'IT', 'Offline', 'nina', 'nina1234', false);

insert into kb_articles (id, title, category, content) values
('KB-001', 'How to reset your Windows password', 'Account', '1. Press Ctrl+Alt+Del and select Change a password.\n2. Enter your old password, then your new password twice.\n3. If locked out, contact IT with your employee ID.'),
('KB-002', 'VPN Setup Guide – Windows & Mac', 'Network', 'Download the VPN client from the IT portal.\n\nWindows: Run installer as Administrator, server: vpn.elmu.local\nMac: Open .pkg file, use same server and ELMU credentials.'),
('KB-003', 'Configure Outlook on a new device', 'Software', '1. Open Outlook → Add Account\n2. Enter your work email (you@elmu.local)\n3. Select Exchange, server: mail.elmu.local\n4. Log in with your network password.'),
('KB-004', 'Printer troubleshooting steps', 'Hardware', '1. Check printer is on and network-connected.\n2. Windows: Settings → Printers & Scanners → remove and re-add.\n3. Print a test page.\n4. If still offline, restart Print Spooler service.'),
('KB-005', 'How to request new software access', 'Access', 'Submit a ticket under Access category with:\n- Software name and version\n- Business justification\n- Your manager name for approval\n\nIT processes within 2 business days.'),
('KB-006', 'MFA / 2FA Setup Instructions', 'Security', '1. Download Microsoft Authenticator on your phone.\n2. Log in to portal.elmu.local → Security Settings.\n3. Click Set up two-factor authentication.\n4. Scan QR code with Authenticator app.\n5. Enter 6-digit code to verify.');
```
