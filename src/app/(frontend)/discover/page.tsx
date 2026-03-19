import FolderCard from '@/components/FolderCard'
import { getPublishedMovies } from '@/lib/movies'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const movies = await getPublishedMovies(48)

  return (
    <div className="pageShell">
      <section className="pageHero">
        <p className="eyebrow">Discover</p>
        <h1>Yeni jenerasyon film arayüzü, sıradan katalog değil.</h1>
        <p className="lede">
          Yüksek oy, güçlü popülerlik ve özel poster katmanı ile kurgulanan sinematik bir keşif ekranı.
        </p>
      </section>

      <section className="filterBar">
        <span>Toplam {movies.totalDocs} kayıt</span>
        <span>Sıralama: Popülerlik</span>
        <span>Durum: Published</span>
        <span>Mode: Discover</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="filterChip filterChip--active">All</button>
          <button className="filterChip">Recent</button>
          <button className="filterChip">Highest Rated</button>
        </div>
      </section>

      <section className="collectionGrid">
        {movies.docs.map((movie) => (
          <FolderCard key={movie.id} movie={movie} />
        ))}
      </section>
    </div>
  )
}
