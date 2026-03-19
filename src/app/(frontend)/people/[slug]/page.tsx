import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getMoviesByPerson, getPersonBySlug } from '@/lib/movies'
import InfiniteGrid from '@/components/InfiniteGrid'
import '../../styles.css'

export const dynamic = 'force-dynamic'

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const person = await getPersonBySlug(slug)

  if (!person) {
    return notFound()
  }

  const movies = await getMoviesByPerson(person.id)
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : 'N/A'

  return (
    <div className="pageShell personShell">
      
      <header className="personHeader">
        <div className="personProfile">
          {person.profileUrl ? (
            <div className="personImageWrapper">
              <Image 
                src={person.profileUrl} 
                alt={person.name} 
                fill 
                className="personImage"
                priority
              />
            </div>
          ) : (
            <div className="personImageFallback">{person.name[0]}</div>
          )}
          
          <div className="personInfo">
            <p className="eyebrow">{person.knownForDepartment || 'Talent'}</p>
            <h1 className="personName">{person.name}</h1>
            <div className="personMeta">
              <span>Born: {birthYear}</span>
              {person.placeOfBirth && <span> • {person.placeOfBirth}</span>}
            </div>
          </div>
        </div>

        {person.biography && (
          <div className="personBio">
            <p>{person.biography}</p>
          </div>
        )}
      </header>

      <section className="personFilmography">
        <div className="sectionHeader">
          <p className="eyebrow">THE ARCHIVE</p>
          <h2>Filmography ({movies.length})</h2>
        </div>
        <InfiniteGrid 
          initialMovies={movies} 
          watchedIds={[]} 
        />
      </section>

    </div>
  )
}
