'use client'

import React, { useState } from 'react'

type FilmActionsProps = {
  movieId: number | string
  initialWatched?: boolean
  initialWatchlisted?: boolean
}

export default function FilmActions({ movieId, initialWatched = false, initialWatchlisted = false }: FilmActionsProps) {
  const [watched, setWatched] = useState(initialWatched)
  const [watchlisted, setWatchlisted] = useState(initialWatchlisted)
  const [loading, setLoading] = useState(false)

  const toggleWatchlist = async () => {
    // Optimistic UI update
    setWatchlisted(!watchlisted)
    setLoading(true)
    try {
      // Future API Call: await fetch('/api/actions/watchlist', { method: 'POST', body: JSON.stringify({ movieId }) })
      console.log(`Toggled watchlist for movie ${movieId}`)
    } catch {
      setWatchlisted(watchlisted) // rollback
    }
    setLoading(false)
  }

  const toggleWatched = async () => {
    // Optimistic UI update
    setWatched(!watched)
    setLoading(true)
    try {
      // Future API Call: await fetch('/api/actions/history', { method: 'POST', body: JSON.stringify({ movieId }) })
      console.log(`Toggled watch history for movie ${movieId}`)
    } catch {
      setWatched(watched) // rollback
    }
    setLoading(false)
  }

  return (
    <div className="filmActionsGroup" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <button 
        onClick={toggleWatched}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: watched ? 'var(--text)' : 'rgba(109, 109, 110, 0.7)',
          color: watched ? 'var(--bg)' : '#fff',
          padding: '12px 24px',
          borderRadius: 'var(--r-sm)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
          border: 'none'
        }}
      >
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{watched ? '✓' : '＋'}</span>
        {watched ? 'Watched' : 'Watch History'}
      </button>

      <button 
        onClick={toggleWatchlist}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: watchlisted ? 'var(--accent)' : 'rgba(109, 109, 110, 0.7)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 'var(--r-sm)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
          border: 'none'
        }}
      >
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{watchlisted ? '★' : '＋'}</span>
        {watchlisted ? 'Watchlisted' : 'My List'}
      </button>
    </div>
  )
}
