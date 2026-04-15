/**
 * useDB — Supabase-backed persistence hook for ELMU Ticketing
 *
 * HOW TO USE IN App.jsx:
 * ─────────────────────────────────────────────────────────────
 * 1. Add this import at the top:
 *      import { useDB } from './useDB'
 *
 * 2. Inside the App() component, replace these lines:
 *
 *    BEFORE:
 *      const [tickets, setTickets] = useState(INITIAL_TICKETS)
 *      const [agents, setAgents] = useState(INITIAL_AGENTS)
 *      const [kbArticles, setKbArticles] = useState(INITIAL_KB)
 *
 *    AFTER:
 *      const { tickets, setTickets, agents, setAgents, kbArticles, setKbArticles, loading } = useDB()
 *
 * 3. Optionally show a loading screen:
 *      if (loading) return <div style={{...}}>Loading...</div>
 *
 * That's it! All saves happen automatically when you call setTickets,
 * setAgents, or setKbArticles — just like before, but now it persists.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ── Fallback initial data (used when Supabase is not configured) ──────────────
const FALLBACK_TICKETS = []
const FALLBACK_AGENTS = [
  { id: 0, name: 'Admin', role: 'System Admin', email: 'admin@elmu.local', dept: 'IT', status: 'Online', username: 'admin', password: 'elmu2026', isAdmin: true },
  { id: 1, name: 'Raj Patel', role: 'IT Manager', email: 'raj@elmu.local', dept: 'IT', status: 'Online', username: 'raj', password: 'raj1234' },
  { id: 2, name: 'Carlos M.', role: 'Senior IT Agent', email: 'carlos@elmu.local', dept: 'IT', status: 'Online', username: 'carlos', password: 'carlos1234' },
  { id: 3, name: 'Sara Lee', role: 'IT Agent', email: 'sara@elmu.local', dept: 'IT', status: 'Online', username: 'sara', password: 'sara1234' },
  { id: 4, name: 'James Okafor', role: 'IT Agent', email: 'james@elmu.local', dept: 'IT', status: 'Away', username: 'james', password: 'james1234' },
  { id: 5, name: 'Nina Cruz', role: 'Junior Agent', email: 'nina@elmu.local', dept: 'IT', status: 'Offline', username: 'nina', password: 'nina1234' },
]
const FALLBACK_KB = []

// ── Helpers: map DB snake_case ↔ app camelCase ────────────────────────────────
const ticketFromDB = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  priority: row.priority,
  status: row.status,
  assignee: row.assignee,
  requester: row.requester,
  dept: row.dept,
  created: row.created,
  updated: row.updated,
  sla: row.sla,
  tags: row.tags || [],
  comments: row.comments || [],
  description: row.description || '',
  submittedByUser: row.submitted_by_user || false,
})

const ticketToDB = (t) => ({
  id: t.id,
  title: t.title,
  category: t.category,
  priority: t.priority,
  status: t.status,
  assignee: t.assignee,
  requester: t.requester,
  dept: t.dept,
  created: t.created,
  updated: t.updated,
  sla: t.sla,
  tags: t.tags || [],
  comments: t.comments || [],
  description: t.description || '',
  submitted_by_user: t.submittedByUser || false,
})

const agentFromDB = (row) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  email: row.email,
  dept: row.dept,
  status: row.status,
  username: row.username,
  password: row.password,
  isAdmin: row.is_admin || false,
})

const agentToDB = (a) => ({
  id: a.id,
  name: a.name,
  role: a.role,
  email: a.email,
  dept: a.dept,
  status: a.status,
  username: a.username || '',
  password: a.password || '',
  is_admin: a.isAdmin || false,
})

const kbFromDB = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  content: row.content || '',
})

const kbToDB = (a) => ({
  id: a.id,
  title: a.title,
  category: a.category,
  content: a.content || '',
})

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useDB() {
  const [tickets, setTicketsLocal] = useState(FALLBACK_TICKETS)
  const [agents, setAgentsLocal] = useState(FALLBACK_AGENTS)
  const [kbArticles, setKbLocal] = useState(FALLBACK_KB)
  const [loading, setLoading] = useState(!!supabase)
  const [error, setError] = useState(null)

  // ── Load all data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured — using in-memory data only.')
      return
    }

    const load = async () => {
      try {
        setLoading(true)

        const [ticketsRes, agentsRes, kbRes] = await Promise.all([
          supabase.from('tickets').select('*').order('created', { ascending: false }),
          supabase.from('agents').select('*').order('id'),
          supabase.from('kb_articles').select('*').order('id'),
        ])

        if (ticketsRes.error) throw ticketsRes.error
        if (agentsRes.error) throw agentsRes.error
        if (kbRes.error) throw kbRes.error

        setTicketsLocal(ticketsRes.data.map(ticketFromDB))
        setAgentsLocal(agentsRes.data.map(agentFromDB))
        setKbLocal(kbRes.data.map(kbFromDB))
      } catch (err) {
        console.error('Failed to load from Supabase:', err)
        setError(err.message)
        // Fall back to in-memory defaults
        setAgentsLocal(FALLBACK_AGENTS)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ── Tickets ─────────────────────────────────────────────────────────────────
  const setTickets = useCallback(async (updaterOrValue) => {
    setTicketsLocal(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue

      if (supabase) {
        // Find what changed
        const prevIds = new Set(prev.map(t => t.id))
        const nextIds = new Set(next.map(t => t.id))

        // Deleted tickets
        const deleted = prev.filter(t => !nextIds.has(t.id))
        deleted.forEach(t => supabase.from('tickets').delete().eq('id', t.id).then(({ error }) => {
          if (error) console.error('Delete ticket error:', error)
        }))

        // New or updated tickets
        const upserted = next.filter(t => !prevIds.has(t.id) || prev.find(p => p.id === t.id) !== next.find(n => n.id === t.id))
        if (upserted.length > 0) {
          supabase.from('tickets').upsert(upserted.map(ticketToDB)).then(({ error }) => {
            if (error) console.error('Upsert ticket error:', error)
          })
        }
      }

      return next
    })
  }, [])

  // ── Agents ──────────────────────────────────────────────────────────────────
  const setAgents = useCallback(async (updaterOrValue) => {
    setAgentsLocal(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue

      if (supabase) {
        const prevIds = new Set(prev.map(a => a.id))
        const nextIds = new Set(next.map(a => a.id))

        // Removed agents
        const deleted = prev.filter(a => !nextIds.has(a.id))
        deleted.forEach(a => supabase.from('agents').delete().eq('id', a.id).then(({ error }) => {
          if (error) console.error('Delete agent error:', error)
        }))

        // New agents (upsert)
        const newAgents = next.filter(a => !prevIds.has(a.id))
        if (newAgents.length > 0) {
          supabase.from('agents').upsert(newAgents.map(agentToDB)).then(({ error }) => {
            if (error) console.error('Upsert agent error:', error)
          })
        }
      }

      return next
    })
  }, [])

  // ── KB Articles ─────────────────────────────────────────────────────────────
  const setKbArticles = useCallback(async (updaterOrValue) => {
    setKbLocal(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue

      if (supabase) {
        const prevIds = new Set(prev.map(a => a.id))
        const nextIds = new Set(next.map(a => a.id))

        // Deleted articles
        const deleted = prev.filter(a => !nextIds.has(a.id))
        deleted.forEach(a => supabase.from('kb_articles').delete().eq('id', a.id).then(({ error }) => {
          if (error) console.error('Delete KB error:', error)
        }))

        // New or updated articles
        const upserted = next.filter(a => {
          const old = prev.find(p => p.id === a.id)
          return !old || old.title !== a.title || old.category !== a.category || old.content !== a.content
        })
        if (upserted.length > 0) {
          supabase.from('kb_articles').upsert(upserted.map(kbToDB)).then(({ error }) => {
            if (error) console.error('Upsert KB error:', error)
          })
        }
      }

      return next
    })
  }, [])

  return {
    tickets,
    setTickets,
    agents,
    setAgents,
    kbArticles,
    setKbArticles,
    loading,
    error,
    isConnected: !!supabase,
  }
}
