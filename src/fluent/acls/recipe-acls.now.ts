import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const recipe_read = Acl({
  $id: Now.ID['recipe_read'],
  type: 'record',
  table: 'x_664529_aibrew_recipe',
  operation: 'read',
  roles: [aibrew_user],
})

export const recipe_write = Acl({
  $id: Now.ID['recipe_write'],
  type: 'record',
  table: 'x_664529_aibrew_recipe',
  operation: 'write',
  roles: [aibrew_user],
})

export const recipe_create = Acl({
  $id: Now.ID['recipe_create'],
  type: 'record',
  table: 'x_664529_aibrew_recipe',
  operation: 'create',
  roles: [aibrew_user],
})

export const recipe_delete = Acl({
  $id: Now.ID['recipe_delete'],
  type: 'record',
  table: 'x_664529_aibrew_recipe',
  operation: 'delete',
  roles: [aibrew_user],
})
