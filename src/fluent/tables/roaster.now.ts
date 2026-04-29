import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, UrlColumn } from '@servicenow/sdk/core'

export const x_664529_aibrew_roaster = Table({
  name: 'x_664529_aibrew_roaster',
  label: 'Roaster',
  display: 'name',
  schema: {
    name:    StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    website: UrlColumn({ label: 'Website' }),
    notes:   StringColumn({ label: 'Notes', maxLength: 1000 }),
    active:  BooleanColumn({ label: 'Active', default: true }),
  },
})
