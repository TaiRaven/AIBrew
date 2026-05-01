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

// Suppress unused import warning — BEAN_PURCHASE_TABLE is reserved for Phase 4 brew deductions
void BEAN_PURCHASE_TABLE

interface StockInfo {
  remaining_g: number
  total_purchased_g: number
}

// ─── BeanDetailView (stub — replaced in Plan 04) ────────────────────────────

function BeanDetailView({ sysId }: { sysId: string }) {
  const [showArchive, setShowArchive] = useState(false)
  const [archiveError, setArchiveError] = useState('')

  const handleBack = () => navigateToView('catalog', { section: 'beans' }, 'AIBrew — Beans')

  const handleArchive = async () => {
    setArchiveError('')
    if (!SYS_ID_RE.test(sysId)) {
      setArchiveError('Invalid record identifier.')
      return
    }
    const g_ck = (window as any).g_ck
    if (!g_ck) {
      setArchiveError('Session token not available — please reload the page.')
      return
    }
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
      setArchiveError("Couldn't archive — try again in a moment.")
    }
  }

  // Plan 04 will replace this stub with full RecordProvider detail/edit view.
  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <Button
        onClicked={handleBack}
        variant="tertiary"
        style={{ color: 'var(--aibrew-accent)', padding: 0, marginBottom: 'var(--sp-md)', minHeight: '44px', background: 'none', border: 'none' }}
      >
        ← Back
      </Button>
      {archiveError && (
        <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', marginBottom: 'var(--sp-sm)' }}>
          {archiveError}
        </div>
      )}
      <div style={{ textAlign: 'center', padding: 'var(--sp-xl)', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
        Bean detail coming soon
      </div>
      <div style={{ marginTop: 'var(--sp-md)', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClicked={() => setShowArchive(true)}
          variant="secondary"
          style={{ color: 'var(--aibrew-destructive)', border: '1px solid var(--aibrew-destructive)', borderRadius: '16px', padding: '4px 8px', fontSize: '14px', minHeight: '32px', backgroundColor: 'transparent' }}
        >
          Archive
        </Button>
      </div>
      <Modal
        opened={showArchive}
        footerActions={[
          { label: 'Archive', variant: 'primary-negative' },
          { label: 'Keep it', variant: 'secondary' },
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
