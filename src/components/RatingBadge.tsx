type RatingBadgeProps = {
  label: string
  value: string
}

export default function RatingBadge({ label, value }: RatingBadgeProps) {
  return (
    <div className="ratingBadge">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
