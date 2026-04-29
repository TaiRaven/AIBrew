import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const aibrew_menu = ApplicationMenu({
  $id: Now.ID['aibrew_menu'],
  title: 'AIBrew',
  description: 'Home coffee brew logging',
  hint: 'Log and track your brews',
  roles: [aibrew_user],
  active: true,
})

export const aibrew_home_module = Record({
  $id: Now.ID['aibrew_home_module'],
  table: 'sys_app_module',
  data: {
    title: 'AIBrew',
    application: aibrew_menu,
    link_type: 'DIRECT',
    query: 'x_664529_aibrew_home.do',
    hint: 'Open AIBrew',
    roles: ['x_664529_aibrew.user'],
    active: true,
    order: 100,
  },
})
