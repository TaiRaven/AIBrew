import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const roaster_read = Acl({
  $id: Now.ID['roaster_read'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'read',
  roles: [aibrew_user],
})

export const roaster_write = Acl({
  $id: Now.ID['roaster_write'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'write',
  roles: [aibrew_user],
})

export const roaster_create = Acl({
  $id: Now.ID['roaster_create'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'create',
  roles: [aibrew_user],
})

export const roaster_delete = Acl({
  $id: Now.ID['roaster_delete'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'delete',
  roles: [aibrew_user],
})
