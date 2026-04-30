import { useState } from 'react'
import { RiStarFill, RiStarLine } from 'react-icons/ri'

export default function StarRating({ rating, setRating, size = 24, interactive = true }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="star-rating-container" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && setRating(star)}
          style={{ 
            cursor: interactive ? 'pointer' : 'default',
            color: star <= (hover || rating) ? '#f59e0b' : '#e2e8f0',
            transition: 'color 0.2s'
          }}
        >
          {star <= (hover || rating) ? <RiStarFill size={size} /> : <RiStarLine size={size} />}
        </span>
      ))}
    </div>
  )
}
