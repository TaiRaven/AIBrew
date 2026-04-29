import React, { useState, useEffect, useCallback } from 'react'
import TopNav from './components/TopNav'
import { getViewParams, navigateToView } from './utils/navigate'

// HomeView and CatalogView will be imported here once 01-PLAN-04 and 01-PLAN-05 complete.

function getActiveTab(params: URLSearchParams): string {
  const view = params.get('view')
  if (!view || view === 'home') return 'home'
  if (view === 'catalog') return 'catalog'
  if (['brew', 'history', 'analytics'].includes(view)) return view
  return 'home'
}

function DisabledView({ view }: { view: string }) {
  const labels: Record<string, string> = {
    brew: 'Brew logging',
    history: 'Brew history',
    analytics: 'Analytics',
  }
  return (
    <div style={{ padding: 'var(--sp-xl)', textAlign: 'center', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px' }}>
      {labels[view] || 'This section'} is coming in a future update.
    </div>
  )
}

export default function App() {
  const [params, setParams] = useState<URLSearchParams>(getViewParams)
  const activeTab = getActiveTab(params)

  // Redirect bare URL (no params) to ?view=home
  useEffect(() => {
    if (!params.get('view')) {
      navigateToView('home', {}, 'AIBrew')
      setParams(getViewParams())
    }
  }, [])

  // Re-render on browser back/forward
  const handlePopState = useCallback(() => {
    setParams(getViewParams())
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  const handleTabChange = (_tabId: string) => {
    setParams(getViewParams())
  }

  const view = params.get('view') || 'home'

  function renderContent() {
    switch (view) {
      case 'home':
        // HomeView — created in 01-PLAN-04
        return <div style={{ padding: 'var(--sp-xl)', fontFamily: 'var(--aibrew-font-disp)', fontSize: '28px', fontWeight: 600, color: 'var(--aibrew-ink)' }}>AIBrew — Home (placeholder)</div>
      case 'catalog':
        // CatalogView — created in 01-PLAN-04
        return <div style={{ padding: 'var(--sp-xl)', fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>Catalog (placeholder)</div>
      case 'brew':
      case 'history':
      case 'analytics':
        return <DisabledView view={view} />
      default:
        navigateToView('home', {}, 'AIBrew')
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--aibrew-paper)' }}>
      <TopNav currentTab={activeTab} onTabChange={handleTabChange} />
      <main style={{ padding: 0 }}>
        {renderContent()}
      </main>
    </div>
  )
}
