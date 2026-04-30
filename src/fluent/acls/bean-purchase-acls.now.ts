import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const bean_purchase_read = Acl({
  $id: Now.ID['bean_purchase_read'],
  type: 'record',
  table: 'x_664529_aibrew_bean_purchase',
  operation: 'read',
  roles: [aibrew_user],
})

export const bean_purchase_write = Acl({
  $id: Now.ID['bean_purchase_write'],
  type: 'record',
  table: 'x_664529_aibrew_bean_purchase',
  operation: 'write',
  roles: [aibrew_user],
})

export const bean_purchase_create = Acl({
  $id: Now.ID['bean_purchase_create'],
  type: 'record',
  table: 'x_664529_aibrew_bean_purchase',
  operation: 'create',
  roles: [aibrew_user],
})

export const bean_purchase_delete = Acl({
  $id: Now.ID['bean_purchase_delete'],
  type: 'record',
  table: 'x_664529_aibrew_bean_purchase',
  operation: 'delete',
  roles: [aibrew_user],
})
