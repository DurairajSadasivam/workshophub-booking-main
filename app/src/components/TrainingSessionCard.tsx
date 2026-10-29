import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TrainingSession } from '../types'
import './TrainingSessionCard.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface WaitlistResponse {
  status: 'waitlisted'
  position: number
}

interface Props {
  session: TrainingSession
  onRegistered?: () => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-SG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function deliveryModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    'in-person': 'In Person',
    online: 'Online',
    hybrid: 'Hybrid',
  }
  return labels[mode] ?? mode
}

function TrainingSessionCard({ session, onRegistered }: Props) {
  const spotsLeft = session.capacity - session.registered
  const isFull = spotsLeft <= 0

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [waitlisted, setWaitlisted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/training-sessions/${session.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        setFormError(body?.error ?? `Registration failed (${res.status})`)
        return
      }

      if (res.status === 202) {
        const body = (await res.json().catch(() => null)) as WaitlistResponse | null
        const position = body?.position
        setWaitlisted(true)
        setConfirmation(
          `You're on the waitlist for ${session.title}${
            position ? ` (position ${position})` : ''
          }, ${name.trim()}. Your place is not confirmed. We'll let you know if a spot opens up.`
        )
      } else {
        setWaitlisted(false)
        setConfirmation(`You're registered for ${session.title}. See you there, ${name.trim()}!`)
      }
      setFormOpen(false)
      setName('')
      setEmail('')
      onRegistered?.()
    } catch {
      setFormError('Could not reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className={`session-card ${isFull ? 'session-card--full' : ''}`}>
      <div className="session-card__header">
        <span className={`session-badge session-badge--${session.deliveryMode}`}>
          {deliveryModeLabel(session.deliveryMode)}
        </span>
        {isFull && <span className="session-badge session-badge--full">Full</span>}
      </div>

      <h3 className="session-card__title">{session.title}</h3>
      <p className="session-card__description">{session.description}</p>

      <div className="session-card__meta">
        <div className="meta-item">
          <span className="meta-label">Date</span>
          <span className="meta-value">{formatDate(session.date)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Time</span>
          <span className="meta-value">{formatTime(session.date)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Location</span>
          <span className="meta-value">{session.location}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Capacity</span>
          <span className="meta-value">
            {session.registered} / {session.capacity} registered
            {!isFull && (
              <span className="spots-left">
                {' '}
                ({spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left)
              </span>
            )}
          </span>
        </div>
      </div>

      {confirmation && (
        <p
          className={`session-card__confirmation ${
            waitlisted ? 'session-card__confirmation--waitlisted' : ''
          }`}
          role="status"
        >
          {confirmation}
        </p>
      )}

      {formOpen ? (
        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-form__field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="register-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          {formError && (
            <p className="register-form__error" role="alert">
              {formError}
            </p>
          )}
          <div className="register-form__actions">
            <button type="submit" className="register-button" disabled={submitting}>
              {submitting
                ? isFull
                  ? 'Joining waitlist...'
                  : 'Registering...'
                : isFull
                  ? 'Confirm waitlist spot'
                  : 'Confirm registration'}
            </button>
            <button
              type="button"
              className="register-button register-button--secondary"
              onClick={() => {
                setFormOpen(false)
                setFormError(null)
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="register-button"
          onClick={() => {
            setConfirmation(null)
            setFormOpen(true)
          }}
        >
          {isFull ? 'Join Waitlist' : 'Register'}
        </button>
      )}
    </article>
  )
}

export default TrainingSessionCard
