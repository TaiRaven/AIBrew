import React, { useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { getViewParams, navigateToView } from '../utils/navigate'
import RoasterSection from './RoasterSection'
import EquipmentSection from './EquipmentSection'

const SUB_NAV = [
  { id: 'roasters',  label: 'Roasters',  disabled: false },
  { id: 'equipment', label: 'Equipment', disabled: false },
  { id: 'beans',     label: 'Beans',     disabled: true  },
  { id: 'recipes',   label: 'Recipes',   disabled: true  },
]

interface CatalogViewProps {
  params: URLSearchParams
}

export default function CatalogView({ params }: CatalogViewProps) {
  const section = params.get('section') || 'roasters'

  useEffect(() => {
    if (!params.get('section')) {
      navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Catalog')
    }
  }, [params])

  const handleSection = (id: string) => {
    const item = SUB_NAV.find(i => i.id === id)
    if (!item || item.disabled) return
    navigateToView('catalog', { section: id }, `AIBrew — ${item.label}`)
  }

  function renderSection() {
    switch (section) {
      case 'roasters':
        return <RoasterSection />
      case 'equipment':
        return <EquipmentSection />
      default:
        return null
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, height: '40px', alignItems: 'center', backgroundColor: 'var(--aibrew-paper-2)', padding: '0 var(--sp-md)', borderBottom: '1px dashed rgba(158,136,116,0.4)' }}>
        {SUB_NAV.map(item => {
          const isActive = item.id === section
          return (
            <Button
              key={item.id}
              onClicked={() => handleSection(item.id)}
              disabled={item.disabled}
              variant="tertiary"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--aibrew-accent)' : '2px solid transparent',
                borderRadius: 0,
                padding: '0 var(--sp-md)',
                height: '40px',
                fontFamily: 'var(--aibrew-font-body)',
                fontSize: '14px',
                color: item.disabled ? 'var(--aibrew-disabled-fg)' : isActive ? 'var(--aibrew-ink)' : 'var(--aibrew-ink-3)',
                cursor: item.disabled ? 'default' : 'pointer',
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </div>
      {renderSection()}
    </div>
  )
}
