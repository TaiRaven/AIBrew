import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

const table = 'x_664529_aibrew_roaster'

export const roaster_read = Acl({
  $id: Now.ID['roaster_read'],
  type: 'record',
  table,
  operation: 'read',
  roles: [aibrew_user],
})

export const roaster_write = Acl({
  $id: Now.ID['roaster_write'],
  type: 'record',
  table,
  operation: 'write',
  roles: [aibrew_user],
})

export const roaster_create = Acl({
  $id: Now.ID['roaster_create'],
  type: 'record',
  table,
  operation: 'create',
  roles: [aibrew_user],
})

export const roaster_delete = Acl({
  $id: Now.ID['roaster_delete'],
  type: 'record',
  table,
  operation: 'delete',
  roles: [aibrew_user],
})
