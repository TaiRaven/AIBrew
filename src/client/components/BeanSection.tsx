import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { navigateToView } from '../utils/navigate'

const BEAN_TABLE = 'x_664529_aibrew_bean'
const BEAN_PURCHASE_TABLE = 'x_664529_aibrew_bean_purchase'
const STOCK_BASE = '/api/x_664529_aibrew/v1/stock'
const SYS_ID_RE = /^[0-9a-f]{32}$/i
const LOW_STOCK_THRESHOLD = 50

const modalHeadingStyle = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}
const bodyStyle = {
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '16px',
  color: 'var(--aibrew-ink)',
  padding: 'var(--sp-sm) 0',
}

interface StockInfo {
  remaining_g: number
  total_purchased_g: number
}

// ─── BeanDetailView ──────────────────────────────────────────────────────────

function BeanDetailView({ sysId }: { sysId: string }) {
  // Stock state
  const [stock, setStock] = useState<StockInfo | null>(null)
  const [stockLoading, setStockLoading] = useState(true)
  const [stockKey, setStockKey] = useState(0)

  // Purchase history state
  const [history, setHistory] = useState<any[]>([])
  const [historyKey, setHistoryKey] = useState(0)

  // Add Beans form state
  const [grams, setGrams] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Archive modal state
  const [showArchive, setShowArchive] = useState(false)
  const [archiveError, setArchiveError] = useState('')

  const handleBack = () => navigateToView('catalog', { section: 'beans' }, 'AIBrew — Beans')

  // ── Stock fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!SYS_ID_RE.test(sysId)) return
    let cancelled = false
    setStockLoading(true)
    const g_ck = (window as any).g_ck
    fetch(`${STOCK_BASE}/${sysId}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setStock(data.result ?? data) })
      .catch(() => { if (!cancelled) setStock(null) })
      .finally(() => { if (!cancelled) setStockLoading(false) })
    return () => { cancelled = true }
  }, [sysId, stockKey])

  // ── Purchase history fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (!SYS_ID_RE.test(sysId)) return
    let cancelled = false
    const g_ck = (window as any).g_ck
    const params = new URLSearchParams({
      sysparm_query: `bean=${sysId}^ORDERBYDESCpurchase_date`,
      sysparm_fields: 'sys_id,grams,purchase_date',
      sysparm_limit: '20',
    })
    fetch(`/api/now/table/${BEAN_PURCHASE_TABLE}?${params}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setHistory(data.result || []) })
      .catch(() => { if (!cancelled) setHistory([]) })
    return () => { cancelled = true }
  }, [sysId, historyKey])

  // ── Add Beans handler ──────────────────────────────────────────────────────
  const handleAddBeans = async () => {
    setAddError('')
    const g_ck = (window as any).g_ck
    if (!g_ck) { setAddError('Session token not available.'); return }
    const gramsNum = parseInt(grams, 10)
    if (!grams || isNaN(gramsNum) || gramsNum <= 0) { setAddError('Enter a valid number of grams.'); return }
    if (!purchaseDate) { setAddError('Enter a purchase date.'); return }
    setAddLoading(true)
    try {
      const res = await fetch(`/api/now/table/${BEAN_PURCHASE_TABLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
        body: JSON.stringify({ bean: sysId, grams: gramsNum, purchase_date: purchaseDate }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setGrams('')
      setPurchaseDate(new Date().toISOString().slice(0, 10))
      setStockKey(k => k + 1)
      setHistoryKey(k => k + 1)
    } catch {
      setAddError("Couldn't save purchase — try again.")
    } finally {
      setAddLoading(false)
    }
  }

  // ── Archive handler ────────────────────────────────────────────────────────
  const handleArchive = async () => {
    setArchiveError('')
    if (!SYS_ID_RE.test(sysId)) { setArchiveError('Invalid record identifier.'); return }
    const g_ck = (window as any).g_ck
    if (!g_ck) { setArchiveError('Session token not available.'); return }
    try {
      const res = await fetch(`/api/now/table/${BEAN_TABLE}/${sysId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
        body: JSON.stringify({ active: false }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowArchive(false)
      handleBack()
    } catch {
      setShowArchive(false)
      setArchiveError("Couldn't archive — try again.")
    }
  }

  const remainingG = stock?.remaining_g ?? 0
  const totalPurchasedG = stock?.total_purchased_g ?? 0
  const isLowStock = remainingG < LOW_STOCK_THRESHOLD && remainingG > 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', padding: '24px' }}>

      {/* ── Left column: breadcrumb + RecordProvider form ── */}
      <div style={{ gridColumn: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Breadcrumb */}
        <div>
          <Button
            onClicked={handleBack}
            variant="tertiary"
            style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', padding: 0, background: 'none', border: 'none', minHeight: '32px' }}
          >
            ← Beans
          </Button>
        </div>

        {/* Archive error */}
        {archiveError && (
          <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '14px' }}>
            {archiveError}
          </div>
        )}

        {/* RecordProvider form — detail view (NOT sysId="-1") */}
        <RecordProvider table={BEAN_TABLE} sysId={sysId} isReadOnly={false}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: 'var(--sp-md)' }}>
            <Button
              onClicked={() => setShowArchive(true)}
              variant="secondary"
              style={{
                color: 'var(--aibrew-destructive)',
                border: '1px solid var(--aibrew-destructive)',
                borderRadius: '16px',
                padding: '4px 8px',
                fontSize: '14px',
                minHeight: '32px',
                backgroundColor: 'transparent',
              }}
            >
              Archive
            </Button>
          </div>
          <FormColumnLayout />
        </RecordProvider>
      </div>

      {/* ── Right column: KPI strip, stock bar, inventory, Add Beans, history ── */}
      <div style={{ gridColumn: '2', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* KPI strip — 3 metric boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ border: '1px solid var(--aibrew-ink-5)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>on shelf</div>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--aibrew-font-disp)' }}>
              {stockLoading ? '—' : `${remainingG}g`}
            </div>
          </div>
          <div style={{ border: '1px solid var(--aibrew-ink-5)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>total ever</div>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--aibrew-font-disp)' }}>
              {stockLoading ? '—' : `${totalPurchasedG}g`}
            </div>
          </div>
          <div style={{ border: '1px solid var(--aibrew-ink-5)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>avg rating</div>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--aibrew-font-disp)' }}>—</div>
          </div>
        </div>

        {/* Stock progress bar (D-05) */}
        {stockLoading ? (
          <div style={{ background: 'var(--aibrew-ink-5)', borderRadius: '4px', height: '8px', width: '60%' }} />
        ) : (
          <div>
            <div
              aria-label={`${remainingG}g remaining of ${totalPurchasedG}g total`}
              style={{ background: 'var(--aibrew-ink-5)', borderRadius: '4px', height: '8px', width: '100%', overflow: 'hidden' }}
            >
              <div
                style={{
                  width: `${totalPurchasedG > 0 ? Math.min(100, (remainingG / totalPurchasedG) * 100) : 0}%`,
                  height: '100%',
                  background: isLowStock ? 'var(--aibrew-destructive)' : 'var(--aibrew-accent)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--aibrew-ink-3)', marginTop: '4px', fontFamily: 'var(--aibrew-font-body)' }}>
              {remainingG}g / {totalPurchasedG}g
            </div>
            {isLowStock && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  background: 'var(--aibrew-destructive)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ⚠ Low stock
              </span>
            )}
          </div>
        )}

        {/* Inventory bag list — each bag shown as active (brew deductions deferred to Phase 3) */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', fontFamily: 'var(--aibrew-font-disp)' }}>
            Inventory · pantry
          </h3>
          {history.length === 0 ? (
            <p style={{ color: 'var(--aibrew-ink-3)', fontSize: '14px', fontFamily: 'var(--aibrew-font-body)' }}>
              No bags recorded yet.
            </p>
          ) : (
            history.map((row: any) => (
              <div
                key={row.sys_id?.value ?? row.sys_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--aibrew-ink-5)',
                }}
              >
                <span style={{ fontSize: '14px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
                  {row.purchase_date?.display_value ?? row.purchase_date}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--aibrew-font-body)' }}>
                  {row.grams?.value ?? row.grams}g
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--aibrew-ink-3)',
                    background: 'var(--aibrew-paper-2)',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontFamily: 'var(--aibrew-font-body)',
                  }}
                >
                  active
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add Beans inline form (D-06) */}
        {/* NOTE: native <input> elements are intentional — @servicenow/react-components has no
            number or date input primitive. Using RecordProvider+FormColumnLayout for a 2-field
            inline form is architecturally inappropriate. This exception is documented in the plan. */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', fontFamily: 'var(--aibrew-font-disp)' }}>
            Add Beans
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontFamily: 'var(--aibrew-font-body)' }}>
                Grams
              </label>
              <input
                type="number"
                min="1"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                style={{
                  width: '100px',
                  padding: '6px 8px',
                  border: '1px solid var(--aibrew-ink)',
                  borderRadius: '4px',
                  fontFamily: 'var(--aibrew-font-body)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontFamily: 'var(--aibrew-font-body)' }}>
                Purchase date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--aibrew-ink)',
                  borderRadius: '4px',
                  fontFamily: 'var(--aibrew-font-body)',
                  fontSize: '14px',
                }}
              />
            </div>
            <Button
              onClicked={handleAddBeans}
              variant="primary"
              style={{ opacity: addLoading ? 0.6 : 1, pointerEvents: addLoading ? 'none' : 'auto', minHeight: '36px' }}
            >
              {addLoading ? 'Saving…' : 'Add Beans'}
            </Button>
          </div>
          {addError && (
            <p style={{ color: 'var(--aibrew-destructive)', fontSize: '14px', marginTop: '8px', fontFamily: 'var(--aibrew-font-body)' }}>
              {addError}
            </p>
          )}
        </div>

        {/* Purchase history (D-07) */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', fontFamily: 'var(--aibrew-font-disp)' }}>
            Purchase history
            {history.length > 0 && (
              <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--aibrew-ink-3)', marginLeft: '8px', fontFamily: 'var(--aibrew-font-body)' }}>
                {history.length} {history.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </h3>
          {history.length === 0 ? (
            <p style={{ color: 'var(--aibrew-ink-3)', fontSize: '14px', fontFamily: 'var(--aibrew-font-body)' }}>
              No purchases yet.
            </p>
          ) : (
            history.map((row: any) => (
              <div
                key={row.sys_id?.value ?? row.sys_id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--aibrew-ink-5)',
                  fontSize: '14px',
                  fontFamily: 'var(--aibrew-font-body)',
                }}
              >
                <span style={{ color: 'var(--aibrew-ink-3)', minWidth: '80px' }}>
                  {row.purchase_date?.display_value ?? row.purchase_date}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {row.grams?.value ?? row.grams}g
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Archive confirmation modal (D-09) ── */}
      <Modal
        opened={showArchive}
        footerActions={[
          { label: 'Archive', variant: 'primary-negative' },
          { label: 'Cancel', variant: 'secondary' },
        ]}
        onFooterActionClicked={(e: CustomEvent) => {
          if (e.detail?.payload?.action?.label === 'Archive') handleArchive()
          else setShowArchive(false)
        }}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowArchive(false) }}
      >
        <h2 style={modalHeadingStyle}>Archive this bean?</h2>
        <div style={bodyStyle}>It won't appear in your pantry, but all brew references will be kept.</div>
      </Modal>
    </div>
  )
}

// ─── Stock progress bar ──────────────────────────────────────────────────────

function StockBar({ remaining_g, total_purchased_g, loading }: StockInfo & { loading: boolean }) {
  if (loading) {
    return (
      <div
        style={{
          background: 'var(--aibrew-ink-5)',
          borderRadius: '4px',
          height: '8px',
          width: '60%',
        }}
      />
    )
  }

  const pct = total_purchased_g > 0 ? Math.min(100, (remaining_g / total_purchased_g) * 100) : 0
  const isLowStock = remaining_g < LOW_STOCK_THRESHOLD && remaining_g > 0
  const barColor = isLowStock ? 'var(--aibrew-destructive)' : 'var(--aibrew-accent)'

  return (
    <div>
      <div
        style={{
          background: 'var(--aibrew-ink-5)',
          borderRadius: '4px',
          height: '8px',
          overflow: 'hidden',
          marginBottom: '4px',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--aibrew-font-body)',
          fontSize: '12px',
          color: 'var(--aibrew-ink-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          {remaining_g}g / {total_purchased_g}g
        </span>
        {isLowStock && (
          <span
            style={{
              background: 'var(--aibrew-destructive)',
              color: '#fff',
              borderRadius: '8px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            ⚠ Low stock
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Bean card ───────────────────────────────────────────────────────────────

function BeanCard({
  bean,
  stock,
  stockLoading,
  onClick,
}: {
  bean: any
  stock: StockInfo | undefined
  stockLoading: boolean
  onClick: () => void
}) {
  const name = bean.name?.display_value ?? bean.name?.value ?? ''
  const origin = bean.origin?.display_value ?? bean.origin?.value ?? ''
  const roasterName = bean['roaster.display_value']?.display_value ?? bean['roaster.display_value']?.value ?? ''

  const remaining_g = stock?.remaining_g ?? 0
  const total_purchased_g = stock?.total_purchased_g ?? 0

  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        background: 'var(--aibrew-paper-2)',
        border: '1px solid var(--aibrew-ink-5)',
        borderRadius: '8px',
        padding: 'var(--sp-md)',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: '120px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--aibrew-font-body)',
          fontWeight: 700,
          fontSize: '15px',
          color: 'var(--aibrew-ink)',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
      {roasterName && (
        <div
          style={{
            fontFamily: 'var(--aibrew-font-body)',
            fontSize: '13px',
            color: 'var(--aibrew-ink-3)',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {roasterName}
        </div>
      )}
      {origin && (
        <div
          style={{
            fontFamily: 'var(--aibrew-font-body)',
            fontSize: '13px',
            color: 'var(--aibrew-ink-3)',
            marginBottom: 'var(--sp-sm)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {origin}
        </div>
      )}
      <StockBar
        remaining_g={remaining_g}
        total_purchased_g={total_purchased_g}
        loading={stockLoading}
      />
    </button>
  )
}

// ─── BeanListView ─────────────────────────────────────────────────────────────

function BeanListView() {
  const [records, setRecords] = useState<any[]>([])
  const [stockMap, setStockMap] = useState<Record<string, StockInfo>>({})
  const [loading, setLoading] = useState(true)
  const [stockLoading, setStockLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listKey, setListKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'pantry' | 'empty'>('pantry')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setStockLoading(true)
    setError(null)
    const g_ck = (window as any).g_ck
    const qParams = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name,origin,roaster.display_value',
      sysparm_limit: '100',
    })
    fetch(`/api/now/table/${BEAN_TABLE}?${qParams}`, {
      headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
    })
      .then(r => r.json())
      .then(async data => {
        const beanList: any[] = data.result || []
        if (cancelled) return
        setRecords(beanList)
        setLoading(false)

        // Fan-out stock fetches via Promise.all()
        const stockResults = await Promise.all(
          beanList.map(b => {
            const id: string = b.sys_id?.value ?? b.sys_id ?? ''
            if (!SYS_ID_RE.test(id)) {
              return Promise.resolve({ remaining_g: 0, total_purchased_g: 0 })
            }
            return fetch(`${STOCK_BASE}/${id}`, {
              headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
            })
              .then(r => (r.ok ? r.json() : { remaining_g: 0, total_purchased_g: 0 }))
              .then(data => data.result ?? data)
              .catch(() => ({ remaining_g: 0, total_purchased_g: 0 }))
          })
        )
        const map: Record<string, StockInfo> = {}
        beanList.forEach((b, i) => {
          const id: string = b.sys_id?.value ?? b.sys_id ?? ''
          map[id] = stockResults[i]
        })
        if (!cancelled) {
          setStockMap(map)
          setStockLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecords([])
          setStockMap({})
          setError('Could not load beans — tap to retry.')
          setLoading(false)
          setStockLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [listKey])

  const handleRowClick = (sysId: string) => {
    navigateToView('catalog', { section: 'beans', id: sysId }, 'AIBrew — Bean')
  }

  const handleSaved = () => {
    setShowCreate(false)
    setListKey(k => k + 1)
  }

  const getBeanId = (b: any): string => b.sys_id?.value ?? b.sys_id ?? ''

  const pantryBeans = records.filter(b => (stockMap[getBeanId(b)]?.remaining_g ?? 0) > 0)
  const emptyBeans = records.filter(b => (stockMap[getBeanId(b)]?.remaining_g ?? 0) <= 0)
  const displayed = activeTab === 'pantry' ? pantryBeans : emptyBeans

  const tabButtonStyle = (tab: 'pantry' | 'empty') => ({
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--aibrew-accent)' : '2px solid transparent',
    borderRadius: 0,
    padding: '0 var(--sp-md)',
    height: '40px',
    fontFamily: 'var(--aibrew-font-body)',
    fontSize: '14px',
    color: activeTab === tab ? 'var(--aibrew-ink)' : 'var(--aibrew-ink-3)',
    cursor: 'pointer',
  })

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--sp-lg)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--aibrew-font-disp)',
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--aibrew-ink)',
            margin: 0,
          }}
        >
          Beans
        </h2>
        <Button
          onClicked={() => setShowCreate(true)}
          variant="primary"
          style={{ minHeight: '44px' }}
        >
          + New bean
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            color: 'var(--aibrew-destructive)',
            fontFamily: 'var(--aibrew-font-body)',
            fontSize: '16px',
            marginBottom: 'var(--sp-sm)',
          }}
        >
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          height: '40px',
          alignItems: 'center',
          borderBottom: '1px solid var(--aibrew-ink-5)',
          marginBottom: 'var(--sp-md)',
        }}
      >
        <Button
          onClicked={() => setActiveTab('pantry')}
          variant="tertiary"
          style={tabButtonStyle('pantry')}
        >
          In pantry
        </Button>
        <Button
          onClicked={() => setActiveTab('empty')}
          variant="tertiary"
          style={tabButtonStyle('empty')}
        >
          Empty bags
        </Button>
      </div>

      {/* Content area */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--sp-xl)',
            color: 'var(--aibrew-ink-3)',
            fontFamily: 'var(--aibrew-font-body)',
          }}
        >
          Loading…
        </div>
      ) : displayed.length === 0 ? (
        activeTab === 'pantry' ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--sp-xl)',
              color: 'var(--aibrew-ink-3)',
              fontFamily: 'var(--aibrew-font-body)',
            }}
          >
            <p style={{ marginBottom: 'var(--sp-md)' }}>
              No beans in pantry — add your first bean.
            </p>
            <Button onClicked={() => setShowCreate(true)} variant="primary" style={{ minHeight: '44px' }}>
              + New bean
            </Button>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--sp-xl)',
              color: 'var(--aibrew-ink-3)',
              fontFamily: 'var(--aibrew-font-body)',
            }}
          >
            <p>All your beans have stock remaining.</p>
          </div>
        )
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
          }}
        >
          {displayed.map(b => {
            const id = getBeanId(b)
            return (
              <BeanCard
                key={id}
                bean={b}
                stock={stockMap[id]}
                stockLoading={stockLoading}
                onClick={() => handleRowClick(id)}
              />
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        size="lg"
        opened={showCreate}
        onOpenedSet={(e: CustomEvent) => {
          if (!e.detail?.value) setShowCreate(false)
        }}
      >
        <div style={{ minWidth: '320px', width: '100%' }}>
          <h2 style={modalHeadingStyle}>New Bean</h2>
          <RecordProvider
            table={BEAN_TABLE}
            sysId="-1"
            isReadOnly={false}
            onFormSubmitCompleted={handleSaved}
          >
            <div style={{ width: '100%' }}>
              <FormActionBar />
            </div>
            <FormColumnLayout />
          </RecordProvider>
          <div style={{ marginTop: 'var(--sp-sm)' }}>
            <Button onClicked={() => setShowCreate(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function BeanSection({ params }: { params: URLSearchParams }) {
  const sysId = params.get('id')
  if (sysId) return <BeanDetailView sysId={sysId} />
  return <BeanListView />
}
