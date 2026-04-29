import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn } from '@servicenow/sdk/core'

export const x_664529_aibrew_equipment = Table({
  name: 'x_664529_aibrew_equipment',
  label: 'Equipment',
  display: 'name',
  schema: {
    name:   StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    type:   ChoiceColumn({
      label: 'Type',
      mandatory: true,
      choices: {
        grinder: { label: 'Grinder' },
        brewer:  { label: 'Brewer' },
      },
    }),
    notes:  StringColumn({ label: 'Notes', maxLength: 500 }),
    active: BooleanColumn({ label: 'Active', default: true }),
  },
})
