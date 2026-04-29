import React from 'react'
import { Tabs } from '@servicenow/react-components/Tabs'
import { navigateToView } from '../utils/navigate'

// All 5 tabs defined here. Phase 1 activates Home and Catalog.
// Disabled tabs (Brew, History, Analytics) are rendered but block navigation.
const TAB_ITEMS = [
  { id: 'home',      label: 'Home',      disabled: false },
  { id: 'brew',      label: 'Brew',      disabled: true  },
  { id: 'catalog',   label: 'Catalog',   disabled: false },
  { id: 'history',   label: 'History',   disabled: true  },
  { id: 'analytics', label: 'Analytics', disabled: true  },
]

interface TopNavProps {
  currentTab: string
  onTabChange: (tabId: string) => void
}

export default function TopNav({ currentTab, onTabChange }: TopNavProps) {
  const handleSelectedItemSet = (e: CustomEvent) => {
    const tabId = e.detail?.value
    const tab = TAB_ITEMS.find(t => t.id === tabId)
    // Silently block disabled tabs — no navigation, no toast, no error (UI-SPEC §8.2)
    if (!tab || tab.disabled) return
    onTabChange(tabId)
    navigateToView(tabId, {}, `AIBrew — ${tab.label}`)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--aibrew-paper-2)',
        borderBottom: '1px solid rgba(29,26,23,0.15)',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Tabs
        items={TAB_ITEMS}
        selectedItem={currentTab}
        onSelectedItemSet={handleSelectedItemSet}
        style={{ width: '100%' }}
      />
    </div>
  )
}
