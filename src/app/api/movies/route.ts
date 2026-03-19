import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const genre = searchParams.get('genre')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const payload = await getPayload({ config })

  const where: any = {
    status: {
      equals: 'published',
    },
  }

  if (genre) {
    where['genres.slug'] = {
      equals: genre,
    }
  }

  const result = await payload.find({
    collection: 'movies',
    depth: 0,
    page,
    limit,
    sort: '-popularity',
    where,
  })

  // Preferred custom asset mapping
  const docs = result.docs.map((doc: any) => ({
    ...doc,
    posterUrl: doc.customPosterUrl || doc.posterUrl
  }))

  return Response.json({ ...result, docs })
}
