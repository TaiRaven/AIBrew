import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn, ReferenceColumn, DateColumn } from '@servicenow/sdk/core'
import { x_664529_aibrew_roaster } from './roaster.now'

export const x_664529_aibrew_bean = Table({
  name: 'x_664529_aibrew_bean',
  label: 'Bean',
  display: 'name',
  schema: {
    name:        StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    origin:      StringColumn({ label: 'Origin', maxLength: 100 }),
    roast_level: ChoiceColumn({
      label: 'Roast Level',
      choices: {
        light:        { label: 'Light' },
        medium_light: { label: 'Medium-Light' },
        medium:       { label: 'Medium' },
        medium_dark:  { label: 'Medium-Dark' },
        dark:         { label: 'Dark' },
        extra_dark:   { label: 'Extra Dark' },
      },
    }),
    roast_date:  DateColumn({ label: 'Roast Date' }),
    roaster:     ReferenceColumn({ label: 'Roaster', referenceTable: x_664529_aibrew_roaster.name, mandatory: true }),
    active:      BooleanColumn({ label: 'Active', default: true }),
  },
})
