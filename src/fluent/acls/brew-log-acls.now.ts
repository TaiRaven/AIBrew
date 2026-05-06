import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const brew_log_read = Acl({
  $id: Now.ID['brew_log_read'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'read',
  roles: [aibrew_user],
})

export const brew_log_write = Acl({
  $id: Now.ID['brew_log_write'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'write',
  roles: [aibrew_user],
})

export const brew_log_create = Acl({
  $id: Now.ID['brew_log_create'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'create',
  roles: [aibrew_user],
})

export const brew_log_delete = Acl({
  $id: Now.ID['brew_log_delete'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'delete',
  roles: [aibrew_user],
})
