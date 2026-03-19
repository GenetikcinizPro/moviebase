import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import CinematicHero from '@/components/CinematicHero'
import FilmShelf from '@/components/FilmShelf'
import MetadataPanel from '@/components/MetadataPanel'
import { getMovieBySlug, getRelatedMovies } from '@/lib/movies'
import '../../styles.css'

export const dynamic = 'force-dynamic'

export default async function MovieDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const movie = await getMovieBySlug(slug)

  if (!movie) notFound()

  const relatedMoviesBatch = await getRelatedMovies(movie, 6)
  
  const credits = movie.tmdbRaw?.credits as
    | {
        cast?: Array<{ character?: string; name?: string; profile_path?: string }>
        crew?: Array<{ job?: string; name?: string; profile_path?: string }>
      }
    | null
    | undefined
  
  const images = movie.tmdbRaw?.images as
    | {
        backdrops?: Array<{ file_path?: string }>
        posters?: Array<{ file_path?: string }>
      }
    | null
    | undefined

  const gallery = [
    ...((images?.backdrops || []).slice(0, 4).map((item) => item.file_path).filter(Boolean) as string[]),
    ...((images?.posters || []).slice(0, 2).map((item) => item.file_path).filter(Boolean) as string[]),
  ].map((path) => `https://image.tmdb.org/t/p/original${path}`)

  // Ensure collection is type-safe
  const partOfCollection = movie.collection && typeof movie.collection === 'object' ? (movie.collection as any) : null

  return (
    <div className="pageShell detailShell">
      
      {/* ── Editorial Cinematic Header ── */}
      <CinematicHero
        movie={movie}
        variant="detail"
        primaryCTA={movie.sourceLinks?.tmdb ? { href: movie.sourceLinks.tmdb, label: 'TMDB Kaydi' } : undefined}
        secondaryCTA={movie.sourceLinks?.imdb ? { href: movie.sourceLinks.imdb, label: 'IMDb' } : undefined}
      />

      <div className="detailContainer">
        <Link className="backLink" href="/" style={{ display: 'inline-block', marginBottom: '32px', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          ← Back to Collection
        </Link>
        
        {partOfCollection && (
          <div className="collectionInlet">
            <p className="eyebrow">PART OF FRANCHISE</p>
            <Link href={`/collections/${partOfCollection.slug}`} className="collectionLink">
              <h3>{partOfCollection.name} Collection →</h3>
            </Link>
          </div>
        )}
        
        <div className="detailSplit">
          <MetadataPanel movie={movie} />
        </div>

        <section className="sectionBlock">
          <div className="sectionHeading">
            <p className="eyebrow">Synopsis</p>
            <h2>Archive Record</h2>
          </div>
          <p className="proseBlock">{movie.overview || 'Synopsis is not available for this record.'}</p>
        </section>

        {(movie.directors?.length || movie.cast?.length) ? (
          <section className="sectionBlock">
            <div className="sectionHeading">
              <p className="eyebrow">Cast & Crew</p>
              <h2>People behind the signal</h2>
            </div>
            <div className="castGrid">
              {movie.directors?.map((p: any) => (
                <Link key={typeof p === 'object' ? p.id : p} href={`/people/${p.slug}`} className="castCard">
                  <span className="castRole">Director</span>
                  <strong className="castName">{p.name || 'Unknown'}</strong>
                </Link>
              ))}
              {movie.cast?.map((item: any, idx: number) => {
                const p = item.person
                if (!p) return null
                return (
                  <Link key={`${p.id}-${idx}`} href={`/people/${p.slug}`} className="castCard">
                    <span className="castRole">{item.character || 'Cast'}</span>
                    <strong className="castName">{p.name || 'Unknown'}</strong>
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}

        {gallery.length ? (
          <section className="sectionBlock">
            <div className="sectionHeading">
              <p className="eyebrow">Gallery</p>
              <h2>Visual Archive</h2>
            </div>
            <div className="galleryGrid">
              {gallery.map((src) => (
                <div key={src} className="galleryTile">
                  <Image
                    src={src}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 820px) 100vw, 33vw"
                    className="galleryImage"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <FilmShelf
          title="Adjacent Signals"
          subtitle="Aynı duygusal banddaki diğer kayıtlar"
          movies={relatedMoviesBatch.slice(0, 6)}
        />
      </div>
    </div>
  )
}
