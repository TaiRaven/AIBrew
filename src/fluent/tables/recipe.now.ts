import '@servicenow/sdk/global'
import {
  Table, StringColumn, BooleanColumn, ChoiceColumn,
  ReferenceColumn, IntegerColumn, DecimalColumn, MultiLineTextColumn,
} from '@servicenow/sdk/core'
import { x_664529_aibrew_equipment } from './equipment.now'

export const x_664529_aibrew_recipe = Table({
  name: 'x_664529_aibrew_recipe',
  label: 'Recipe Preset',
  display: 'name',
  schema: {
    name:           StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    method:         ChoiceColumn({
                      label: 'Method',
                      choices: {
                        pour_over:    { label: 'Pour Over' },
                        espresso:     { label: 'Espresso' },
                        french_press: { label: 'French Press' },
                        aeropress:    { label: 'AeroPress' },
                        moka_pot:     { label: 'Moka Pot' },
                        cold_brew:    { label: 'Cold Brew' },
                        other:        { label: 'Other' },
                      },
                    }),
    equipment:      ReferenceColumn({
                      label: 'Equipment',
                      referenceTable: x_664529_aibrew_equipment.name,
                    }),
    dose_weight_g:  DecimalColumn({ label: 'Dose (g)' }),
    water_weight_g: DecimalColumn({ label: 'Water (g)' }),
    grind_size:     IntegerColumn({ label: 'Grind Size' }),
    notes:          MultiLineTextColumn({ label: 'Notes', maxLength: 1000 }),
    active:         BooleanColumn({ label: 'Active', default: true }),
  },
})
