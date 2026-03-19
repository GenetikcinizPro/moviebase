import 'dotenv/config'
import crypto from 'node:crypto'
import { getPayload } from 'payload'
import config from '../payload.config'

import type { Movie } from '../payload-types'
import { buildTmdbImageUrl, fetchMovieBundle, fetchTMDB, type TMDBMovieSummary } from '../lib/tmdb'

type TMDBSearchResponse = {
  page: number
  results: TMDBMovieSummary[]
  total_pages: number
}

const movieName = process.argv.slice(2).join(' ')

if (!movieName) {
  console.error('Usage: npm run import-movie "Movie Name"')
  process.exit(1)
}

const importBatch = new Date().toISOString()

type JsonValue = boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue }

const asJson = (value: unknown): JsonValue => value as JsonValue

const hashPayload = (value: unknown) =>
  crypto.createHash('sha1').update(JSON.stringify(value)).digest('hex')

const buildExternalAssets = (
  posterPath: null | string,
  backdropPath: null | string,
): Movie['externalAssets'] => {
  const assets: Movie['externalAssets'] = []

  if (posterPath) {
    assets.push({
      kind: 'poster',
      label: 'TMDB Poster',
      url: buildTmdbImageUrl(posterPath),
    })
  }

  if (backdropPath) {
    assets.push({
      kind: 'backdrop',
      label: 'TMDB Backdrop',
      url: buildTmdbImageUrl(backdropPath),
    })
  }

  return assets
}

const main = async () => {
  const payload = await getPayload({ config })

  console.log(`[tmdb] searching movie "${movieName}"`)

  const params = new URLSearchParams({
    query: movieName,
    include_adult: 'false',
  })

  const search = await fetchTMDB<TMDBSearchResponse>('/search/movie', params)

  if (!search.results.length) {
    console.log(`Movie not found: ${movieName}`)
    return
  }

  const movie = search.results[0]

  console.log(`[tmdb] found -> ${movie.title} (tmdbId=${movie.id})`)

  const { changes, details, watchProviders } = await fetchMovieBundle(movie.id)

  const existing = await payload.find({
    collection: 'movies',
    limit: 1,
    pagination: false,
    where: {
      tmdbId: {
        equals: movie.id,
      },
    },
  })

  const nextTmdbRaw = {
    details: asJson(details),
    credits: asJson(details.credits || null),
    videos: asJson(details.videos || null),
    images: asJson(details.images || null),
    watchProviders: asJson(watchProviders),
    changes: asJson(changes),
  }

  const nextHash = hashPayload(nextTmdbRaw)

  const currentMovie = existing.docs[0]

  const data: Partial<Movie> = {
    title: details.title,
    tmdbId: details.id,
    tmdbOriginalTitle: details.original_title,
    overview: details.overview,
    releaseDate: details.release_date || undefined,
    runtime: details.runtime || undefined,
    popularity: details.popularity,
    voteAverage: details.vote_average,
    voteCount: details.vote_count,
    posterUrl: buildTmdbImageUrl(details.poster_path),
    backdropUrl: buildTmdbImageUrl(details.backdrop_path),
    tagline: details.tagline,
    video: Boolean(details.video),

    genres: details.genres.map((g) => ({
      name: g.name,
      tmdbGenreId: g.id,
    })) as any,

    productionCompanies: (details.production_companies || []).map((company) => ({
      name: company.name,
      originCountry: company.origin_country,
      logoUrl: buildTmdbImageUrl(company.logo_path),
      tmdbCompanyId: company.id,
    })),

    spokenLanguages: (details.spoken_languages || []).map((l) => ({
      name: l.name,
      englishName: l.english_name,
      iso6391: l.iso_639_1,
    })),

    externalAssets: buildExternalAssets(details.poster_path, details.backdrop_path),

    sourceLinks: {
      homepage: details.homepage || '',
      imdb: details.imdb_id ? `https://www.imdb.com/title/${details.imdb_id}/` : '',
      tmdb: `https://www.themoviedb.org/movie/${details.id}`,
    },

    tmdbRaw: nextTmdbRaw,

    syncMeta: {
      lastImportBatch: importBatch,
      lastSyncStatus: currentMovie ? 'updated' : 'created',
      lastTmdbSyncAt: new Date().toISOString(),
      tmdbPayloadHash: nextHash,
      sourceLists: ['manual-search'],
    },

    status: 'published',
  }

  if (currentMovie) {
    await payload.update({
      collection: 'movies',
      id: currentMovie.id,
      data,
    })

    console.log(`[tmdb] updated ${details.title}`)
  } else {
    await payload.create({
      collection: 'movies',
      data: data as never,
    })

    console.log(`[tmdb] created ${details.title}`)
  }
}

main()
  .then(() => {
    console.log(`Movie import completed.`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
