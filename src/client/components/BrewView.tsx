import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { display, value } from '../utils/fields'

// Table name constants — scope prefix locked at x_664529_aibrew
const BREW_LOG_TABLE = 'x_664529_aibrew_brew_log'
const RECIPE_TABLE   = 'x_664529_aibrew_recipe'
const BEAN_TABLE     = 'x_664529_aibrew_bean'
const SYS_ID_RE      = /^[0-9a-f]{32}$/i

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

// Heading style — consistent with RecipeSection.tsx / BeanSection.tsx
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

// Timer formatting: 88 → "1:28"
const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Inline equipment picker — fetches active equipment for manual override (D-11)
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
      style={{
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
      }}
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

export default function BrewView({ params }: { params: URLSearchParams }) {
  // ── Above-fold form state ──────────────────────────────────────────────────
  const [method, setMethod]             = useState('')
  const [beanSysId, setBeanSysId]       = useState('')
  const [doseG, setDoseG]               = useState<number | ''>('')
  const [waterG, setWaterG]             = useState<number | ''>('')
  const [grindSize, setGrindSize]       = useState<number | ''>('')

  // ── Below-fold form state (extended in 04-04) ─────────────────────────────
  const [rating, setRating]             = useState<number | null>(null)
  const [tasteNotes, setTasteNotes]     = useState('')
  const [equipmentSysId, setEquipmentSysId] = useState('')
  const [equipmentName, setEquipmentName]   = useState('')  // display label for grind sub-label

  // ── Preset strip state ────────────────────────────────────────────────────
  const [presets, setPresets]           = useState<any[]>([])
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null)
  const [selectedPresetSysId, setSelectedPresetSysId] = useState('')
  const [presetExpanded, setPresetExpanded] = useState(false)

  // ── "Use last" state ──────────────────────────────────────────────────────
  const [lastBrew, setLastBrew]         = useState<any | null>(null)
  const [lastBrewAvailable, setLastBrewAvailable] = useState(false)

  // ── Bean list ─────────────────────────────────────────────────────────────
  const [beans, setBeans]               = useState<any[]>([])

  // ── Submit / confirmation state (extended in 04-04) ───────────────────────
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedBrew, setSubmittedBrew] = useState<any | null>(null)

  // ── RECIPE-01 save-as-preset modal state (added in 04-05) ─────────────────
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName]     = useState('')
  const [presetNameError, setPresetNameError] = useState('')

  // ── listKey: increment after submit to enable Phase 5 history refresh ──────
  const [listKey, setListKey]           = useState(0)

  // ── Timer (BREW-04) ────────────────────────────────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsed, setElapsed]           = useState(0)
  const [running, setRunning]           = useState(false)
  const [timerManual, setTimerManual]   = useState(false)  // tap stopped display to enter manually
  const [manualInput, setManualInput]   = useState('')

  // Cleanup interval on unmount — prevents phantom state updates after navigate-away (D-13)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleStart = () => {
    if (running) return
    setTimerManual(false)
    setRunning(true)
    intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  const handleStop = () => {
    if (!running) return
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // ── On-mount fetches: beans, presets, last brew ────────────────────────────
  // ALL fetches require sysparm_display_value=all (Phase 3 UAT lesson: without it,
  // display() / value() helpers return empty strings for reference field display names)
  useEffect(() => {
    let cancelled = false
    const g_ck = (window as any).g_ck

    // 1) Active beans
    const beanParams = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name',
      sysparm_display_value: 'all',
      sysparm_limit: '100',
    })
    fetch(`/api/now/table/${BEAN_TABLE}?${beanParams}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setBeans(data.result || []) })
      .catch(() => { if (!cancelled) setBeans([]) })

    // 2) Active presets (same fields as RecipeSection list fetch)
    const presetParams = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name,method,equipment,dose_weight_g,water_weight_g,grind_size',
      sysparm_display_value: 'all',
      sysparm_limit: '50',
    })
    fetch(`/api/now/table/${RECIPE_TABLE}?${presetParams}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setPresets(data.result || []) })
      .catch(() => { if (!cancelled) setPresets([]) })

    // 3) Most recent brew — for "Use last" (D-08/D-09)
    // ORDERBY syntax: 'ORDERBYDESCsys_created_on' — same format as BeanSection.tsx line 80
    const lastBrewParams = new URLSearchParams({
      sysparm_query: 'ORDERBYDESCsys_created_on',
      sysparm_fields: 'sys_id,method,bean,dose_weight_g,water_weight_g,grind_size',
      sysparm_display_value: 'all',
      sysparm_limit: '1',
    })
    fetch(`/api/now/table/${BREW_LOG_TABLE}?${lastBrewParams}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          const result = (data.result || [])[0] ?? null
          setLastBrew(result)
          setLastBrewAvailable(result !== null)  // D-08: hide "Use last" if no records exist
        }
      })
      .catch(() => { if (!cancelled) { setLastBrew(null); setLastBrewAvailable(false) } })

    return () => { cancelled = true }
  }, [])

  // ── Preset application (D-10) ─────────────────────────────────────────────
  // Fills: method, equipment, dose, water, grind + selectedPresetSysId
  // Does NOT touch: bean (presets are bean-agnostic per Phase 3 D-01)
  const applyPreset = (preset: any) => {
    const methodVal = value(preset.method) || ''
    const equipVal  = value(preset.equipment) || ''
    const equipDisp = display(preset.equipment) || ''
    setMethod(methodVal)
    setEquipmentSysId(equipVal)
    setEquipmentName(equipDisp)
    setDoseG(parseFloat(value(preset.dose_weight_g) || '0') || '')
    setWaterG(parseFloat(value(preset.water_weight_g) || '0') || '')
    setGrindSize(parseInt(value(preset.grind_size) || '0', 10) || '')
    const id = typeof preset.sys_id === 'object' ? value(preset.sys_id) : preset.sys_id
    setSelectedPreset(preset)
    setSelectedPresetSysId(id || '')
    setPresetExpanded(false)
  }

  // ── "Use last" application (D-09) ─────────────────────────────────────────
  // Copies: method, bean, dose, water, grind
  // Does NOT copy: brew_time_seconds (reset to 0), rating (blank), taste_notes (blank)
  // Does NOT set selectedPresetSysId — "Use last" is not a preset selection (D-09)
  const applyLastBrew = () => {
    if (!lastBrew) return
    setMethod(value(lastBrew.method) || '')
    const beanId = typeof lastBrew.bean === 'object' ? value(lastBrew.bean) : lastBrew.bean
    if (beanId) setBeanSysId(beanId)
    setDoseG(parseFloat(value(lastBrew.dose_weight_g) || '0') || '')
    setWaterG(parseFloat(value(lastBrew.water_weight_g) || '0') || '')
    setGrindSize(parseInt(value(lastBrew.grind_size) || '0', 10) || '')
    // selectedPresetSysId remains '' — Use last is NOT a preset
  }

  // ── Form reset (D-18) ─────────────────────────────────────────────────────
  const resetForm = () => {
    setMethod('')
    setBeanSysId('')
    setDoseG('')
    setWaterG('')
    setGrindSize('')
    setRating(null)
    setTasteNotes('')
    setEquipmentSysId('')
    setEquipmentName('')
    setSelectedPreset(null)
    setSelectedPresetSysId('')
    setPresetExpanded(false)
    setElapsed(0)
    setRunning(false)
    setTimerManual(false)
    setManualInput('')
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setShowConfirmation(false)
    setSubmittedBrew(null)
    setShowSavePreset(false)
    setPresetName('')
    setPresetNameError('')
    setError('')
  }

  // ── Computed ratio (BREW-07 — never stored) ────────────────────────────────
  const ratio = (typeof doseG === 'number' && doseG > 0 && typeof waterG === 'number' && waterG > 0)
    ? `1:${(waterG / doseG).toFixed(1)}`
    : null

  // ── Submit handler (BREW-01 / D-19) ─────────────────────────────────────────
  const handleSubmit = async () => {
    // Required field validation — method and bean are minimum (Claude's Discretion)
    if (!method) { setError('Select a brew method.'); return }
    if (!beanSysId) { setError('Select a bean.'); return }

    // CSRF guard — platform-managed session token (ASVS L1 V3 Session Management)
    const g_ck = (window as any).g_ck
    if (!g_ck) { setError('Session token not available — please reload.'); return }

    setSubmitting(true)
    setError('')

    try {
      // Build POST body — send null for optional fields that are empty
      // grind_size and brew_time_seconds MUST be integer or null (IntegerColumn)
      // rating MUST be integer 1-10 or null (IntegerColumn with min:1 max:10)
      // taste_notes: trimmed string or null (StringColumn)
      // recipe: selectedPresetSysId if user picked a preset, null if "Use last" or blank
      const body: Record<string, unknown> = {
        method,
        bean:              beanSysId,
        dose_weight_g:     typeof doseG === 'number' ? doseG : null,
        water_weight_g:    typeof waterG === 'number' ? waterG : null,
        grind_size:        typeof grindSize === 'number' ? grindSize : null,
        brew_time_seconds: elapsed > 0 ? elapsed : null,
        rating:            rating || null,
        taste_notes:       tasteNotes.trim() || null,
        equipment:         equipmentSysId || null,
        recipe:            selectedPresetSysId || null,    // null when "Use last" — per D-09
      }

      const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-UserToken': g_ck,               // CSRF protection — required on all mutating fetches
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      // Capture submitted brew for save-as-preset (RECIPE-01 — used in 04-05)
      setSubmittedBrew({
        method,
        equipment: equipmentSysId,
        equipmentName,
        dose_weight_g: typeof doseG === 'number' ? doseG : null,
        water_weight_g: typeof waterG === 'number' ? waterG : null,
        grind_size: typeof grindSize === 'number' ? grindSize : null,
        // bean and taste_notes NOT stored in submittedBrew — excluded from preset per D-17
      })

      setListKey(k => k + 1)        // Phase 5 history refresh hook
      setShowConfirmation(true)     // Show post-submit banner (D-16) — does NOT navigate away

    } catch {
      setError("Couldn't save brew — try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Save-as-preset handler (RECIPE-01 / D-17) ────────────────────────────
  // POST body includes ONLY: name, method, equipment, dose_weight_g, water_weight_g, grind_size, active
  // NEVER includes: bean (presets are bean-agnostic per Phase 3 D-01), taste_notes (brew-specific)
  const handleSaveAsPreset = async () => {
    if (!presetName.trim()) {
      setPresetNameError('Preset name is required.')
      return
    }
    const g_ck = (window as any).g_ck
    if (!g_ck) return

    setPresetNameError('')
    try {
      const body = {
        name:          presetName.trim(),
        method:        submittedBrew?.method || null,
        equipment:     submittedBrew?.equipment || null,
        dose_weight_g: submittedBrew?.dose_weight_g ?? null,
        water_weight_g: submittedBrew?.water_weight_g ?? null,
        grind_size:    submittedBrew?.grind_size ?? null,
        active:        true,
        // bean: intentionally omitted — presets are bean-agnostic (Phase 3 D-01)
        // taste_notes: intentionally omitted — brew-specific, not preset configuration (D-17)
      }
      const res = await fetch(`/api/now/table/${RECIPE_TABLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-UserToken': g_ck,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowSavePreset(false)
      resetForm()              // D-18: reset to blank form after saving preset
    } catch {
      setPresetNameError("Couldn't save preset — try again.")
    }
  }

  return (
    <div style={{ padding: 'var(--sp-md)', paddingBottom: 'var(--sp-xl)', maxWidth: '480px', margin: '0 auto' }}>

      {/* ── Post-submit confirmation banner (D-16) ─────────────────────── */}
      {showConfirmation && (
        <div style={{
          padding: 'var(--sp-lg)',
          textAlign: 'center',
          fontFamily: 'var(--aibrew-font-body)',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--aibrew-ink)', marginBottom: 'var(--sp-md)' }}>
            Brew saved! ✓
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClicked={() => setShowSavePreset(true)}
              variant="secondary"
              style={{ minHeight: '44px' }}
            >
              Save as preset
            </Button>
            <Button
              onClicked={resetForm}
              variant="primary"
              style={{ minHeight: '44px' }}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {!showConfirmation && (
        <>
          {/* ── Error display ─────────────────────────────────────────────── */}
          {error && (
            <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', marginBottom: 'var(--sp-sm)' }}>
              {error}
            </div>
          )}

          {/* ── Preset strip (D-05, D-07) — above method chips, outside 6-field budget ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--sp-sm)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px' }}>📎</span>
            {selectedPreset ? (
              <>
                <span style={{ fontFamily: 'var(--aibrew-font-body)', fontSize: '14px', color: 'var(--aibrew-ink)' }}>
                  Using: {display(selectedPreset.name) || value(selectedPreset.name) || 'Preset'}
                </span>
                <button
                  onClick={() => { setSelectedPreset(null); setSelectedPresetSysId(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aibrew-ink-3)', fontSize: '16px', padding: '0 4px' }}
                  aria-label="Clear preset"
                >
                  ×
                </button>
              </>
            ) : (
              <span style={{ fontFamily: 'var(--aibrew-font-body)', fontSize: '14px', color: 'var(--aibrew-ink-3)' }}>
                No preset
              </span>
            )}
            {presets.length > 0 && (
              <button
                onClick={() => setPresetExpanded(e => !e)}
                style={{ background: 'none', border: '1px solid var(--aibrew-ink-4)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--aibrew-font-body)', fontSize: '13px', padding: '4px 8px', color: 'var(--aibrew-ink)' }}
              >
                {presetExpanded ? '▴ Hide' : '▾ Pick one'}
              </button>
            )}
            {/* "Use last" — hidden if no brew records exist (D-08) */}
            {lastBrewAvailable && (
              <button
                onClick={applyLastBrew}
                style={{ background: 'none', border: '1px solid var(--aibrew-ink-4)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--aibrew-font-body)', fontSize: '13px', padding: '4px 8px', color: 'var(--aibrew-ink)' }}
              >
                Use last
              </button>
            )}
          </div>

          {/* Preset expanded list */}
          {presetExpanded && presets.length > 0 && (
            <div style={{ marginBottom: 'var(--sp-sm)', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--aibrew-ink-4)', borderRadius: '4px' }}>
              {presets.map(p => {
                const pid = typeof p.sys_id === 'object' ? value(p.sys_id) : p.sys_id
                const pName = display(p.name) || value(p.name) || 'Untitled'
                const pMethod = value(p.method) || ''
                const pDose = value(p.dose_weight_g) || ''
                const pWater = value(p.water_weight_g) || ''
                const pRatio = (parseFloat(pDose) > 0 && parseFloat(pWater) > 0)
                  ? `1:${(parseFloat(pWater) / parseFloat(pDose)).toFixed(1)}`
                  : null
                return (
                  <button
                    key={pid}
                    onClick={() => applyPreset(p)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px var(--sp-sm)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--aibrew-ink-4)',
                      cursor: 'pointer',
                      fontFamily: 'var(--aibrew-font-body)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--aibrew-ink)' }}>{pName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--aibrew-ink-3)' }}>
                      {pMethod}{pRatio ? ` · ${pDose}g • ${pWater}g ${pRatio}` : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── (1) Method chip row (D-06) — 7 choices, horizontal scroll ── */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <span style={labelStyle}>Method</span>
            {/* Native <button> required — @servicenow/react-components Button ignores flex-direction column (Phase 3 lesson) */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '4px 0', WebkitOverflowScrolling: 'touch' }}>
              {METHOD_CHOICES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMethod(method === m.value ? '' : m.value)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: method === m.value
                      ? '2px solid var(--aibrew-accent)'
                      : '2px solid var(--aibrew-ink-4)',
                    background: method === m.value ? 'var(--aibrew-accent)' : 'transparent',
                    color: method === m.value ? '#fff' : 'var(--aibrew-ink)',
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

          {/* ── (2) Bean picker (D-03 / BREW-05) ── */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Bean</label>
            <select
              value={beanSysId}
              onChange={e => setBeanSysId(e.target.value)}
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

          {/* ── (3) Dose | Ratio | Water row (D-03 / BREW-06 / BREW-07) ── */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Dose (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={doseG}
                  onChange={e => setDoseG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  style={{ ...inputStyle }}
                  placeholder="18"
                />
              </div>
              {/* Live ratio — BREW-07: computed, never stored */}
              <div style={{
                padding: '0 var(--sp-xs)',
                fontFamily: 'var(--aibrew-font-body)',
                fontSize: '14px',
                color: ratio ? 'var(--aibrew-ink)' : 'var(--aibrew-ink-4)',
                fontWeight: 600,
                minWidth: '60px',
                textAlign: 'center',
                paddingBottom: '12px',
              }}>
                {ratio || '1:—'}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Water (g)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={waterG}
                  onChange={e => setWaterG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  style={{ ...inputStyle }}
                  placeholder="300"
                />
              </div>
            </div>
          </div>

          {/* ── (4) Grind size (D-03 / BREW-06) — IntegerColumn; equipment sub-label ── */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>
              Grind{equipmentName ? ` (${equipmentName})` : ''}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={grindSize}
              onChange={e => setGrindSize(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              style={{ ...inputStyle }}
              placeholder="20"
            />
          </div>

          {/* ── (5) Timer (D-12 / BREW-04) ── */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Timer</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
              {timerManual ? (
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onBlur={() => {
                    // Parse mm:ss or plain seconds
                    const parts = manualInput.split(':')
                    if (parts.length === 2) {
                      const mins = parseInt(parts[0], 10) || 0
                      const secs = parseInt(parts[1], 10) || 0
                      setElapsed(mins * 60 + secs)
                    } else {
                      setElapsed(parseInt(manualInput, 10) || 0)
                    }
                    setTimerManual(false)
                  }}
                  style={{ ...inputStyle, width: '80px', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: '20px' }}
                  autoFocus
                  placeholder="0:00"
                />
              ) : (
                <button
                  onClick={() => { if (!running) setTimerManual(true) }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--aibrew-ink-4)',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--aibrew-ink)',
                    cursor: running ? 'default' : 'pointer',
                    minHeight: '44px',
                    minWidth: '80px',
                  }}
                  title={running ? '' : 'Tap to enter time manually'}
                >
                  {formatTime(elapsed)}
                </button>
              )}
              {!running ? (
                <Button onClicked={handleStart} variant="secondary" style={{ minHeight: '44px' }}>
                  ▶ Start
                </Button>
              ) : (
                <Button onClicked={handleStop} variant="secondary" style={{ minHeight: '44px' }}>
                  ■ Stop
                </Button>
              )}
            </div>
          </div>

          {/* ── (6+) Below-fold: rating, taste notes, equipment, submit ── */}
          {/* Fold line — above content scrolls into view, below content requires scroll on phone */}
          <div style={{ borderTop: '1px solid var(--aibrew-ink-4)', paddingTop: 'var(--sp-md)', marginTop: 'var(--sp-md)' }}>

            {/* Rating widget (D-15 / BREW-08) — 10 tap targets, optional */}
            <div style={{ marginBottom: 'var(--sp-md)' }}>
              <label style={labelStyle}>Rating (optional)</label>
              {/* Native <button> elements — Phase 3 lesson: Button component ignores flex-direction */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(rating === n ? null : n)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: rating === n
                        ? '2px solid var(--aibrew-accent)'
                        : '2px solid var(--aibrew-ink-4)',
                      background: rating === n ? 'var(--aibrew-accent)' : 'transparent',
                      color: rating === n ? '#fff' : 'var(--aibrew-ink)',
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

            {/* Taste notes (D-04 / BREW-09) */}
            <div style={{ marginBottom: 'var(--sp-md)' }}>
              <label style={labelStyle}>Taste notes (optional)</label>
              <textarea
                value={tasteNotes}
                onChange={e => setTasteNotes(e.target.value)}
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

            {/* Equipment picker (D-11) — pre-filled by preset, manual override allowed */}
            <div style={{ marginBottom: 'var(--sp-md)' }}>
              <label style={labelStyle}>Equipment (optional)</label>
              <EquipmentPickerInline
                value={equipmentSysId}
                onChange={(id, name) => { setEquipmentSysId(id); setEquipmentName(name) }}
              />
            </div>

            {/* Save Brew button (BREW-01 / D-04) — accent, full-width, 44px tap target */}
            <Button
              onClicked={handleSubmit}
              variant="primary"
              style={{
                width: '100%',
                minHeight: '44px',
                opacity: submitting ? 0.6 : 1,
                pointerEvents: submitting ? 'none' : 'auto',
              }}
            >
              {submitting ? 'Saving…' : 'Save Brew'}
            </Button>
          </div>
        </>
      )}

      {/* ── RECIPE-01 Save-as-preset Modal (D-17) ───────────────────────── */}
      <Modal
        size="lg"
        opened={showSavePreset}
        onOpenedSet={(e: CustomEvent) => {
          if (!e.detail?.value) setShowSavePreset(false)
        }}
      >
        <div style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto', padding: 'var(--sp-sm)' }}>
          <h2 style={{
            fontFamily: 'var(--aibrew-font-disp)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--aibrew-ink)',
            margin: '0 0 var(--sp-md) 0',
          }}>
            Save as Preset
          </h2>

          {/* Required name input */}
          <div style={{ marginBottom: 'var(--sp-md)' }}>
            <label style={labelStyle}>Preset name</label>
            <input
              type="text"
              value={presetName}
              onChange={e => { setPresetName(e.target.value); setPresetNameError('') }}
              maxLength={100}
              placeholder="My V60 recipe"
              style={{ ...inputStyle }}
              autoFocus
            />
            {presetNameError && (
              <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '14px', marginTop: '4px' }}>
                {presetNameError}
              </div>
            )}
          </div>

          {/* Read-only field summary (D-17) — method, equipment, dose, water, grind only */}
          {/* Bean and taste_notes are explicitly excluded */}
          <div style={{
            background: 'var(--aibrew-paper-2)',
            borderRadius: '4px',
            padding: 'var(--sp-sm)',
            marginBottom: 'var(--sp-md)',
            fontFamily: 'var(--aibrew-font-body)',
            fontSize: '14px',
            color: 'var(--aibrew-ink-3)',
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: 'var(--aibrew-ink)' }}>Method: </strong>
              {METHOD_CHOICES.find(m => m.value === submittedBrew?.method)?.label || submittedBrew?.method || '—'}
            </div>
            {submittedBrew?.equipmentName && (
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: 'var(--aibrew-ink)' }}>Equipment: </strong>
                {submittedBrew.equipmentName}
              </div>
            )}
            {submittedBrew?.dose_weight_g != null && (
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: 'var(--aibrew-ink)' }}>Dose: </strong>
                {submittedBrew.dose_weight_g}g
              </div>
            )}
            {submittedBrew?.water_weight_g != null && (
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: 'var(--aibrew-ink)' }}>Water: </strong>
                {submittedBrew.water_weight_g}g
              </div>
            )}
            {submittedBrew?.grind_size != null && (
              <div>
                <strong style={{ color: 'var(--aibrew-ink)' }}>Grind: </strong>
                {submittedBrew.grind_size}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'flex-end' }}>
            <Button
              onClicked={() => { setShowSavePreset(false); setPresetName(''); setPresetNameError('') }}
              variant="secondary"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </Button>
            <Button
              onClicked={handleSaveAsPreset}
              variant="primary"
              style={{ minHeight: '44px' }}
            >
              Save preset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
