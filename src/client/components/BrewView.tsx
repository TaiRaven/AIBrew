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

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      {/* Form UI — implemented in task 04-03-02 */}
    </div>
  )
}
