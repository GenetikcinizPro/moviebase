import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import InfiniteGrid from '@/components/InfiniteGrid'
import type { Movie } from '@/payload-types'
import '../../styles.css'

export const dynamic = 'force-dynamic'

async function getCollectionBySlug(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'movie-collections',
    where: { slug: { equals: slug } },
    depth: 1, // Populates movies via join
    limit: 1,
  })
  return result.docs[0] || null
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    return notFound()
  }

  // Payload 'join' fields populate automatically with depth > 0
  const movies = (collection.movies?.docs || []) as Movie[]

  return (
    <div className="pageShell collectionShell">
      
      <header className="collectionHero">
        {collection.backdropUrl && (
          <div className="collectionBackdrop">
            <Image 
              src={collection.backdropUrl} 
              alt={collection.name} 
              fill 
              className="backdropImage"
              priority
            />
            <div className="backdropOverlay" />
          </div>
        )}
        
        <div className="collectionHeroContent">
          <p className="eyebrow">CINEMATIC UNIVERSE</p>
          <h1 className="collectionName">{collection.name}</h1>
          {collection.overview && <p className="collectionOverview">{collection.overview}</p>}
        </div>
      </header>

      <section className="collectionGridSection">
        <div className="sectionHeader">
          <p className="eyebrow">THE ARCHIVE</p>
          <h2>Franchise Records ({movies.length})</h2>
        </div>
        <InfiniteGrid 
          initialMovies={movies} 
          watchedIds={[]} 
        />
      </section>

    </div>
  )
}
