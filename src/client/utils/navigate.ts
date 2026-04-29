// Polaris iframe detection — required on every page per D-06 and CLAUDE.md

export function navigateToView(
  viewName: string,
  params: Record<string, string> = {},
  title = 'AIBrew'
): void {
  const urlParams = new URLSearchParams({ view: viewName, ...params })
  const relativePath = `${window.location.pathname}?${urlParams}`

  if (window.self !== window.top) {
    // Inside Polaris iframe — notify platform to update breadcrumb/permalink
    ;(window as any).CustomEvent.fireTop('magellanNavigator.permalink.set', {
      relativePath,
      title,
    })
  }
  // Always update URL and title directly (works both inside and outside Polaris)
  window.history.pushState({ viewName, ...params }, '', relativePath)
  document.title = title
  // pushState does not fire popstate — dispatch synthetically so React re-renders
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function getViewParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}
