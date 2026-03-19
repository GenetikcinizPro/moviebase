'use client'

import React, { useState } from 'react'

const AdminAssetManager: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [cdnUrl, setCdnUrl] = useState('')
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSearch = async () => {
    if (!query) return
    setLoading(true)
    setMessage('')
    try {
      const resp = await fetch('/api/tmdb/search-local', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await resp.json()
      setResults(data.docs || [])
    } catch (err) {
      console.error(err)
      setMessage('Search failed')
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!selectedMovie || !cdnUrl) {
      setMessage('Movie selection and URL are required')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const resp = await fetch('/api/tmdb/custom-poster', {
        method: 'POST',
        body: JSON.stringify({ id: selectedMovie.id, customPosterUrl: cdnUrl }),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await resp.json()
      if (data.success) {
        setMessage(`Successfully updated ${selectedMovie.title}`)
        setSelectedMovie(null)
        setCdnUrl('')
        setResults([])
        setQuery('')
      } else {
        setMessage('Update failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      setMessage('Update error')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', background: '#111', borderRadius: '12px', color: '#fff', marginBottom: '40px', border: '1px solid #333' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#E50914' }}>Cloudinary / CDN Poster Manager</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Film Isminden Ara..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: '0 24px', borderRadius: '8px', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Ariyor...' : 'Bul'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', padding: '10px', background: '#1a1a1a', borderRadius: '8px' }}>
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: selectedMovie?.id === movie.id ? '#E50914' : '#2a2a2a',
                cursor: 'pointer',
                border: '1px solid #444',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{movie.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMovie && (
        <div style={{ padding: '20px', background: '#222', borderRadius: '8px', border: '1px solid #E50914' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Selected Movie:</strong> <span style={{ color: '#E50914' }}>{selectedMovie.title}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#999' }}>Cloudinary / Herhangi Bir Image Linki Yapistir:</label>
            <input
              type="text"
              value={cdnUrl}
              onChange={(e) => setCdnUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/demo/image/upload/..."
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff' }}
            />
            <button
              onClick={handleUpdate}
              disabled={loading || !cdnUrl}
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: '#E50914',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                marginTop: '10px',
                border: 'none'
              }}
            >
              {loading ? 'Guncelleniyor...' : 'Poster Olarak Ata'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: message.includes('Success') ? '#2e7d32' : '#c62828', color: '#fff', textAlign: 'center' }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default AdminAssetManager
