type GenreChipProps = {
  label: string
}

export default function GenreChip({ label }: GenreChipProps) {
  return <span className="genreChip">{label}</span>
}
