import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

const table = 'x_664529_aibrew_equipment'

export const equipment_read = Acl({
  $id: Now.ID['equipment_read'],
  type: 'record',
  table,
  operation: 'read',
  roles: [aibrew_user],
})

export const equipment_write = Acl({
  $id: Now.ID['equipment_write'],
  type: 'record',
  table,
  operation: 'write',
  roles: [aibrew_user],
})

export const equipment_create = Acl({
  $id: Now.ID['equipment_create'],
  type: 'record',
  table,
  operation: 'create',
  roles: [aibrew_user],
})

export const equipment_delete = Acl({
  $id: Now.ID['equipment_delete'],
  type: 'record',
  table,
  operation: 'delete',
  roles: [aibrew_user],
})
