import {
  getAllSessions,
  getSessionById,
  createRegistration,
} from '../../src/services/trainingSessionService'
import prisma from '../../src/lib/prisma'

jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    trainingSession: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    registration: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const mockFindMany = prisma.trainingSession.findMany as jest.Mock
const mockFindUnique = prisma.trainingSession.findUnique as jest.Mock
const mockUpdateMany = prisma.trainingSession.updateMany as jest.Mock
const mockRegistrationCreate = prisma.registration.create as jest.Mock
const mockTransaction = prisma.$transaction as jest.Mock

const mockSession = {
  id: 1,
  title: 'TDD in Agentic Development Loop',
  description: 'Learn test-driven development with AI assistance.',
  date: new Date('2026-07-01T09:00:00Z'),
  capacity: 20,
  registered: 5,
  location: 'Room A',
  deliveryMode: 'In-person',
  status: 'open',
}

const mockRegistration = {
  id: 1,
  sessionId: 1,
  name: 'Test Attendee',
  email: 'test@example.com',
  status: 'registered',
  createdAt: new Date().toISOString(),
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('getAllSessions', () => {
  it('returns sessions ordered by date', async () => {
    const sessions = [
      mockSession,
      { ...mockSession, id: 2, date: new Date('2026-07-02T09:00:00Z') },
    ]
    mockFindMany.mockResolvedValue(sessions)

    const result = await getAllSessions()

    expect(result).toEqual(sessions)
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { date: 'asc' } })
  })

  it('returns an empty array when no sessions exist', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await getAllSessions()

    expect(result).toEqual([])
  })
})

describe('getSessionById', () => {
  it('returns the matching session', async () => {
    mockFindUnique.mockResolvedValue(mockSession)

    const result = await getSessionById(1)

    expect(result).toEqual(mockSession)
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('returns null when session does not exist', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await getSessionById(999)

    expect(result).toBeNull()
  })
})

describe('createRegistration', () => {
  it('creates a registration for a valid session with enough capacity', async () => {
    mockFindUnique.mockResolvedValue(mockSession)
    mockUpdateMany.mockResolvedValue({ count: 1 })
    mockRegistrationCreate.mockResolvedValue(mockRegistration)
    mockTransaction.mockImplementation((fn) =>
      fn({
        trainingSession: {
          updateMany: mockUpdateMany,
        },
        registration: {
          create: mockRegistrationCreate,
        },
      })
    )

    const result = await createRegistration(1, 'Test Attendee', 'test@example.com')

    expect(result).toEqual(mockRegistration)
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(mockTransaction).toHaveBeenCalled()
  })

  it('throws 400 error when name is empty', async () => {
    try {
      await createRegistration(1, '', 'test@example.com')
    } catch (error) {
      const err = error as { status: number; error: string }
      expect(err.status).toBe(400)
      expect(err.error).toBe('Name and email are required')
    }
  })

  it('throws 400 error when email is empty', async () => {
    try {
      await createRegistration(1, 'Test Attendee', '')
    } catch (error) {
      const err = error as { status: number; error: string }
      expect(err.status).toBe(400)
      expect(err.error).toBe('Name and email are required')
    }
  })

  it('throws 400 error when email format is invalid', async () => {
    try {
      await createRegistration(1, 'Test Attendee', 'invalid-email')
    } catch (error) {
      const err = error as { status: number; error: string }
      expect(err.status).toBe(400)
      expect(err.error).toBe('Invalid email format')
    }
  })

  it('throws 404 error when session does not exist', async () => {
    mockFindUnique.mockResolvedValue(null)

    try {
      await createRegistration(1, 'Test Attendee', 'test@example.com')
    } catch (error) {
      const err = error as { status: number; error: string }
      expect(err.status).toBe(404)
      expect(err.error).toBe('Training session not found')
    }
  })

  it('throws 409 error when session is full', async () => {
    mockFindUnique.mockResolvedValue(mockSession)
    mockUpdateMany.mockResolvedValue({ count: 0 })

    try {
      await createRegistration(1, 'Test Attendee', 'test@example.com')
    } catch (error) {
      const err = error as { status: number; error: string }
      expect(err.status).toBe(409)
      expect(err.error).toBe('Training session is full')
    }
  })
})