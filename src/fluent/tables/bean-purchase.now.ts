import '@servicenow/sdk/global'
import { Table, IntegerColumn, DateColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'
import { x_664529_aibrew_bean } from './bean.now'

export const x_664529_aibrew_bean_purchase = Table({
  name: 'x_664529_aibrew_bean_purchase',
  label: 'Bean Purchase',
  display: 'bean',
  schema: {
    bean:          ReferenceColumn({ label: 'Bean', referenceTable: x_664529_aibrew_bean.name, mandatory: true }),
    grams:         IntegerColumn({ label: 'Grams', mandatory: true }),
    purchase_date: DateColumn({ label: 'Purchase Date', mandatory: true }),
    active:        BooleanColumn({ label: 'Active', default: true }),
  },
})
