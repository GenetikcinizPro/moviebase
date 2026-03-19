"use client"

import Image from 'next/image'
import Link from 'next/link'

import type { Movie } from '@/payload-types'

type Poster3DProps = {
  movie: Movie
  variant?: 'default' | 'shelf'
}

export default function Poster3D({ movie, variant = 'default' }: Poster3DProps) {
  const image = movie.customPosterUrl || movie.posterUrl
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'

  return (
    <Link href={`/movies/${movie.slug}`} className={`posterWrap posterWrap--${variant}`}>
      <div className="poster3d">
        {image ? (
          <Image
            src={image}
            alt={movie.title}
            fill
            sizes={variant === 'shelf' ? '220px' : '240px'}
            className="posterImg"
          />
        ) : (
          <div className="posterFallback">{movie.title}</div>
        )}
        <div className="posterGlow" />
      </div>

      <div className="posterMeta">
        <h3>{movie.title}</h3>
        <span>{releaseYear}</span>
      </div>
    </Link>
  )
}
