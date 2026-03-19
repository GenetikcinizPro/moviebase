'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import type { Movie } from '@/payload-types'

type FolderCardProps = {
  movie: Movie
  size?: 'default' | 'large' | 'shelf'
  initialWatched?: boolean
}

export default function FolderCard({ movie, size = 'default', initialWatched = false }: FolderCardProps) {
  const [isWatched, setIsWatched] = useState(initialWatched)
  
  // Use custom poster/fanart if available, fallback to TMDB poster
  const image = movie.customPosterUrl || movie.posterUrl || ''
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'

  const toggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWatched(!isWatched)
    try {
      const res = await fetch('/api/history/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id }),
      })
      const data = await res.json()
      if (!data.success) {
        setIsWatched(isWatched) // Rollback if error
      }
    } catch (err) {
      console.error(err)
      setIsWatched(isWatched)
    }
  }

  return (
    <div className={`sceneCard sceneCard--${size}`}>
      <Link 
        href={`/movies/${movie.slug}`} 
        className="sceneArt"
        aria-label={movie.title}
      >
        {image ? (
          <Image
            src={image}
            alt={movie.title}
            fill
            sizes={size === 'shelf' ? '300px' : '(max-width: 820px) 100vw, 33vw'}
            className="sceneImage"
            loading="lazy"
          />
        ) : (
          <div className="sceneFallback">{movie.title}</div>
        )}

        {/* Watched Toggle Button (The visual Protcol checkmark) */}
        <button 
          onClick={toggleWatched}
          className={`sceneIndicator ${isWatched ? 'sceneIndicator--active' : ''}`} 
          aria-label={isWatched ? 'Remove from history' : 'Add to history'}
        >
          {isWatched ? '✓' : '+'}
        </button>
      </Link>

      <div className="sceneMeta">
        <h3 className="sceneTitle">{movie.title}</h3>
        <p className="sceneYear">{releaseYear}</p>
      </div>
    </div>
  )
}
