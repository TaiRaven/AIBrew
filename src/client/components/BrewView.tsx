import React from 'react'

export default function BrewView({ params }: { params: URLSearchParams }) {
  return (
    <div style={{ padding: 'var(--sp-md)', fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>
      <h2 style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '24px', fontWeight: 600, margin: '0 0 var(--sp-md) 0' }}>
        Brew Log
      </h2>
      <p style={{ color: 'var(--aibrew-ink-3)', fontSize: '16px' }}>
        Brew form loading…
      </p>
    </div>
  )
}
