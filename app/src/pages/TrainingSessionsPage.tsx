import { useCallback, useEffect, useState } from 'react'
import type { TrainingSession } from '../types'
import TrainingSessionCard from '../components/TrainingSessionCard'
import './TrainingSessionsPage.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

function TrainingSessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // `initial` gates the full-page loading state so a post-registration refresh
  // only swaps the session list instead of flashing the whole page.
  const fetchSessions = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/training-sessions`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = (await res.json()) as TrainingSession[]
      setSessions(data)
      setLoading(false)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions(true)
  }, [fetchSessions])

  if (loading) {
    return <div className="page-state">Loading training sessions...</div>
  }

  if (error) {
    return (
      <div className="page-state page-state--error">
        <p>Failed to load training sessions.</p>
        <p className="error-detail">{error}</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return <div className="page-state">No training sessions available.</div>
  }

  return (
    <section className="sessions-page">
      <h2 className="sessions-heading">Available Training Sessions</h2>
      <p className="sessions-count">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} available
      </p>
      <div className="sessions-grid">
        {sessions.map((session) => (
          <TrainingSessionCard
            key={session.id}
            session={session}
            onRegistered={() => fetchSessions(false)}
          />
        ))}
      </div>
    </section>
  )
}

export default TrainingSessionsPage
