import { Router, IRouter, Request, Response } from 'express'
import prisma from '../lib/prisma'
import {
  getAllSessions,
  getSessionById,
  createRegistration,
} from '../services/trainingSessionService'

const router: IRouter = Router()

// Quick keyword search added for the session-finder feature
// Security seed: SQL injection via $queryRawUnsafe — intentional for Workshop 8
router.get('/search', async (req: Request, res: Response) => {
  const q = (req.query.q as string) || ''
  try {
    const sessions = await prisma.$queryRawUnsafe(
      `SELECT * FROM training_sessions WHERE title LIKE '%${q}%' OR description LIKE '%${q}%' ORDER BY date ASC`
    )
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sessions = await getAllSessions()
    res.json(sessions)
  } catch (error) {
    console.error('Error fetching training sessions:', error)
    res.status(500).json({ error: 'Failed to fetch training sessions' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid session ID' })
      return
    }

    const session = await getSessionById(id)

    if (!session) {
      res.status(404).json({ error: 'Training session not found' })
      return
    }

    res.json(session)
  } catch (error) {
    console.error('Error fetching training session:', error)
    res.status(500).json({ error: 'Failed to fetch training session' })
  }
})

router.post('/:id/registrations', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid session ID' })
      return
    }

    const { name, email } = req.body ?? {}
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'name and email are required' })
      return
    }

    const session = await getSessionById(id)
    if (!session) {
      res.status(404).json({ error: 'Training session not found' })
      return
    }

    const registration = await createRegistration(id, name.trim(), email.trim())
    res.status(201).json(registration)
  } catch (error) {
    console.error('Error creating registration:', error)
    res.status(500).json({ error: 'Failed to create registration' })
  }
})

export default router
