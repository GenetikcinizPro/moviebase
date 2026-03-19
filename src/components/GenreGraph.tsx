'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type Movie = {
  id: string | number
  title: string
  posterUrl?: string
  slug?: string
}

type GenreGraphProps = {
  initialGenre?: string
  genres: Array<{ id: string | number; name: string; slug: string }>
}

export default function GenreGraph({ initialGenre, genres }: GenreGraphProps) {
  const [activeGenre, setActiveGenre] = useState(initialGenre || genres[0]?.slug)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch movies for the active genre
  useEffect(() => {
    if (!activeGenre) return

    const fetchMovies = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/movies?genre=${activeGenre}&limit=40`)
        const data = await res.json()
        setMovies(data.docs || [])
      } catch (err) {
        console.error('Failed to fetch genre movies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [activeGenre])

  return (
    <div className="graphContainer">
      {/* 🌪️ Genre Cloud (The Controls) */}
      <div className="genreCloud" style={{ marginBottom: '2rem', position: 'relative', zIndex: 100 }}>
        {genres.map((g) => {
          const weight = (g.name.length % 3) + 1
          const isActive = activeGenre === g.slug

          return (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g.slug)}
              className={`genreCloudItem genreCloudItem--${weight} ${isActive ? 'genreCloudItem--active' : ''}`}
            >
              {g.name}
            </button>
          )
        })}
      </div>

      {/* 🌌 The Graph Visualization Stage */}
      <div className="graphStage">
        <AnimatePresence mode="wait">
          {!loading ? (
            <motion.div 
              key={activeGenre}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="graphGalaxy"
            >
              {/* Central Node */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="graphNode graphNode--center"
              >
                <span>{genres.find(g => g.slug === activeGenre)?.name}</span>
              </motion.div>

              {/* Movie Nodes (Dual Ring) */}
              {movies.map((movie, idx) => {
                // Determine which orbit the movie belongs to
                const isInnerOrbit = idx < 15
                const orbitCount = isInnerOrbit ? 15 : (movies.length - 15)
                const relativeIdx = isInnerOrbit ? idx : (idx - 15)

                const angle = (relativeIdx / orbitCount) * Math.PI * 2
                const distance = isInnerOrbit ? 280 : 480
                
                // Add some stylistic randomness
                const variance = Math.random() * 40 - 20
                const finalDistance = distance + variance
                
                const x = Math.cos(angle) * finalDistance
                const y = Math.sin(angle) * finalDistance

                return (
                  <Link key={movie.id} href={`/movies/${movie.slug}`}>
                    <motion.div
                      className="graphNode graphNode--movie"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{ 
                        x, 
                        y, 
                        opacity: 1, 
                        scale: 1,
                        transition: { 
                           delay: idx * 0.02, 
                           type: 'spring', 
                           stiffness: 80,
                           damping: 15
                        } 
                      }}
                      whileHover={{ scale: 1.2, zIndex: 100 }}
                    >
                      <div className="graphNode__poster" style={{ backgroundImage: `url(${movie.posterUrl})` }} />
                      <div className="graphNode__label">{movie.title}</div>
                      
                      <svg className="graphNode__line" style={{ top: '45px', left: '45px' }}>
                        <motion.line 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.5 + idx * 0.02, duration: 1 }}
                          x1="0" y1="0" x2={-x} y2={-y} 
                          stroke="rgba(255,255,255,0.15)" strokeWidth="1" 
                        />
                      </svg>
                    </motion.div>
                  </Link>
                )
              })}
            </motion.div>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="graphLoader"
             >
                Synthesizing {activeGenre} Galaxy...
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
