import { getPayload } from 'payload'

import type { Movie } from '@/payload-types'
import config from '@/payload.config'

export const getPayloadClient = async () => getPayload({ config })

export async function getMovies() {
  const payload = await getPayloadClient()
  const movies = await payload.find({
    collection: 'movies',
    limit: 50,
    depth: 1,
  })

  return movies.docs
}

export const getPublishedMovies = async (limit = 24, filters?: { q?: string; category?: string; year?: string }) => {
  const payload = await getPayloadClient()

  const where: any = {
    status: {
      equals: 'published',
    },
  }

  if (filters?.q) {
    where.title = {
      contains: filters.q,
    }
  }

  if (filters?.category && filters.category !== 'All Assets') {
    where['genres.slug'] = {
      equals: filters.category,
    }
  }

  if (filters?.year && filters.year !== 'All Eras') {
    // Map human timeline to years (dummy logic for example)
    if (filters.year === '2050s') where.releaseDate = { greater_than: '2050-01-01' }
    if (filters.year === '2020s') where.releaseDate = { greater_than: '2020-01-01', less_than: '2029-12-31' }
  }

  return payload.find({
    collection: 'movies',
    depth: 0,
    limit,
    sort: '-popularity',
    where,
  })
}

export const getMovieBySlug = async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'movies',
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return result.docs[0] || null
}

const scoreMovie = (movie: Movie) => (movie.popularity || 0) + (movie.voteAverage || 0) * 12
const sliceSorted = (movies: Movie[], count: number) =>
  [...movies].sort((a, b) => scoreMovie(b) - scoreMovie(a)).slice(0, count)

export const getHeroMovie = async () => {
  const payload = await getPayloadClient()
  const customFirst = await payload.find({
    collection: 'movies',
    depth: 0,
    limit: 1,
    sort: '-popularity',
    where: {
      and: [
        {
          status: {
            equals: 'published',
          },
        },
        {
          or: [
            { customBackdropUrl: { exists: true } },
            { customPosterUrl: { exists: true } },
          ],
        },
      ],
    },
  })

  if (customFirst.docs[0]) return customFirst.docs[0]

  const popular = await getPublishedMovies(1)
  return popular.docs[0] || null
}

export const getCuratedShelves = async () => {
  const movies = await getMovies()
  const published = movies.filter((movie) => movie.status === 'published')

  const byGenre = (genreName: string, fallbackCount = 6) =>
    sliceSorted(
      published.filter((movie) => 
        movie.genres?.some((genre) => (typeof genre === 'object' ? genre.name.toLowerCase().includes(genreName) : false))
      ),
      fallbackCount,
    )

  return [
    {
      key: 'trending',
      title: 'Trending Collection',
      subtitle: 'Current high-signal films from the archive',
      mode: 'row' as const,
      movies: sliceSorted(published, 10),
    },
    {
      key: 'neon-canon',
      title: 'Neon Canon',
      subtitle: 'Cyberpunk futures and digital dystopia',
      mode: 'row' as const,
      movies: byGenre('science', 8),
    },
    {
      key: 'signal-archive',
      title: 'Signal Archive',
      subtitle: 'Paranoia, mystery and shadow transmissions',
      mode: 'grid' as const,
      movies: Array.from(new Set([...byGenre('thriller', 3), ...byGenre('mystery', 3)].map(m => m.id))).map(id => [...byGenre('thriller', 3), ...byGenre('mystery', 3)].find(m => m.id === id)!).slice(0, 6) as Movie[],
    },
    {
      key: 'editor-picks',
      title: 'Editor Picks',
      subtitle: 'High-rated entries with collector value',
      mode: 'row' as const,
      movies: sliceSorted(
        published.filter((movie) => (movie.voteAverage || 0) >= 7),
        8,
      ),
    },
    {
      key: 'archive',
      title: 'Archive',
      subtitle: 'The deeper library, ordered by signal strength',
      mode: 'row' as const,
      movies: sliceSorted(published, 12),
    },
  ]
}

export const getGenreShelves = async () => {
  const payload = await getPayloadClient()
  const genres = await getGenres()
  
  const shelves = await Promise.all(
    genres.map(async (genre) => {
      const result = await payload.find({
        collection: 'movies',
        depth: 0,
        limit: 10,
        where: {
          and: [
            { status: { equals: 'published' } },
            { genres: { contains: genre.id } }
          ]
        },
        sort: '-popularity'
      })

      return {
        id: genre.id,
        slug: genre.slug,
        title: genre.name,
        subtitle: `${genre.name} titles from the archive`,
        movies: result.docs as Movie[],
      }
    })
  )

  // Only return genres that have at least 4 movies for a "premium" shelf look
  return shelves.filter((s) => s.movies.length >= 4)
}

export const getRelatedMovies = async (movie: Movie, limit = 6) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'movies',
    depth: 0,
    limit: limit + 1,
    where: {
      and: [
        { status: { equals: 'published' } },
        { id: { not_equals: movie.id } },
        { 
          or: (movie.genres || []).map(g => ({ 
            'genres.name': { 
              contains: typeof g === 'object' ? g.name : '' 
            } 
          }))
        }
      ]
    }
  })
  
  return result.docs.slice(0, limit)
}

export const getWatchedMovieIds = async (userId: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'history-logs',
    depth: 0,
    where: {
      user: {
        equals: userId
      }
    },
    limit: 1000,
    pagination: false,
  })

  return result.docs.map(log => (typeof log.movie === 'object' ? log.movie.id : log.movie))
}

export const getPersonBySlug = async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'people',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export const getMoviesByPerson = async (personId: string | number) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'movies',
    depth: 0,
    where: {
      or: [
        { directors: { contains: personId } },
        { 'cast.person': { equals: personId } }
      ]
    },
    sort: '-releaseDate',
    limit: 100,
  })
  return result.docs
}

export const getGenres = async () => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'genres',
    sort: 'name',
    limit: 100,
  })
  return result.docs
}
