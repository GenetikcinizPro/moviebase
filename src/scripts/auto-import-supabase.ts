import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { buildTmdbImageUrl, fetchMovieBundle, fetchTMDB } from '../lib/tmdb'

const SUPABASE_PROJECT_REF = 'wkrrcosdgnotkndyzesm'
const BUCKET_NAME = 'movies'
const PUBLIC_URL_BASE = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`

type TMDBSearchResponse = { results: Array<{ id: number; title: string }> }

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
  const payload = await getPayload({ config })
  const db: any = payload.db

  console.log('--- STARTING GIGA CORE ARCHIVE AUTO-IMPORT (CLEAN SEARCH MODE) ---')

  try {
    const { rows: files } = await db.drizzle.execute(
      `SELECT name FROM storage.objects WHERE bucket_id = '${BUCKET_NAME}' AND name LIKE '%.webp'`
    )

    const total = files.length
    console.log(`Found ${total} assets in Supabase. Starting refined match...`)

    for (let i = 0; i < total; i++) {
      const file = files[i]
      const originalFileName = file.name
      
      // 🧼 AGGRESSIVE CLEANING
      const movieTitleQuery = originalFileName
        .replace(/\.webp$/i, '')            // Remove extension
        .replace(/\(\d+\)/g, '')            // Remove (1), (2) etc.
        .replace(/[-_.+]/g, ' ')           // Replace separators with space
        .replace(/\s+n$/i, '')              // Remove trailing " n"
        .replace(/([a-z])n$/i, '$1')        // Remove trailing "n" if it follows a letter (heuristic for the junk n)
        .replace(/\s+/g, ' ')               // Normalize spaces
        .trim()

      if (!movieTitleQuery || movieTitleQuery.length < 2) continue

      process.stdout.write(`\r[${i + 1}/${total}] Matching: "${movieTitleQuery}"... `)

      // 1. Search TMDB
      let searchRes = await fetchTMDB<TMDBSearchResponse>('/search/movie', new URLSearchParams({ query: movieTitleQuery, include_adult: 'false' }))
      
      // If not found, try stripping more (e.g. if the 'n' was part of the word mistakenly)
      if (!searchRes.results?.length && movieTitleQuery.length > 5) {
         const simplerQuery = movieTitleQuery.split(' ').slice(0, -1).join(' ')
         if (simplerQuery) {
            searchRes = await fetchTMDB<TMDBSearchResponse>('/search/movie', new URLSearchParams({ query: simplerQuery, include_adult: 'false' }))
         }
      }

      if (!searchRes.results?.length) { 
        // console.warn(`\n[skip] No result for: ${movieTitleQuery}`); 
        continue 
      }

      const bestMatch = searchRes.results[0]
      const tmdbId = bestMatch.id
      const customUrl = `${PUBLIC_URL_BASE}/${originalFileName}`

      // 2. Fast Sync Check
      const existing = await payload.find({ collection: 'movies', where: { tmdbId: { equals: tmdbId } }, limit: 1, depth: 0 })
      if (existing.docs.length > 0) {
        if (!existing.docs[0].customPosterUrl) {
           await payload.update({ collection: 'movies', id: existing.docs[0].id, data: { customPosterUrl: customUrl } as any })
        }
        continue
      }

      // 3. Full Import
      try {
        const { details } = await fetchMovieBundle(tmdbId)
        const genreIds: number[] = []
        for (const tmdbG of details.genres || []) {
           const gRes = await payload.find({ collection: 'genres', where: { tmdbGenreId: { equals: tmdbG.id } }, limit: 1 })
           if (gRes.docs.length === 0) {
             const newG = await payload.create({ collection: 'genres', data: { name: tmdbG.name, tmdbGenreId: tmdbG.id, slug: tmdbG.name.toLowerCase().replace(/\s+/g,'-') } })
             genreIds.push(newG.id as number)
           } else {
             genreIds.push(gRes.docs[0].id as number)
           }
        }

        let localCollId: number | undefined = undefined
        if (details.belongs_to_collection) {
          const cRes = await payload.find({ collection: 'movie-collections', where: { tmdbCollectionId: { equals: details.belongs_to_collection.id } }, limit: 1 })
          if (cRes.docs.length === 0) {
            const newC = await payload.create({ 
              collection: 'movie-collections', 
              data: { 
                name: details.belongs_to_collection.name, 
                tmdbCollectionId: details.belongs_to_collection.id, 
                posterUrl: buildTmdbImageUrl(details.belongs_to_collection.poster_path), 
                backdropUrl: buildTmdbImageUrl(details.belongs_to_collection.backdrop_path) 
              },
              draft: true 
            })
            localCollId = newC.id as number
          } else {
            localCollId = cRes.docs[0].id as number
          }
        }

        await payload.create({
          collection: 'movies',
          data: {
            title: details.title, tmdbId: details.id, slug: details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            overview: details.overview, status: 'published',
            posterUrl: buildTmdbImageUrl(details.poster_path), backdropUrl: buildTmdbImageUrl(details.backdrop_path),
            customPosterUrl: customUrl, genres: genreIds, collection: localCollId, originalLanguage: details.original_language
          } as any
        })

        await sleep(200) 
      } catch (tmdbErr) {
        // Silent error to keep the loop moving
      }
    }

  } catch (err) { console.error('CRITICAL ERROR:', err) }

  console.log('\n--- REFINED ARCHIVE SYNC COMPLETED ---')
}

main().catch(console.error)
