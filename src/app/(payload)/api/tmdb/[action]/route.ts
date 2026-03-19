import crypto from 'node:crypto'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import config from '@/payload.config'
import type { Movie } from '@/payload-types'
import { buildTmdbImageUrl, fetchMovieBundle, fetchTMDB } from '@/lib/tmdb'

type JsonValue = boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue }
const asJson = (value: unknown): JsonValue => value as JsonValue
const hashPayload = (value: unknown) =>
  crypto.createHash('sha1').update(JSON.stringify(value)).digest('hex')

export async function POST(req: NextRequest, props: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await props.params
    const body = await req.json()

    if (action === 'search') {
      const { query } = body
      if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

      const params = new URLSearchParams({ query, include_adult: 'false' })
      const search = await fetchTMDB('/search/movie', params)
      return NextResponse.json(search)
    }

    if (action === 'search-local') {
      const { query } = body
      if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

      const payload = await getPayload({ config })
      const movies = await payload.find({
        collection: 'movies',
        where: { title: { contains: query } },
        limit: 10,
        pagination: false,
      })
      return NextResponse.json(movies)
    }

    if (action === 'import') {
      const { tmdbId } = body
      if (!tmdbId) return NextResponse.json({ error: 'tmdbId required' }, { status: 400 })

      const payload = await getPayload({ config })
      const { changes, details, watchProviders } = await fetchMovieBundle(tmdbId)

      const existing = await payload.find({
        collection: 'movies',
        limit: 1,
        pagination: false,
        where: { tmdbId: { equals: tmdbId } },
      })

      const nextTmdbRaw = {
        alternativeTitles: asJson(details.alternative_titles || null),
        changes: asJson(changes),
        credits: asJson(details.credits || null),
        details: asJson(details),
        externalIds: asJson(details.external_ids || null),
        images: asJson(details.images || null),
        keywords: asJson(details.keywords || null),
        lists: asJson(details.lists || null),
        recommendations: asJson(details.recommendations || null),
        releaseDates: asJson(details.release_dates || null),
        reviews: asJson(details.reviews || null),
        similar: asJson(details.similar || null),
        translations: asJson(details.translations || null),
        videos: asJson(details.videos || null),
        watchProviders: asJson(watchProviders),
      }

      const nextHash = hashPayload(nextTmdbRaw)
      const currentMovie = existing.docs[0]

      const directors: any[] = []
      const cast: any[] = []
      const genreIds: any[] = []
      let collectionId: any = null

      // Handle Genres
      for (const g of (details.genres || [])) {
        const existingGenre = await payload.find({
          collection: 'genres',
          where: { tmdbGenreId: { equals: g.id } },
          limit: 1,
          depth: 0,
          req,
        })
        
        let genId = existingGenre.docs[0]?.id
        if (!genId) {
          const created = await payload.create({
            collection: 'genres',
            data: {
              name: g.name,
              tmdbGenreId: g.id,
              slug: g.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
            } as any,
            req,
          })
          genId = created.id
        }
        genreIds.push(String(genId))
      }

      // Handle Collection
      if (details.belongs_to_collection) {
        const coll = details.belongs_to_collection
        const existingColl = await payload.find({
          collection: 'movie-collections',
          where: { tmdbCollectionId: { equals: coll.id } },
          limit: 1,
          depth: 0,
          req,
        })
        
        let cId = existingColl.docs[0]?.id
        if (!cId) {
          const created = await payload.create({
            collection: 'movie-collections',
            data: {
              name: coll.name,
              tmdbCollectionId: coll.id,
              posterUrl: buildTmdbImageUrl(coll.poster_path),
              backdropUrl: buildTmdbImageUrl(coll.backdrop_path),
            } as any,
            req,
          })
          cId = created.id
        } else {
          // Update collection metadata if needed
          await payload.update({
            collection: 'movie-collections',
            id: cId,
            data: {
              name: coll.name,
              posterUrl: buildTmdbImageUrl(coll.poster_path),
              backdropUrl: buildTmdbImageUrl(coll.backdrop_path),
            } as any,
            req,
          })
        }
        collectionId = String(cId)
      }

      // Handle Directors
      const crew = (details.credits as any)?.crew || []
      const tmdbDirectors = crew.filter((p: any) => p.job === 'Director')
      
      for (const p of tmdbDirectors) {
        const existingPerson = await payload.find({
          collection: 'people',
          where: { tmdbId: { equals: p.id } },
          limit: 1,
          depth: 0,
          req,
        })
        
        let personId = existingPerson.docs[0]?.id
        if (!personId) {
          const personData = await fetchTMDB<any>(`/person/${p.id}`)
          const created = await payload.create({
            collection: 'people',
            data: {
              name: personData.name,
              tmdbId: personData.id,
              biography: personData.biography,
              profileUrl: buildTmdbImageUrl(personData.profile_path),
              knownForDepartment: personData.known_for_department,
              birthDate: personData.birthday,
              deathDate: personData.deathday,
              placeOfBirth: personData.place_of_birth,
              externalIds: {
                imdb: personData.imdb_id,
                tmdb: `https://www.themoviedb.org/person/${personData.id}`,
              }
            } as any,
            req,
          })
          personId = created.id
        }
        directors.push(String(personId))
      }

      // Handle Top Cast (Limit to top 8)
      const tmdbCast = ((details.credits as any)?.cast || []).slice(0, 8)
      for (const p of tmdbCast) {
        const existingPerson = await payload.find({
          collection: 'people',
          where: { tmdbId: { equals: p.id } },
          limit: 1,
          depth: 0,
          req,
        })
        
        let personId = existingPerson.docs[0]?.id
        if (!personId) {
          const personData = await fetchTMDB<any>(`/person/${p.id}`)
          const created = await payload.create({
            collection: 'people',
            data: {
              name: personData.name,
              tmdbId: personData.id,
              biography: personData.biography,
              profileUrl: buildTmdbImageUrl(personData.profile_path),
              knownForDepartment: personData.known_for_department,
              birthDate: personData.birthday,
              deathDate: personData.deathday,
              placeOfBirth: personData.place_of_birth,
              externalIds: {
                imdb: personData.imdb_id,
                tmdb: `https://www.themoviedb.org/person/${personData.id}`,
              }
            } as any,
            req,
          })
          personId = created.id
        }
        cast.push({ person: String(personId), character: p.character })
      }

      const data: any = {
        adult: details.adult,
        backdropUrl: buildTmdbImageUrl(details.backdrop_path),
        collection: collectionId,
        budgets: {
          budget: details.budget,
          revenue: details.revenue,
        },
        externalAssets: [],
        genres: genreIds,
        originalLanguage: details.original_language || '',
        overview: details.overview,
        popularity: details.popularity,
        posterUrl: buildTmdbImageUrl(details.poster_path),
        directors,
        cast,
        productionCompanies: (details.production_companies || []).map((c: any) => ({
          name: c.name,
          originCountry: c.origin_country,
          logoUrl: buildTmdbImageUrl(c.logo_path),
          tmdbCompanyId: c.id,
        })),
        productionCountries: (details.production_countries || []).map((c: any) => ({
          iso31661: c.iso_3166_1,
          name: c.name,
        })),
        releaseDate: details.release_date || undefined,
        runtime: details.runtime || undefined,
        sourceLinks: {
          homepage: details.homepage || '',
          imdb: details.imdb_id ? `https://www.imdb.com/title/${details.imdb_id}/` : '',
          tmdb: `https://www.themoviedb.org/movie/${details.id}`,
        },
        customBackdropUrl: currentMovie?.customBackdropUrl,
        customPosterUrl: currentMovie?.customPosterUrl,
        customAssetMeta: currentMovie?.customAssetMeta,
        spokenLanguages: (details.spoken_languages || []).map((l: any) => ({
          englishName: l.english_name,
          iso6391: l.iso_639_1,
          name: l.name,
        })),
        status: 'published' as const,
        syncMeta: {
          lastImportBatch: new Date().toISOString(),
          lastSyncStatus: currentMovie ? 'updated' : 'created',
          lastTmdbSyncAt: new Date().toISOString(),
          sourceLists: ['admin-panel'],
          tmdbPayloadHash: nextHash,
        },
        tagline: details.tagline,
        title: details.title,
        tmdbId: details.id,
        tmdbOriginalTitle: details.original_title,
        tmdbRaw: nextTmdbRaw,
        video: Boolean(details.video),
        voteAverage: details.vote_average,
        voteCount: details.vote_count,
      }

      // Restore assets pushing logic
      if (details.poster_path) {
        data.externalAssets?.push({ kind: 'poster', label: 'TMDB Poster', url: buildTmdbImageUrl(details.poster_path) })
      }
      if (details.backdrop_path) {
        data.externalAssets?.push({ kind: 'backdrop', label: 'TMDB Backdrop', url: buildTmdbImageUrl(details.backdrop_path) })
      }

      if (currentMovie) {
        await payload.update({
          collection: 'movies',
          id: currentMovie.id,
          data,
        })
        return NextResponse.json({ success: true, action: 'updated', title: details.title })
      } else {
        await payload.create({
          collection: 'movies',
          data: data as never,
        })
        return NextResponse.json({ success: true, action: 'created', title: details.title })
      }
    }

    if (action === 'custom-poster') {
      const { id, customPosterUrl } = body
      if (!id || !customPosterUrl) return NextResponse.json({ error: 'id and customPosterUrl required' }, { status: 400 })

      const payload = await getPayload({ config })
      await payload.update({
        collection: 'movies',
        id,
        data: {
          customPosterUrl,
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('TMDB API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
