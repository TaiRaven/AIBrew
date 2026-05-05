import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { navigateToView } from '../utils/navigate'
import { display, value } from '../utils/fields'

const RECIPE_TABLE = 'x_664529_aibrew_recipe'
const SYS_ID_RE = /^[0-9a-f]{32}$/i

const modalHeadingStyle = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}

// ─── RecipeCard ───────────────────────────────────────────────────────────────

function RecipeCard({ record, onClick }: { record: any; onClick: () => void }) {
  const name = display(record.name) || value(record.name) || ''
  const methodLabel = display(record.method) || value(record.method) || '—'
  const dose = parseFloat(value(record.dose_weight_g)) || 0
  const water = parseFloat(value(record.water_weight_g)) || 0
  const ratio = dose > 0 ? (water / dose).toFixed(1) : '—'
  const ratioLine = dose > 0 && water > 0 ? `${dose}g • ${water}g  1:${ratio}` : ''

  return (
    <Button
      onClicked={onClick}
      variant="tertiary"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '12px',
        border: '2px solid var(--aibrew-ink)',
        borderRadius: '6px',
        background: 'var(--aibrew-paper)',
        textAlign: 'left',
        width: '100%',
        minHeight: '80px',
        boxShadow: '3px 4px 0 rgba(0,0,0,.08)',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--aibrew-ink)', fontFamily: 'var(--aibrew-font-body)' }}>
        {name}
      </div>
      {methodLabel && methodLabel !== '—' && (
        <span style={{
          display: 'inline-block',
          background: 'var(--aibrew-accent)',
          color: '#fff',
          borderRadius: '8px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: 600,
          marginTop: '4px',
        }}>
          {methodLabel}
        </span>
      )}
      {ratioLine && (
        <div style={{ fontSize: '13px', color: 'var(--aibrew-ink-3)', marginTop: '4px', fontFamily: 'var(--aibrew-font-body)' }}>
          {ratioLine}
        </div>
      )}
    </Button>
  )
}

// ─── RecipeDetailView (stub — completed in Plan 03) ───────────────────────────

function RecipeDetailView({ sysId }: { sysId: string }) {
  const handleBack = () => navigateToView('catalog', { section: 'recipes' }, 'AIBrew — Recipes')
  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <Button onClicked={handleBack} variant="tertiary" style={{ color: 'var(--aibrew-accent)', padding: 0, marginBottom: 'var(--sp-md)', minHeight: '44px', background: 'none', border: 'none' }}>
        ← Recipes
      </Button>
      <div style={{ fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink-3)' }}>Loading…</div>
    </div>
  )
}

// ─── RecipeListView ───────────────────────────────────────────────────────────

function RecipeListView() {
  const [showCreate, setShowCreate] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [listKey, setListKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection with cleanup to prevent memory leak
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 400)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const g_ck = (window as any).g_ck
    const params = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name,method,dose_weight_g,water_weight_g,grind_size',
      sysparm_limit: '50',
    })
    fetch(`/api/now/table/${RECIPE_TABLE}?${params}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setRecords(data.result || []) })
      .catch(() => {
        if (!cancelled) {
          setRecords([])
          setError('Could not load presets — tap to retry.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [listKey])

  const handleRowClick = (sysId: string) => {
    navigateToView('catalog', { section: 'recipes', id: sysId }, 'AIBrew — Recipe')
  }

  const handleSaved = () => {
    setShowCreate(false)
    setListKey(k => k + 1)
  }

  // Modal style: bottom-anchored sheet on mobile (≤400px), centered overlay on desktop
  const modalWrapperStyle = isMobile ? {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    top: 'auto' as const,
    transform: 'none',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto' as const,
    background: 'var(--paper)',
    border: 'none',
    borderTop: '2px solid var(--ink)',
    borderRadius: '12px 12px 0 0',
    boxShadow: '0 -4px 24px rgba(0,0,0,.15)',
  } : {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 580,
    background: 'var(--paper)',
    boxShadow: '6px 8px 0 rgba(0,0,0,.15)',
    border: '2px solid var(--ink)',
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '14px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '80px', background: 'var(--aibrew-ink-5)', borderRadius: '6px', opacity: 0.4 }} />
          ))}
        </div>
      )
    }
    if (error) {
      return (
        <div style={{ padding: 'var(--sp-md)', border: '2px solid var(--aibrew-ink)', borderRadius: '6px', color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)' }}>
          {error}
        </div>
      )
    }
    if (records.length === 0) {
      return (
        <div style={{
          border: '2px dashed var(--aibrew-ink-4)',
          borderRadius: '8px',
          padding: 'var(--sp-xl)',
          textAlign: 'center',
          color: 'var(--aibrew-ink-3)',
          fontFamily: 'var(--aibrew-font-body)',
        }}>
          <div style={{ fontSize: '32px', fontFamily: 'var(--aibrew-font-disp)', marginBottom: '8px' }}>+</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No presets yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>Create one to pre-fill the brew form</div>
        </div>
      )
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '14px',
      }}>
        {records.map(r => {
          const id = typeof r.sys_id === 'object' ? value(r.sys_id) : r.sys_id
          return <RecipeCard key={id} record={r} onClick={() => handleRowClick(id)} />
        })}
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
        <h2 style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '28px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: 0 }}>
          Recipes
        </h2>
        <Button onClicked={() => setShowCreate(true)} variant="primary" style={{ minHeight: '44px' }}>
          + New Preset
        </Button>
      </div>

      {renderContent()}

      <Modal
        opened={showCreate}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowCreate(false) }}
      >
        <div style={modalWrapperStyle}>
          <h2 style={modalHeadingStyle}>New Preset</h2>
          <RecordProvider
            table={RECIPE_TABLE}
            sysId="-1"
            isReadOnly={false}
            onFormSubmitCompleted={handleSaved}
          >
            <div style={{ width: '100%' }}><FormActionBar /></div>
            <FormColumnLayout />
          </RecordProvider>
          <div style={{ marginTop: 'var(--sp-sm)' }}>
            <Button onClicked={() => setShowCreate(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── RecipeSection (entry point) ──────────────────────────────────────────────

export default function RecipeSection({ params }: { params: URLSearchParams }) {
  const sysId = params.get('id')
  if (sysId && SYS_ID_RE.test(sysId)) return <RecipeDetailView sysId={sysId} />
  return <RecipeListView />
}
