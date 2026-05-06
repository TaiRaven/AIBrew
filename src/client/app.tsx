import React, { useState, useEffect, useCallback } from 'react'
import TopNav from './components/TopNav'
import HomeView from './components/HomeView'
import CatalogView from './components/CatalogView'
import BrewView from './components/BrewView'
import { getViewParams, navigateToView } from './utils/navigate'

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
    window.addEventListener('aibrew:navigate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('aibrew:navigate', handlePopState)
    }
  }, [handlePopState])

  const view = params.get('view') || 'home'
  const knownViews = ['home', 'catalog', 'brew', 'history', 'analytics']
  const isUnknownView = !knownViews.includes(view)

  useEffect(() => {
    if (isUnknownView) navigateToView('home', {}, 'AIBrew')
  }, [isUnknownView])

  function renderContent() {
    switch (view) {
      case 'home':
        return <HomeView />
      case 'catalog':
        return <CatalogView params={params} />
      case 'brew':
        return <BrewView params={params} />
      case 'history':
      case 'analytics':
        return <DisabledView view={view} />
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--aibrew-paper)' }}>
      <TopNav currentTab={activeTab} />
      <main style={{ padding: 0 }}>
        {renderContent()}
      </main>
    </div>
  )
}
