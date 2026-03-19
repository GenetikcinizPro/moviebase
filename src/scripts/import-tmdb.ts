import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

import { buildTmdbImageUrl, fetchMovieBundle, type TMDBMovieSummary } from '../lib/tmdb'

const main = async () => {
  const payload = await getPayload({ config })

  console.log('--- STARTING CLEAN TMDB ARCHIVE IMPORT ---')

  // Example IDs or fetch popular ones
  const moviesToImport = [
    1108427, // Example from your list
    277834,  // Example from your list
    1241982, // Example from your list
    // You can add more IDs here or fetch popular ones
  ]

  for (const tmdbId of moviesToImport) {
    try {
      console.log(`[tmdb] Processing ID: ${tmdbId}`)
      const { details } = await fetchMovieBundle(tmdbId)

      // 1. Handle Genres
      const genreIds: string[] = []
      for (const tmdbGenre of details.genres || []) {
        let existingGenre = await payload.find({
          collection: 'genres',
          where: { tmdbGenreId: { equals: tmdbGenre.id } },
          limit: 1,
        })

        if (existingGenre.docs.length === 0) {
          const newGenre = await payload.create({
            collection: 'genres',
            data: {
              name: tmdbGenre.name,
              tmdbGenreId: tmdbGenre.id,
              slug: tmdbGenre.name.toLowerCase().replace(/\s+/g, '-'),
            },
          })
          genreIds.push(String(newGenre.id))
        } else {
          genreIds.push(String(existingGenre.docs[0].id))
        }
      }

      // 2. Handle Collection (Franchise)
      let localCollectionId: string | undefined = undefined
      if (details.belongs_to_collection) {
        const tmdbColl = details.belongs_to_collection
        let existingColl = await payload.find({
          collection: 'movie-collections',
          where: { tmdbCollectionId: { equals: tmdbColl.id } },
          limit: 1,
        })

        if (existingColl.docs.length === 0) {
          const newColl = await payload.create({
            collection: 'movie-collections',
            data: {
              name: tmdbColl.name,
              tmdbCollectionId: tmdbColl.id,
              posterUrl: buildTmdbImageUrl(tmdbColl.poster_path),
              backdropUrl: buildTmdbImageUrl(tmdbColl.backdrop_path),
            },
          })
          localCollectionId = String(newColl.id)
        } else {
          localCollectionId = String(existingColl.docs[0].id)
        }
      }

      // 3. Create Movie
      await payload.create({
        collection: 'movies',
        data: {
          title: details.title,
          tmdbId: details.id,
          slug: details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          overview: details.overview,
          tagline: details.tagline,
          releaseDate: details.release_date,
          runtime: details.runtime,
          popularity: details.popularity,
          voteAverage: details.vote_average,
          voteCount: details.vote_count,
          status: 'published',
          posterUrl: buildTmdbImageUrl(details.poster_path),
          backdropUrl: buildTmdbImageUrl(details.backdrop_path),
          genres: genreIds as any,
          collection: localCollectionId as any,
          originalLanguage: details.original_language,
        } as any,
      })

      console.log(`[success] Imported: ${details.title}`)
    } catch (e) {
      console.error(`[error] Failed ID ${tmdbId}:`, e)
    }
  }

  console.log('--- CLEAN IMPORT COMPLETED ---')
}

main().catch(console.error)
