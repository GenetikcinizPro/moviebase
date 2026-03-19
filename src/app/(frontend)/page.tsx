import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import RegistryForm from '@/components/RegistryForm'
import InfiniteGrid from '@/components/InfiniteGrid'
import { getPublishedMovies, getWatchedMovieIds, getGenres } from '@/lib/movies'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { q, category, year } = await searchParams
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  
  const filters = { 
    q: typeof q === 'string' ? q : undefined,
    category: typeof category === 'string' ? category : undefined,
    year: typeof year === 'string' ? year : undefined,
  }

  const result = await getPublishedMovies(24, filters)
  const initialMovies = result.docs || []
  const genres = await getGenres()
  
  const watchedIds = user ? await getWatchedMovieIds(String(user.id)) : []

  return (
    <div className="pageShell homeShell">
      {/* ── Registry form ───────────────────────────────────────────────── */}
      <RegistryForm genres={genres} />

      {/* ── Infinite Cinematic Gallery ─────────────────────────────────── */}
      <section className="infiniteGallerySection">
        <InfiniteGrid 
          initialMovies={initialMovies} 
          watchedIds={watchedIds} 
          filters={filters}
        />
      </section>

      {/* ── Marketing Manifest Section ─────────────────────────────────── */}
      <section className="manifestGrid">
        <article className="manifestCard">
          <p className="eyebrow">CURATED TO PERFECTION</p>
          <h3>Industrial-grade archiving meets flawless cinematic presentation. This isn&apos;t just a database; it&apos;s a legacy.</h3>
        </article>
        <article className="manifestCard">
          <p className="eyebrow">IMMERSE IN DISCOVERY</p>
          <h3>Designed for the discerning eye. A high-resolution sanctuary where every asset is an interactive masterpiece.</h3>
        </article>
        <article className="manifestCard">
          <p className="eyebrow">BEYOND STREAMING</p>
          <h3>Escape the noise. Built for the elite collectors who demand absolute excellence from their film heritage.</h3>
        </article>
      </section>
    </div>
  )
}
