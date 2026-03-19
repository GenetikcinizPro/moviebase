import GenreChip from './GenreChip'
import RatingBadge from './RatingBadge'

import type { Movie, Genre } from '@/payload-types'

type MetadataPanelProps = {
  movie: Movie
}

export default function MetadataPanel({ movie }: MetadataPanelProps) {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'
  const rating = typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : '-'
  const country = movie.productionCountries?.[0]?.name || 'Unknown'
  
  // Safe collection access
  const collectionData = movie.collection && typeof movie.collection === 'object' ? movie.collection : null
  const collectionName = collectionData?.name || 'Standalone'

  return (
    <section className="metadataPanel">
      <div className="sectionHeading">
        <p className="eyebrow">Metadata Panel</p>
        <h2>Film dossier</h2>
      </div>
      <div className="metadataGrid">
        <div className="metadataBlock"><span>Year</span><strong>{releaseYear}</strong></div>
        <div className="metadataBlock"><span>Runtime</span><strong>{movie.runtime ? `${movie.runtime} min` : 'Unknown'}</strong></div>
        <div className="metadataBlock"><span>Country</span><strong>{country}</strong></div>
        <div className="metadataBlock"><span>Language</span><strong>{movie.originalLanguage || 'Unknown'}</strong></div>
        <div className="metadataBlock"><span>Collection</span><strong>{collectionName}</strong></div>
        <div className="metadataBlock"><span>Status</span><strong>{movie.status}</strong></div>
      </div>
      <div className="metadataBadges">
        <RatingBadge label="TMDB" value={rating} />
        <RatingBadge label="Votes" value={`${movie.voteCount || 0}`} />
        <RatingBadge label="Popularity" value={`${Math.round(movie.popularity || 0)}`} />
      </div>
      <div className="metadataGenres">
        {(movie.genres || []).map((genre) => {
          const g = genre as Genre
          const name = g.name || 'Genre'
          return <GenreChip key={`${movie.id}-${name}`} label={name} />
        })}
      </div>
      {movie.productionCompanies?.length ? (
        <div className="metadataStudios">
          <span>Studios</span>
          <p>{movie.productionCompanies.map((company) => company.name).join(', ')}</p>
        </div>
      ) : null}
    </section>
  )
}
