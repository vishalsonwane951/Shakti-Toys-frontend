import React from 'react'
export default function StarRating({ rating, size = 'sm' }) {
  return (
    <span className="rating-stars">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi ${i <= Math.round(rating) ? 'bi-star-fill' : i - 0.5 <= rating ? 'bi-star-half' : 'bi-star'}`} style={{fontSize: size === 'lg' ? '1.1rem' : '0.85rem'}}></i>
      ))}
    </span>
  )
}
