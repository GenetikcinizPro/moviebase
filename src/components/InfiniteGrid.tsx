'use client'

import React, { useState, useEffect, useRef } from 'react'
import FolderCard from './FolderCard'
import { motion, AnimatePresence } from 'framer-motion'
import type { Movie } from '@/payload-types'

type InfiniteGridProps = {
  initialMovies: Movie[]
  watchedIds: Array<string | number>
  filters?: { q?: string; category?: string; year?: string }
}

export default function InfiniteGrid({ initialMovies, watchedIds, filters }: InfiniteGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Reset if filters change
  useEffect(() => {
    setMovies(initialMovies)
    setPage(1)
    setHasMore(true)
  }, [initialMovies, filters])

  const loadMoreMovies = async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const nextPage = page + 1
      const query = new URLSearchParams({
        page: String(nextPage),
        limit: '24',
        ...(filters?.q && { q: filters.q }),
        ...(filters?.category && { genre: filters.category }),
      })

      const res = await fetch(`/api/movies?${query.toString()}`)
      const data = await res.json()
      
      if (data.docs && data.docs.length > 0) {
        setMovies(prev => [...prev, ...data.docs])
        setPage(nextPage)
        setHasMore(data.hasNextPage)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load more movies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMovies()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, page, loading, filters])

  return (
    <div className="infiniteGalleryContainer">
      <div className="collectionGrid">
        <AnimatePresence>
          {movies.map((movie, idx) => {
             const isWatched = watchedIds.includes(movie.id)
             return (
               <motion.div
                 key={`${movie.id}-${idx}`}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: (idx % 12) * 0.05 }}
               >
                 <FolderCard 
                   movie={movie} 
                   initialWatched={isWatched} 
                   size="default" 
                 />
               </motion.div>
             )
          })}
        </AnimatePresence>
      </div>

      {/* 🏹 The Intersection Trigger */}
      <div ref={observerTarget} className="loadMoreTrigger">
        {loading && (
          <div className="loaderPill">
            <span>Accessing more archival records...</span>
          </div>
        )}
      </div>
    </div>
  )
}
