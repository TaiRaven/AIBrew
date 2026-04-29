import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { NowRecordListConnected } from '@servicenow/react-components/NowRecordListConnected'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { navigateToView, getViewParams } from '../utils/navigate'

const ROASTER_TABLE = 'x_664529_aibrew_roaster'

const modalHeadingStyle = { fontFamily: 'var(--aibrew-font-disp)', fontSize: '20px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: '0 0 var(--sp-md) 0' }
const bodyStyle = { fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', color: 'var(--aibrew-ink)', padding: 'var(--sp-sm) 0' }

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
          if (e.detail?.action?.label === 'Archive') handleArchive()
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

function RoasterListView({ onNew }: { onNew: () => void }) {
  const [showCreate, setShowCreate] = useState(false)

  const handleRowClick = (e: CustomEvent) => {
    const sysId = e.detail?.payload?.sys_id || e.detail?.sys_id
    if (!sysId) return
    navigateToView('catalog', { section: 'roasters', id: sysId }, 'AIBrew — Roaster')
  }

  return (
    <div style={{ padding: 'var(--sp-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
        <h2 style={{ fontFamily: 'var(--aibrew-font-disp)', fontSize: '28px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: 0 }}>Roasters</h2>
        <Button onClicked={() => setShowCreate(true)} variant="primary" style={{ minHeight: '44px' }}>New roaster</Button>
      </div>
      {/* key= used for filtering — NowRecordListConnected has no query prop */}
      <NowRecordListConnected
        key="active=true"
        table={ROASTER_TABLE}
        listTitle="Roasters"
        columns="name,website,notes"
        onRowClicked={handleRowClick}
        limit={50}
      />
      <Modal
        size="lg"
        opened={showCreate}
        onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowCreate(false) }}
      >
        <div style={{ minWidth: '320px', width: '100%' }}>
          <h2 style={modalHeadingStyle}>New Roaster</h2>
          <RecordProvider table={ROASTER_TABLE} sysId="-1" isReadOnly={false}>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', margin: 'var(--sp-md) 0' }}>
              <Button onClicked={() => setShowCreate(false)} variant="secondary">Cancel</Button>
            </div>
            <FormColumnLayout />
          </RecordProvider>
        </div>
      </Modal>
    </div>
  )
}

export default function RoasterSection() {
  const params = getViewParams()
  const sysId = params.get('id')
  const [showCreate, setShowCreate] = useState(false)

  if (sysId) return <RoasterDetailView sysId={sysId} />
  return <RoasterListView onNew={() => setShowCreate(true)} />
}
