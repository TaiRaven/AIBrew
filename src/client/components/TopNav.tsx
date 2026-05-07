import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { navigateToView } from '../utils/navigate'

const TAB_ITEMS = [
  { id: 'home',      label: 'Home',      disabled: false },
  { id: 'brew',      label: 'Brew',      disabled: false },
  { id: 'catalog',   label: 'Catalog',   disabled: false },
  { id: 'history',   label: 'History',   disabled: false },
  { id: 'analytics', label: 'Analytics', disabled: true  },
]

interface TopNavProps {
  currentTab: string
}

export default function TopNav({ currentTab }: TopNavProps) {
  const handleTabClick = (tabId: string) => {
    const tab = TAB_ITEMS.find(t => t.id === tabId)
    if (!tab || tab.disabled) return
    navigateToView(tabId, {}, `AIBrew — ${tab.label}`)
    // App re-renders via the aibrew:navigate event listener — no callback needed
  }

  return (
    <div style={{
      backgroundColor: 'var(--aibrew-paper-2)',
      borderBottom: '1px solid rgba(29,26,23,0.15)',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--sp-md)',
      gap: 0,
    }}>
      {TAB_ITEMS.map(item => (
        <Button
          key={item.id}
          onClicked={() => handleTabClick(item.id)}
          disabled={item.disabled}
          variant="tertiary"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: item.id === currentTab ? '2px solid var(--aibrew-accent)' : '2px solid transparent',
            borderRadius: 0,
            padding: '0 var(--sp-md)',
            height: '48px',
            fontFamily: 'var(--aibrew-font-body)',
            fontSize: '14px',
            fontWeight: item.id === currentTab ? 600 : 400,
            color: item.disabled
              ? 'var(--aibrew-disabled-fg)'
              : item.id === currentTab
                ? 'var(--aibrew-ink)'
                : 'var(--aibrew-ink-3)',
            cursor: item.disabled ? 'default' : 'pointer',
          }}
        >
          {item.label}
        </Button>
      ))}
    </div>
  )
}
