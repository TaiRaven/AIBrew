import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const equipment_read = Acl({
  $id: Now.ID['equipment_read'],
  type: 'record',
  table: 'x_664529_aibrew_equipment',
  operation: 'read',
  roles: [aibrew_user],
})

export const equipment_write = Acl({
  $id: Now.ID['equipment_write'],
  type: 'record',
  table: 'x_664529_aibrew_equipment',
  operation: 'write',
  roles: [aibrew_user],
})

export const equipment_create = Acl({
  $id: Now.ID['equipment_create'],
  type: 'record',
  table: 'x_664529_aibrew_equipment',
  operation: 'create',
  roles: [aibrew_user],
})

export const equipment_delete = Acl({
  $id: Now.ID['equipment_delete'],
  type: 'record',
  table: 'x_664529_aibrew_equipment',
  operation: 'delete',
  roles: [aibrew_user],
})
