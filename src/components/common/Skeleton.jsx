import React from 'react'
export function ProductCardSkeleton() {
  return (
    <div className="card border-0 rounded-3 overflow-hidden" style={{boxShadow:'var(--card-shadow)'}}>
      <div className="skeleton" style={{height:'220px'}}></div>
      <div className="card-body">
        <div className="skeleton mb-2" style={{height:'20px',width:'80%'}}></div>
        <div className="skeleton mb-2" style={{height:'16px',width:'50%'}}></div>
        <div className="skeleton" style={{height:'36px'}}></div>
      </div>
    </div>
  )
}
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="row g-3">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3"><ProductCardSkeleton /></div>
      ))}
    </div>
  )
}
