import FilmShelf from '@/components/FilmShelf'
import { getCuratedShelves, getGenreShelves } from '@/lib/movies'

export const dynamic = 'force-dynamic'

import { getGenres } from '@/lib/movies'
import GenreGraph from '@/components/GenreGraph'

export default async function CollectionsPage() {
  const genres = await getGenres()

  return (
    <div className="pageShell">
      <section className="pageHero">
        <p className="eyebrow">Interactive Cartography</p>
        <h1>Archive Galaxy</h1>
        <p className="lede">
          Flat raflar yerine interaktif bir yildiz haritasi. Secili turun uzerine tiklayarak arsivdeki yorüngesini kesfedin.
        </p>
      </section>

      {/* 🌌 The Cinematic Galaxy Graph */}
      <GenreGraph 
        genres={genres.map(g => ({ id: g.id, name: g.name, slug: g.slug }))} 
        initialGenre={genres[0]?.slug}
      />
    </div>
  )
}
