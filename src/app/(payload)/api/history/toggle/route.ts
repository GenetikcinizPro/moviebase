import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { movieId } = await req.json()
    if (!movieId) {
      return NextResponse.json({ error: 'movieId required' }, { status: 400 })
    }

    // Check if already in history
    const existing = await payload.find({
      collection: 'history-logs',
      where: {
        and: [
          { user: { equals: user.id } },
          { movie: { equals: movieId } }
        ]
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // Remove from history
      await payload.delete({
        collection: 'history-logs',
        id: existing.docs[0].id,
      })
      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      // Add to history
      await payload.create({
        collection: 'history-logs',
        data: {
          user: user.id,
          movie: movieId,
          watchedAt: new Date().toISOString(),
        },
      })
      return NextResponse.json({ success: true, action: 'added' })
    }
  } catch (error: any) {
    console.error('History Toggle Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
