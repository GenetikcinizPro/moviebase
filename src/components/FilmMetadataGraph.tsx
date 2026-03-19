import type { Movie } from '@/payload-types'

type FilmMetadataGraphProps = {
  movie: Movie
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export default function FilmMetadataGraph({ movie }: FilmMetadataGraphProps) {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 2000
  const currentYear = new Date().getFullYear()

  const metrics = [
    {
      label: 'Audience',
      value: clamp(((movie.voteAverage || 0) / 10) * 100),
      raw: `${movie.voteAverage?.toFixed(1) ?? '—'} / 10`,
    },
    {
      label: 'Momentum',
      value: clamp((movie.popularity || 0) / 2),
      raw: `${Math.round(movie.popularity || 0)}`,
    },
    {
      label: 'Runtime',
      value: clamp(((movie.runtime || 0) / 240) * 100),
      raw: movie.runtime ? `${movie.runtime} min` : '—',
    },
    {
      label: 'Legacy',
      value: clamp(((currentYear - releaseYear) / 50) * 100),
      raw: `${currentYear - releaseYear}y`,
    },
  ]

  // Build radar polygon points
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const maxR = 82

  const points = metrics
    .map((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2
      const r = maxR * (metric.value / 100)
      return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
    })
    .join(' ')

  // Axis endpoints for labels
  const axes = metrics.map((_, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2
    return {
      x2: cx + Math.cos(angle) * maxR,
      y2: cy + Math.sin(angle) * maxR,
    }
  })

  return (
    <section className="metadataGraph">
      <div className="graphHeader">
        <p className="eyebrow">Signal Profile</p>
        <h2>Metadata graph</h2>
      </div>

      <div className="graphShell">
        {/* Radar SVG */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="graphRadar"
          aria-label={`${movie.title} metadata radar`}
        >
          {/* Rings */}
          {[0.33, 0.66, 1].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={maxR * r}
              className="graphRing"
            />
          ))}

          {/* Axes */}
          {axes.map((ax, i) => (
            <line key={i} x1={cx} y1={cy} x2={ax.x2} y2={ax.y2} className="graphAxis" />
          ))}

          {/* Data shape */}
          <polygon points={points} className="graphShape" style={{ fill: 'rgba(0,0,0,0.05)', stroke: 'rgba(0,0,0,0.6)' }} />

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={3} fill="#000" />
        </svg>

        {/* Metric stats */}
        <div className="graphStats">
          {metrics.map((metric) => (
            <div key={metric.label} className="graphMetric">
              <span>{metric.label}</span>
              <strong>{metric.raw}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
