import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { navigateToView } from '../utils/navigate'

interface Tile {
  id: string
  label: string
  description: string
  active: boolean
  view?: string
  section?: string
}

const TILES: Tile[] = [
  { id: 'roasters',  label: 'Roasters',  description: 'Your roasters',      active: true,  view: 'catalog', section: 'roasters'  },
  { id: 'equipment', label: 'Equipment', description: 'Grinders & brewers', active: true,  view: 'catalog', section: 'equipment' },
  { id: 'beans',     label: 'Beans',     description: '',                    active: false },
  { id: 'brew',      label: 'Brew Log',  description: 'Log your session',    active: true,  view: 'brew' },
  { id: 'recipes',   label: 'Recipes',   description: '',                    active: false },
  { id: 'history',   label: 'History',   description: '',                    active: false },
  { id: 'analytics', label: 'Analytics', description: '',                    active: false },
]

function TileCard({ tile }: { tile: Tile }) {
  const idx = TILES.indexOf(tile)
  const tilt = idx % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'

  const handleClicked = () => {
    if (!tile.active || !tile.view) return
    const params: Record<string, string> = {}
    if (tile.section) params.section = tile.section
    navigateToView(tile.view, params, `AIBrew — ${tile.label}`)
  }

  return (
    <Button
      onClicked={tile.active ? handleClicked : undefined}
      disabled={!tile.active}
      variant="tertiary"
      style={{
        minHeight: '96px',
        width: '100%',
        padding: 'var(--sp-md)',
        backgroundColor: tile.active ? 'var(--aibrew-paper-2)' : 'var(--aibrew-disabled-bg)',
        border: tile.active ? '1px solid rgba(29,26,23,0.2)' : 'none',
        borderRadius: '8px',
        transform: tile.active ? tilt : 'none',
        cursor: tile.active ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 'var(--sp-xs)',
        boxSizing: 'border-box',
        textAlign: 'left',
      }}
    >
      <div style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '20px', fontWeight: 600, lineHeight: 1.2, color: tile.active ? 'var(--aibrew-ink)' : 'var(--aibrew-disabled-fg)' }}>
        {tile.label}
      </div>
      {tile.active && tile.description && (
        <div style={{ fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', fontWeight: 400, color: 'var(--aibrew-ink-3)' }}>
          {tile.description}
        </div>
      )}
    </Button>
  )
}

export default function HomeView() {
  return (
    <div style={{ padding: 'var(--sp-md)', paddingTop: 'var(--sp-lg)' }}>
      <h1 style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '28px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: '0 0 var(--sp-lg) 0' }}>
        AIBrew
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-lg)' }}>
        {TILES.map(tile => <TileCard key={tile.id} tile={tile} />)}
      </div>
    </div>
  )
}
