"use client"

import Image from 'next/image'
import Link from 'next/link'

import type { Movie } from '@/payload-types'

type CustomPosterCardProps = {
  movie: Movie
}

export default function CustomPosterCard({ movie }: CustomPosterCardProps) {
  const image = movie.customPosterUrl || movie.posterUrl
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'

  return (
    <Link href={`/movies/${movie.slug}`} className="customPosterCard">
      <div className="customPosterStage">
        {image ? (
          <Image src={image} alt={movie.title} fill sizes="280px" className="customPosterImage" />
        ) : (
          <div className="posterFallback">{movie.title}</div>
        )}

        <div className="customPosterReflection" />
        <div className="customPosterEdge" />
        <div className="customPosterShadow" />
      </div>

      <div className="customPosterMeta">
        <strong>{movie.title}</strong>
        <span>{releaseYear}</span>
      </div>
    </Link>
  )
}
