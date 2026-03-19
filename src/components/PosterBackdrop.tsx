import Image from 'next/image'

type PosterBackdropProps = {
  alt: string
  src: string
}

export default function PosterBackdrop({ alt, src }: PosterBackdropProps) {
  if (!src) return null

  return (
    <div className="detailBackdrop">
      <Image alt={alt} className="detailBackdropImage" fill priority sizes="100vw" src={src} />
    </div>
  )
}
