'use client'

import { useRef } from 'react'
import FolderCard from './FolderCard'

import type { Movie } from '@/payload-types'

type FilmShelfProps = {
  id?: string
  title: string
  subtitle?: string
  movies: Movie[]
  mode?: 'row' | 'grid'
}

export default function FilmShelf({ id, title, subtitle, movies, mode = 'row' }: FilmShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Calculate how much to scroll: slightly less than the container width so users see context
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (!movies.length) return null

  return (
    <section className="shelf" id={id}>
      <div className="shelfHeader">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="eyebrow" style={{ marginTop: '8px', opacity: 0.7 }}>{subtitle}</p> : null}
        </div>
        <div className="shelfActions">
          {mode === 'row' && movies.length > 4 ? (
            <div className="shelfNav">
              <button onClick={() => handleScroll('left')} aria-label="Scroll Left" className="navBtn">
                ‹
              </button>
              <button onClick={() => handleScroll('right')} aria-label="Scroll Right" className="navBtn">
                ›
              </button>
            </div>
          ) : null}
          <div className="viewAllPill">View All ▸</div>
        </div>
      </div>

      <div 
        ref={mode === 'row' ? scrollRef : null}
        className={mode === 'grid' ? 'collectionGrid' : 'shelfRow'}
      >
        {movies.map((movie) => (
          <FolderCard key={movie.id} movie={movie} size={mode === 'grid' ? 'default' : 'shelf'} />
        ))}
      </div>
    </section>
  )
}
