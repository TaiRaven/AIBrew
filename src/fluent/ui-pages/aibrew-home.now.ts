import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import page from '../../client/index.html'

export const aibrew_home = UiPage({
  $id: Now.ID['aibrew_home'],
  endpoint: 'x_664529_aibrew_home.do',
  html: page,
  direct: true,
})
