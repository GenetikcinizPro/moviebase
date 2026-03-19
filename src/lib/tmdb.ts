export type TMDBMovieSummary = {
  adult: boolean
  backdrop_path: null | string
  genre_ids: number[]
  id: number
  original_language?: string
  original_title: string
  overview: string
  popularity: number
  poster_path: null | string
  release_date: string
  title: string
  video?: boolean
  vote_average: number
  vote_count: number
}

export type TMDBMovieDetail = TMDBMovieSummary & {
  alternative_titles?: unknown
  belongs_to_collection?: null | {
    backdrop_path: null | string
    id: number
    name: string
    poster_path: null | string
  }
  budget: number
  credits?: unknown
  external_ids?: unknown
  genres: Array<{
    id: number
    name: string
  }>
  homepage: string
  images?: unknown
  imdb_id: null | string
  keywords?: unknown
  lists?: unknown
  production_companies?: Array<{
    id: number
    logo_path: null | string
    name: string
    origin_country: string
  }>
  production_countries?: Array<{
    iso_3166_1: string
    name: string
  }>
  recommendations?: unknown
  release_dates?: unknown
  revenue: number
  reviews?: unknown
  runtime: null | number
  similar?: unknown
  spoken_languages?: Array<{
    english_name: string
    iso_639_1: string
    name: string
  }>
  status: string
  tagline: string
  translations?: unknown
  videos?: unknown
}

const tmdbBaseUrl = 'https://api.themoviedb.org/3'

const getHeaders = () => ({
  Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
  'Content-Type': 'application/json',
})

const getLanguage = () => process.env.TMDB_LANGUAGE || 'tr-TR'

export const buildTmdbImageUrl = (path: null | string) => {
  if (!path) {
    return ''
  }

  const imageBase = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/original'

  return `${imageBase}${path}`
}

export const fetchTMDB = async <T>(pathname: string, params = new URLSearchParams()) => {
  if (!process.env.TMDB_API_TOKEN) {
    throw new Error('TMDB_API_TOKEN is missing.')
  }

  params.set('language', getLanguage())

  const response = await fetch(`${tmdbBaseUrl}${pathname}?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export const fetchMovieBundle = async (movieId: number) => {
  const appendResponse = [
    'alternative_titles',
    'credits',
    'external_ids',
    'images',
    'keywords',
    'lists',
    'recommendations',
    'release_dates',
    'reviews',
    'similar',
    'translations',
    'videos',
  ].join(',')

  const [details, watchProviders, changes] = await Promise.all([
    fetchTMDB<TMDBMovieDetail>(
      `/movie/${movieId}`,
      new URLSearchParams({
        append_to_response: appendResponse,
        include_image_language: 'null,en,tr',
      }),
    ),
    fetchTMDB<unknown>(`/movie/${movieId}/watch/providers`),
    fetchTMDB<unknown>(`/movie/${movieId}/changes`, new URLSearchParams({ page: '1' })),
  ])

  return {
    changes,
    details,
    watchProviders,
  }
}
