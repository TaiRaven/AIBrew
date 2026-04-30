import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/bean-stock-handler'

export const bean_stock_api = RestApi({
  $id: Now.ID['bean_stock_api'],
  name: 'Bean Stock API',
  serviceId: 'stock',
  consumes: 'application/json',
  versions: [
    { $id: Now.ID['bean_stock_api_v1'], version: 1, isDefault: true },
  ],
  routes: [
    {
      $id: Now.ID['bean_stock_get'],
      name: 'get stock',
      method: 'GET',
      path: '/{bean_sys_id}',
      version: 1,
      authentication: true,
      authorization: true,
      script: process,
    },
  ],
})
