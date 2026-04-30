import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const bean_read = Acl({
  $id: Now.ID['bean_read'],
  type: 'record',
  table: 'x_664529_aibrew_bean',
  operation: 'read',
  roles: [aibrew_user],
})

export const bean_write = Acl({
  $id: Now.ID['bean_write'],
  type: 'record',
  table: 'x_664529_aibrew_bean',
  operation: 'write',
  roles: [aibrew_user],
})

export const bean_create = Acl({
  $id: Now.ID['bean_create'],
  type: 'record',
  table: 'x_664529_aibrew_bean',
  operation: 'create',
  roles: [aibrew_user],
})

export const bean_delete = Acl({
  $id: Now.ID['bean_delete'],
  type: 'record',
  table: 'x_664529_aibrew_bean',
  operation: 'delete',
  roles: [aibrew_user],
})
