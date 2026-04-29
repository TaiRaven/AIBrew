import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

export const aibrew_user = Role({
  name: 'x_664529_aibrew.user',
  description: 'Standard AIBrew user — read/write access to all app data',
  grantable: true,
})
