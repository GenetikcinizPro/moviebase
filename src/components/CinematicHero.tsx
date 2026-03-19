'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Movie } from '@/payload-types'

type CinematicHeroProps = {
  movie: Movie
  variant?: 'hero' | 'detail'
  primaryCTA?: { href: string; label: string }
  secondaryCTA?: { href: string; label: string }
}

export default function CinematicHero({ 
  movie, 
  variant = 'hero', 
  primaryCTA, 
  secondaryCTA 
}: CinematicHeroProps) {
  
  const backdrop = movie.backdropUrl || movie.posterUrl || ''
  
  return (
    <section className={`cinematicHero cinematicHero--${variant}`}>
      {/* ── Background Layer ── */}
      <div className="heroBackdrop">
        {backdrop && (
          <Image
            src={backdrop}
            alt={movie.title}
            fill
            priority
            className="heroImage"
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        )}
        <div className="heroOverlay" />
      </div>

      {/* ── Content Layer ── */}
      <div className="heroContent">
        <div className="heroInner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {movie.tagline && <p className="heroTagline eyebrow">{movie.tagline}</p>}
            <h1 className="heroTitle">{movie.title}</h1>
            
            <div className="heroMeta">
              <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}</span>
              {movie.runtime && <span>{movie.runtime} MINUTES</span>}
              {movie.voteAverage && <span>RATING: {movie.voteAverage.toFixed(1)}</span>}
            </div>

            <div className="heroActions">
              {primaryCTA && (
                <a href={primaryCTA.href} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  {primaryCTA.label}
                </a>
              )}
              {secondaryCTA && (
                <a href={secondaryCTA.href} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
                  {secondaryCTA.label}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* ── Visual Shadow Anchor ── */}
      <div className="heroShadow" />
    </section>
  )
}
