import React from 'react'
import Link from 'next/link'
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google'
import ThemeToggle from '@/components/ThemeToggle'
import './styles.css'

export const metadata = {
  description:
    'MovieBase — collector-grade cinematic archive. Fanart-first, metadata-obsessed, built for film curators.',
  title: 'MovieBase — Collector Archive',
}

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const uiFont = Manrope({
  subsets: ['latin'],
  variable: '--font-ui',
  weight: ['400', '500', '600', '700', '800'],
})

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="tr" data-theme="dark">
      <body className={`${displayFont.variable} ${uiFont.variable} ${monoFont.variable}`}>
        <div className="siteChrome">

          {/* ── Sticky Header ─────────────────────────────────────────── */}
          <header className="siteHeader">
            <Link className="brandLockup" href="/">
              <span className="brandText">MovieBase</span>
            </Link>

            <div className="searchPill">
              Global Search ▾
            </div>

            <nav className="siteNav" aria-label="Main navigation">
              <Link href="/">Discover</Link>
              <Link href="/collections">Calendar</Link>
              <Link href="/movies">Watchlist</Link>
              <Link href="/admin">History</Link>
            </nav>

            <div className="headerActions">
              <ThemeToggle />
              <Link href="/admin" className="profileBtn">Profiles</Link>
            </div>
          </header>

          <main>{children}</main>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <footer className="siteFooter">
            <p>
              2054 archive protocol — built for film collectors, curators and metadata obsessives.
              <br />
              Powered by Payload CMS & TMDB.
            </p>
            <div>
              <Link href="/">Home</Link>
              <Link href="/discover">Discover</Link>
              <Link href="/collections">Collections</Link>
            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
