'use client'

import React, { useState } from 'react'

export default function AdminTMDBImport() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/tmdb/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.results) {
        setResults(data.results.slice(0, 8)) // Show top 8 results
      } else {
        setMessage('No results found.')
      }
    } catch (err: any) {
      setMessage(`Search error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (movie: any) => {
    setImportingId(movie.id)
    setMessage(`Importing "${movie.title}"...`)

    try {
      const res = await fetch('/api/tmdb/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: movie.id }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage(`Success! ${data.title} was ${data.action.toUpperCase()}.`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Import error: ${err.message}`)
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e1e1e1',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '32px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600 }}>TMDB Importer Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>
        Search for any movie on TMDB and click import to fetch all metadata, payload schemas, assets, and providers securely via the backend.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Movie title... (e.g. Interstellar)"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#000',
            color: '#fff',
            padding: '0 24px',
            borderRadius: '4px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {message && (
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
          <strong>Status: </strong> {message}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {results.map((m) => (
            <div key={m.id} style={{
              border: '1px solid #eaeaea',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#fafafa'
            }}>
              <div style={{
                width: '100%',
                aspectRatio: '2/3',
                backgroundColor: '#eee',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                {m.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                    alt={m.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#999', fontSize: '0.8rem' }}>No Image</div>
                )}
              </div>
              <strong style={{ fontSize: '1rem', lineHeight: 1.2 }}>{m.title}</strong>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{m.release_date?.substring(0, 4) || 'TBA'} • TMDB ID: {m.id}</span>
              
              <button
                onClick={() => handleImport(m)}
                disabled={importingId === m.id}
                style={{
                  marginTop: 'auto',
                  background: importingId === m.id ? '#ccc' : '#222',
                  color: '#fff',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: importingId === m.id ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {importingId === m.id ? 'Importing Data...' : 'Import to Database'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
