import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { display, value } from '../utils/fields'
import { navigateToView } from '../utils/navigate'

const BREW_LOG_TABLE = 'x_664529_aibrew_brew_log'
const BEAN_TABLE     = 'x_664529_aibrew_bean'
const SYS_ID_RE      = /^[0-9a-f]{32}$/i
const PAGE_SIZE      = 50

// Method ChoiceColumn keys — MUST match brew-log.now.ts ChoiceColumn choices exactly
const METHOD_CHOICES = [
  { value: 'espresso',     label: 'Espresso' },
  { value: 'pour_over',    label: 'Pour Over' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'french_press', label: 'French Press' },
  { value: 'moka_pot',     label: 'Moka Pot' },
  { value: 'cold_brew',    label: 'Cold Brew' },
  { value: 'other',        label: 'Other' },
]

// Style constants — sourced from BrewView.tsx lines 24-52
const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  marginBottom: '4px',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid var(--aibrew-ink-4)',
  borderRadius: '4px',
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '16px',
  minHeight: '44px',
  boxSizing: 'border-box',
  background: 'var(--aibrew-paper)',
  color: 'var(--aibrew-ink)',
}

const modalHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '16px',
  color: 'var(--aibrew-ink)',
  padding: 'var(--sp-sm) 0',
}

// Timer conversion helpers
const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const parseBrewTime = (input: string): number => {
  const parts = input.split(':')
  if (parts.length === 2)
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0)
  return parseInt(input, 10) || 0
}

// Date formatting: "05/07/2026 08:14:22" -> "May 7 · 08:14"
const formatBrewDate = (displayValue: string): string => {
  const d = new Date(displayValue)
  if (isNaN(d.getTime())) return displayValue
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day   = d.getDate()
  const hh    = String(d.getHours()).padStart(2, '0')
  const mm    = String(d.getMinutes()).padStart(2, '0')
  return `${month} ${day} · ${hh}:${mm}`
}

// Inline equipment picker — copied from BrewView.tsx (self-contained)
function EquipmentPickerInline({
  value: selectedId,
  onChange,
}: {
  value: string
  onChange: (id: string, name: string) => void
}) {
  const [equipment, setEquipment] = React.useState<any[]>([])

  React.useEffect(() => {
    const g_ck = (window as any).g_ck
    const params = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name',
      sysparm_display_value: 'all',
      sysparm_limit: '50',
    })
    fetch(`/api/now/table/x_664529_aibrew_equipment?${params}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => setEquipment(data.result || []))
      .catch(() => setEquipment([]))
  }, [])

  return (
    <select
      value={selectedId}
      onChange={e => {
        const id = e.target.value
        const found = equipment.find(eq => {
          const eqId = typeof eq.sys_id === 'object' ? value(eq.sys_id) : eq.sys_id
          return eqId === id
        })
        const name = found ? (display(found.name) || value(found.name) || '') : ''
        onChange(id, name)
      }}
      style={{ ...inputStyle }}
    >
      <option value="">— None —</option>
      {equipment.map(eq => {
        const id = typeof eq.sys_id === 'object' ? value(eq.sys_id) : eq.sys_id
        const name = display(eq.name) || value(eq.name) || ''
        return <option key={id} value={id}>{name}</option>
      })}
    </select>
  )
}

export default function HistoryView() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [brews, setBrews]             = useState<any[]>([])
  const [offset, setOffset]           = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listKey, setListKey]         = useState(0)
  const [error, setError]             = useState<string | null>(null)

  // ── Edit modal state (Plan 2 will fill out full form; stubs declared here so card onClick compiles) ──
  const [editBrew, setEditBrew]               = useState<any | null>(null)
  const [editMethod, setEditMethod]           = useState('')
  const [editBeanId, setEditBeanId]           = useState('')
  const [editEquipId, setEditEquipId]         = useState('')
  const [editEquipName, setEditEquipName]     = useState('')
  const [editDoseG, setEditDoseG]             = useState<number | ''>('')
  const [editWaterG, setEditWaterG]           = useState<number | ''>('')
  const [editGrindSize, setEditGrindSize]     = useState<number | ''>('')
  const [editBrewTime, setEditBrewTime]       = useState('')
  const [editRating, setEditRating]           = useState<number | null>(null)
  const [editTasteNotes, setEditTasteNotes]   = useState('')
  const [editError, setEditError]             = useState('')

  // ── Delete confirmation state (Plan 3 will wire the actual delete; stub state here) ──
  const [deleteTargetSysId, setDeleteTargetSysId] = useState<string | null>(null)
  const [deleteError, setDeleteError]             = useState('')

  // ── Bean list for edit picker (fetched once on mount) ──────────────────────
  const [beans, setBeans] = useState<any[]>([])

  // ── Initial fetch (re-runs whenever listKey changes) ──────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setOffset(0)
    const g_ck = (window as any).g_ck
    if (!g_ck) {
      setError('Session token not available — please reload.')
      setLoading(false)
      return
    }
    const params = new URLSearchParams({
      sysparm_query: 'ORDERBYDESCsys_created_on',
      sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
      sysparm_display_value: 'all',
      sysparm_limit: String(PAGE_SIZE),
      sysparm_offset: '0',
    })
    fetch(`/api/now/table/${BREW_LOG_TABLE}?${params}`, {
      headers: { Accept: 'application/json', 'X-UserToken': g_ck },
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          const results = data.result || []
          setBrews(results)
          setOffset(results.length)
          setHasMore(results.length === PAGE_SIZE)
        }
      })
      .catch(() => { if (!cancelled) setError('Could not load history — try again.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [listKey])

  // ── Bean list fetch (one-time on mount for edit picker) ────────────────────
  useEffect(() => {
    let cancelled = false
    const g_ck = (window as any).g_ck
    const params = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name',
      sysparm_display_value: 'all',
      sysparm_limit: '100',
    })
    fetch(`/api/now/table/${BEAN_TABLE}?${params}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setBeans(data.result || []) })
      .catch(() => { /* silently ignore bean list failure */ })
    return () => { cancelled = true }
  }, [])

  // ── Load more handler ──────────────────────────────────────────────────────
  const handleLoadMore = () => {
    setLoadingMore(true)
    const g_ck = (window as any).g_ck
    if (!g_ck) {
      setLoadingMore(false)
      return
    }
    const params = new URLSearchParams({
      sysparm_query: 'ORDERBYDESCsys_created_on',
      sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
      sysparm_display_value: 'all',
      sysparm_limit: String(PAGE_SIZE),
      sysparm_offset: String(offset),
    })
    fetch(`/api/now/table/${BREW_LOG_TABLE}?${params}`, {
      headers: { Accept: 'application/json', 'X-UserToken': g_ck },
    })
      .then(r => r.json())
      .then(data => {
        const results = data.result || []
        setBrews(prev => [...prev, ...results])
        setOffset(prev => prev + results.length)
        setHasMore(results.length === PAGE_SIZE)
      })
      .catch(() => { /* silently ignore load-more failure */ })
      .finally(() => setLoadingMore(false))
  }

  // ── Edit form pre-population (scalar/object guard — BrewView.tsx applyLastBrew pattern) ──
  const populateEditForm = (rec: any) => {
    const raw = (f: any) => (typeof f === 'object' ? value(f) : String(f ?? ''))

    setEditBrew({ sysId: typeof rec.sys_id === 'object' ? value(rec.sys_id) : rec.sys_id })
    setEditMethod(raw(rec.method))
    setEditBeanId(typeof rec.bean === 'object' ? value(rec.bean) : rec.bean || '')
    setEditEquipId(typeof rec.equipment === 'object' ? value(rec.equipment) : rec.equipment || '')
    setEditEquipName(display(rec.equipment) || '')
    setEditDoseG(parseFloat(raw(rec.dose_weight_g)) || '')
    setEditWaterG(parseFloat(raw(rec.water_weight_g)) || '')
    setEditGrindSize(parseInt(raw(rec.grind_size), 10) || '')
    setEditRating(parseInt(raw(rec.rating), 10) || null)
    setEditTasteNotes(raw(rec.taste_notes))
    const secs = parseInt(raw(rec.brew_time_seconds), 10) || 0
    setEditBrewTime(secs > 0 ? formatTime(secs) : '')
    setEditError('')
  }

  // ── Edit save (PATCH) ──────────────────────────────────────────────────────
  const handleEditSave = async () => {
    const g_ck = (window as any).g_ck
    if (!g_ck) { setEditError('Session token not available.'); return }
    if (!editBrew || !SYS_ID_RE.test(editBrew.sysId)) { setEditError('Invalid record.'); return }

    const brewTimeSecs = parseBrewTime(editBrewTime)
    const body: Record<string, unknown> = {
      method:            editMethod || null,
      bean:              editBeanId || null,
      equipment:         editEquipId || null,
      dose_weight_g:     editDoseG !== '' ? editDoseG : null,
      water_weight_g:    editWaterG !== '' ? editWaterG : null,
      grind_size:        editGrindSize !== '' ? editGrindSize : null,
      brew_time_seconds: brewTimeSecs > 0 ? brewTimeSecs : null,
      rating:            editRating || null,
      taste_notes:       editTasteNotes.trim() || null,
      // recipe: omitted per D-08 — historical artifact, not editable
    }
    try {
      const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}/${editBrew.sysId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setEditBrew(null)
      setListKey(k => k + 1)
    } catch {
      setEditError("Couldn't save — try again.")
    }
  }

  // ── Hard delete ────────────────────────────────────────────────────────────
  const handleDelete = async (sysId: string) => {
    const g_ck = (window as any).g_ck
    if (!g_ck) { setDeleteError('Session token not available.'); return }
    if (!SYS_ID_RE.test(sysId)) { setDeleteError('Invalid record identifier.'); return }
    try {
      const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}/${sysId}`, {
        method: 'DELETE',
        headers: { 'X-UserToken': g_ck },
        // No Content-Type — DELETE has no body
        // No Accept — 204 No Content has no body
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // 204 No Content — do NOT call res.json()
      setDeleteTargetSysId(null)
      setDeleteError('')
      setEditBrew(null)
      setListKey(k => k + 1)
    } catch {
      setDeleteError("Couldn't delete brew — try again.")
    }
  }

  // ── Computed values ────────────────────────────────────────────────────────
  const editRatio =
    typeof editDoseG === 'number' && editDoseG > 0 &&
    typeof editWaterG === 'number' && editWaterG > 0
      ? `1:${(editWaterG / editDoseG).toFixed(1)}`
      : null

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderList = () => {
    if (loading) {
      return (
        <div>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '72px',
                background: 'var(--aibrew-ink-5)',
                borderRadius: '6px',
                opacity: 0.4,
                marginBottom: '10px',
              }}
            />
          ))}
        </div>
      )
    }

    // Error state checked BEFORE empty state (Pitfall 7 guard)
    if (error) {
      return (
        <div style={{
          padding: 'var(--sp-md)',
          border: '2px solid var(--aibrew-ink)',
          borderRadius: '6px',
          color: 'var(--aibrew-destructive)',
          fontFamily: 'var(--aibrew-font-body)',
        }}>
          {error}
        </div>
      )
    }

    if (brews.length === 0) {
      return (
        <div style={{
          border: '2px dashed var(--aibrew-ink-4)',
          borderRadius: '8px',
          padding: 'var(--sp-xl)',
          textAlign: 'center',
          color: 'var(--aibrew-ink-3)',
          fontFamily: 'var(--aibrew-font-body)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>☕</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No brews yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>Start logging from the Brew tab</div>
          <Button
            onClicked={() => navigateToView('brew', {}, 'AIBrew — Brew')}
            variant="primary"
            style={{ marginTop: 'var(--sp-md)', minHeight: '44px' }}
          >
            → Brew
          </Button>
        </div>
      )
    }

    return (
      <div>
        {brews.map(brew => {
          const sysId       = typeof brew.sys_id === 'object' ? value(brew.sys_id) : brew.sys_id
          const methodValue = typeof brew.method === 'object' ? value(brew.method) : brew.method
          const methodLabel = METHOD_CHOICES.find(m => m.value === methodValue)?.label || display(brew.method) || ''
          const beanName    = display(brew.bean) || ''
          const dose        = parseFloat(typeof brew.dose_weight_g === 'object' ? value(brew.dose_weight_g) : String(brew.dose_weight_g ?? '')) || 0
          const water       = parseFloat(typeof brew.water_weight_g === 'object' ? value(brew.water_weight_g) : String(brew.water_weight_g ?? '')) || 0
          const ratio       = dose > 0 && water > 0 ? (water / dose).toFixed(1) : '—'
          const rating      = parseInt(typeof brew.rating === 'object' ? value(brew.rating) : String(brew.rating ?? ''), 10) || 0

          return (
            <button
              key={sysId}
              onClick={() => populateEditForm(brew)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                border: '2px solid var(--aibrew-ink)',
                borderRadius: '6px',
                background: 'var(--aibrew-paper)',
                textAlign: 'left',
                boxShadow: '3px 4px 0 rgba(0,0,0,.08)',
                cursor: 'pointer',
                marginBottom: '10px',
                position: 'relative',
              }}
            >
              {/* Line 1: date/time (left) + trash icon (right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
                  {formatBrewDate(display(brew.sys_created_on))}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setEditBrew(null)
                    setDeleteError('')
                    setDeleteTargetSysId(sysId)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--aibrew-ink-3)',
                    fontSize: '14px',
                    padding: '4px',
                    cursor: 'pointer',
                    minWidth: '32px',
                    minHeight: '32px',
                  }}
                  aria-label="Delete brew"
                >
                  🗑
                </button>
              </div>

              {/* Line 2: method chip + bean name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {methodLabel && (
                  <span style={{
                    background: 'var(--aibrew-accent)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {methodLabel}
                  </span>
                )}
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>
                  {beanName}
                </span>
              </div>

              {/* Line 3: dose/water/ratio (left) + rating (right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
                  {dose > 0 ? `${dose}g • ${water}g • 1:${ratio}` : '—'}
                </span>
                {rating > 0 && (
                  <span style={{ fontSize: '12px', fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>
                    ★ {rating}/10
                  </span>
                )}
              </div>
            </button>
          )
        })}

        {/* Load more button — only shown when more records exist */}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              width: '100%',
              fontSize: '13px',
              color: 'var(--aibrew-ink-3)',
              border: '1.4px dashed var(--aibrew-ink-4)',
              borderRadius: '6px',
              padding: '10px',
              marginTop: '8px',
              background: 'transparent',
              cursor: loadingMore ? 'default' : 'pointer',
              fontFamily: 'var(--aibrew-font-body)',
              opacity: loadingMore ? 0.6 : 1,
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more brews'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px 90px' }}>
      {/* Page heading row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-md)' }}>
        <h2 style={sectionHeadingStyle}>Brew History</h2>
        {!loading && !error && (
          <span style={{
            fontSize: '12px',
            background: 'var(--aibrew-ink-5)',
            borderRadius: '12px',
            padding: '2px 8px',
            fontFamily: 'var(--aibrew-font-body)',
            color: 'var(--aibrew-ink-3)',
          }}>
            {brews.length} brews
          </span>
        )}
      </div>

      {renderList()}

      {/* Edit modal */}
      <Modal
        size="lg"
        opened={editBrew !== null}
        footerActions={[
          { label: 'Save changes', variant: 'primary' },
          { label: 'Cancel', variant: 'secondary' },
        ]}
        onFooterActionClicked={(e: CustomEvent) => {
          if (e.detail?.payload?.action?.label === 'Save changes') handleEditSave()
          else setEditBrew(null)
        }}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setEditBrew(null) }}
      >
        <div style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
          <h2 style={modalHeadingStyle}>Edit brew</h2>

          {/* Delete brew button — destructive, top of form */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--sp-md)' }}>
            <button
              onClick={() => { if (editBrew) { setDeleteError(''); setDeleteTargetSysId(editBrew.sysId) } }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--aibrew-destructive)',
                fontFamily: 'var(--aibrew-font-body)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Delete brew
            </button>
          </div>

          {editError && (
            <div style={{ color: 'var(--aibrew-destructive)', marginBottom: 'var(--sp-sm)', fontFamily: 'var(--aibrew-font-body)' }}>
              {editError}
            </div>
          )}

          {/* Method chip row */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <span style={labelStyle}>Method</span>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '4px 0', WebkitOverflowScrolling: 'touch' }}>
              {METHOD_CHOICES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setEditMethod(editMethod === m.value ? '' : m.value)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: editMethod === m.value
                      ? '2px solid var(--aibrew-accent)'
                      : '2px solid var(--aibrew-ink-4)',
                    background: editMethod === m.value ? 'var(--aibrew-accent)' : 'transparent',
                    color: editMethod === m.value ? '#fff' : 'var(--aibrew-ink)',
                    fontFamily: 'var(--aibrew-font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bean picker */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Bean</label>
            <select
              value={editBeanId}
              onChange={e => setEditBeanId(e.target.value)}
              style={{ ...inputStyle }}
            >
              <option value="">— Select bean —</option>
              {beans.map(b => {
                const id = typeof b.sys_id === 'object' ? value(b.sys_id) : b.sys_id
                const name = display(b.name) || value(b.name) || ''
                return <option key={id} value={id}>{name}</option>
              })}
            </select>
          </div>

          {/* Dose / Water / live ratio row */}
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', alignItems: 'flex-end', marginBottom: 'var(--sp-md)' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Dose (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={editDoseG}
                onChange={e => setEditDoseG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                style={{ ...inputStyle }}
                placeholder="18"
              />
            </div>
            <div style={{
              padding: '0 var(--sp-xs)',
              fontFamily: 'var(--aibrew-font-body)',
              fontSize: '14px',
              color: editRatio ? 'var(--aibrew-ink)' : 'var(--aibrew-ink-4)',
              fontWeight: 600,
              minWidth: '60px',
              textAlign: 'center',
              paddingBottom: '12px',
            }}>
              {editRatio || '1:—'}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Water (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editWaterG}
                onChange={e => setEditWaterG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                style={{ ...inputStyle }}
                placeholder="300"
              />
            </div>
          </div>

          {/* Grind size */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Grind size (optional)</label>
            <input
              type="number"
              min="0"
              value={editGrindSize}
              onChange={e => setEditGrindSize(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              style={{ ...inputStyle }}
              placeholder="e.g. 20"
            />
          </div>

          {/* Equipment picker */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Equipment (optional)</label>
            <EquipmentPickerInline
              value={editEquipId}
              onChange={(id, name) => { setEditEquipId(id); setEditEquipName(name) }}
            />
          </div>

          {/* Brew time text input (no stopwatch — editable mm:ss) */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Brew time (mm:ss)</label>
            <input
              type="text"
              value={editBrewTime}
              onChange={e => setEditBrewTime(e.target.value)}
              style={{ ...inputStyle, width: '120px', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: '20px' }}
              placeholder="1:28"
            />
          </div>

          {/* Rating circles */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Rating (optional)</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setEditRating(editRating === n ? null : n)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: editRating === n ? '2px solid var(--aibrew-accent)' : '2px solid var(--aibrew-ink-4)',
                    background: editRating === n ? 'var(--aibrew-accent)' : 'transparent',
                    color: editRating === n ? '#fff' : 'var(--aibrew-ink)',
                    fontFamily: 'var(--aibrew-font-body)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Taste notes textarea */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Taste notes (optional)</label>
            <textarea
              value={editTasteNotes}
              onChange={e => setEditTasteNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Bright, fruity, clean finish…"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--aibrew-ink-4)',
                borderRadius: '4px',
                fontFamily: 'var(--aibrew-font-body)',
                fontSize: '16px',
                resize: 'vertical',
                boxSizing: 'border-box',
                background: 'var(--aibrew-paper)',
                color: 'var(--aibrew-ink)',
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteTargetSysId !== null}
        footerActions={[
          { label: 'Delete', variant: 'primary-negative' },
          { label: 'Cancel', variant: 'secondary' },
        ]}
        onFooterActionClicked={(e: CustomEvent) => {
          if (e.detail?.payload?.action?.label === 'Delete') handleDelete(deleteTargetSysId!)
          else { setDeleteTargetSysId(null); setDeleteError('') }
        }}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setDeleteTargetSysId(null) }}
      >
        <h2 style={modalHeadingStyle}>Delete this brew?</h2>
        <div style={bodyStyle}>This cannot be undone.</div>
        {deleteError && (
          <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)' }}>
            {deleteError}
          </div>
        )}
      </Modal>
    </div>
  )
}
