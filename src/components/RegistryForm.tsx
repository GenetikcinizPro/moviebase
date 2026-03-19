'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import type { Genre } from '@/payload-types'

export default function RegistryForm({ genres = [] }: { genres?: Genre[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All Assets')
  const [year, setYear] = useState(searchParams.get('year') || 'All Eras')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category !== 'All Assets') params.set('category', category)
    if (year !== 'All Eras') params.set('year', year)
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <section className="registrySection">
      <div className="registryContainer">
        <form className="registryForm" onSubmit={handleSubmit}>
          
          <div className="registryField registryField--main">
            <label htmlFor="search">Deep Search</label>
            <input 
              type="text" 
              id="search" 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, director or cast..." 
              autoComplete="off"
            />
          </div>

          <div className="registryField">
            <label htmlFor="category">Archive Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All Assets</option>
              {genres.map(g => (
                <option key={g.id} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="registryField">
            <label htmlFor="year">Timeline</label>
            <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
              <option>All Eras</option>
              <option>2050s</option>
              <option>2020s</option>
              <option>Classic</option>
            </select>
          </div>

          <button type="submit" className="registrySubmit">
            Access Registry
          </button>

        </form>
      </div>
    </section>
  )
}
