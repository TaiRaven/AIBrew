import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const BeanStockHelper = ScriptInclude({
  $id: Now.ID['BeanStockHelper'],
  name: 'BeanStockHelper',
  active: true,
  apiName: 'x_664529_aibrew.BeanStockHelper',
  script: Now.include('../../server/script-includes/BeanStockHelper.server.js'),
})
