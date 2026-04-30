import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { navigateToView, getViewParams } from '../utils/navigate'

const ROASTER_TABLE = 'x_664529_aibrew_roaster'

const modalHeadingStyle = { fontFamily: 'var(--aibrew-font-disp)', fontSize: '20px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: '0 0 var(--sp-md) 0' }
const bodyStyle = { fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', color: 'var(--aibrew-ink)', padding: 'var(--sp-sm) 0' }

interface RoasterRecord { sys_id: string; name: string; website: string; notes: string }

function RoasterDetailView({ sysId }: { sysId: string }) {
  const [showArchive, setShowArchive] = useState(false)
  const [archiveError, setArchiveError] = useState('')

  const handleBack = () => navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Roasters')

  const handleArchive = async () => {
    setArchiveError('')
    try {
      const res = await fetch(`/api/now/table/${ROASTER_TABLE}/${sysId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-UserToken': (window as any).g_ck || '' },
        body: JSON.stringify({ active: 'false' }),
      })
      if (!res.ok) throw new Error()
      setShowArchive(false)
      handleBack()
    } catch {
      setShowArchive(false)
      setArchiveError("Couldn't archive — try again in a moment.")
    }
  }

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <Button onClicked={handleBack} variant="tertiary" style={{ color: 'var(--aibrew-accent)', padding: 0, marginBottom: 'var(--sp-md)', minHeight: '44px', background: 'none', border: 'none' }}>← Back</Button>
      {archiveError && <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', marginBottom: 'var(--sp-sm)' }}>{archiveError}</div>}
      <RecordProvider table={ROASTER_TABLE} sysId={sysId} isReadOnly={false}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--sp-md)' }}>
          <Button onClicked={() => setShowArchive(true)} variant="secondary" style={{ color: 'var(--aibrew-destructive)', border: '1px solid var(--aibrew-destructive)', borderRadius: '16px', padding: '4px 8px', fontSize: '14px', minHeight: '32px', backgroundColor: 'transparent' }}>Archive</Button>
        </div>
        <FormColumnLayout />
      </RecordProvider>
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
        <h2 style={modalHeadingStyle}>Archive this roaster?</h2>
        <div style={bodyStyle}>It won't appear in your lists, but all brew references will be kept.</div>
      </Modal>
    </div>
  )
}

function RoasterListView() {
  const [showCreate, setShowCreate] = useState(false)
  const [records, setRecords] = useState<RoasterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [listKey, setListKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      sysparm_query: 'active=true',
      sysparm_fields: 'sys_id,name,website,notes',
      sysparm_limit: '50',
    })
    fetch(`/api/now/table/${ROASTER_TABLE}?${params}`, {
      headers: { Accept: 'application/json', 'X-UserToken': (window as any).g_ck || '' },
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setRecords(data.result || []) })
      .catch(() => { if (!cancelled) setRecords([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [listKey])

  const handleRowClick = (sysId: string) => {
    navigateToView('catalog', { section: 'roasters', id: sysId }, 'AIBrew — Roaster')
  }

  const handleSaved = () => {
    setShowCreate(false)
    setListKey(k => k + 1)
  }

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
        <h2 style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '28px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: 0 }}>Roasters</h2>
        <Button onClicked={() => setShowCreate(true)} variant="primary" style={{ minHeight: '44px' }}>New roaster</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--sp-xl)', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>Loading…</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--sp-xl)', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>No roasters yet. Add your first roaster above.</div>
      ) : (
        <div style={{ borderTop: '1px solid var(--aibrew-ink-5)' }}>
          {records.map(r => (
            <Button
              key={r.sys_id}
              onClicked={() => handleRowClick(r.sys_id)}
              variant="tertiary"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-md)', borderBottom: '1px solid var(--aibrew-ink-5)', borderRadius: 0, minHeight: '56px', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--aibrew-ink)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px' }}>{r.name}</div>
                {r.website && <div style={{ fontSize: '14px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>{r.website}</div>}
              </div>
              <span style={{ color: 'var(--aibrew-ink-4)', fontSize: '18px' }}>›</span>
            </Button>
          ))}
        </div>
      )}
      <Modal
        size="lg"
        opened={showCreate}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowCreate(false) }}
      >
        <div style={{ minWidth: '320px', width: '100%' }}>
          <h2 style={modalHeadingStyle}>New Roaster</h2>
          <RecordProvider
            table={ROASTER_TABLE}
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
            <Button onClicked={() => setShowCreate(false)} variant="secondary">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function RoasterSection() {
  const params = getViewParams()
  const sysId = params.get('id')

  if (sysId) return <RoasterDetailView sysId={sysId} />
  return <RoasterListView />
}
