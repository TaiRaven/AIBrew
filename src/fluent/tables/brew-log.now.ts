import '@servicenow/sdk/global'
import {
  Table, StringColumn, ChoiceColumn, ReferenceColumn,
  IntegerColumn, DecimalColumn,
} from '@servicenow/sdk/core'
import { x_664529_aibrew_bean }      from './bean.now'
import { x_664529_aibrew_equipment } from './equipment.now'
import { x_664529_aibrew_recipe }    from './recipe.now'

export const x_664529_aibrew_brew_log = Table({
  name: 'x_664529_aibrew_brew_log',
  label: 'Brew Log',
  display: 'sys_created_on',
  schema: {
    method: ChoiceColumn({
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
    bean:              ReferenceColumn({ label: 'Bean',           referenceTable: x_664529_aibrew_bean.name }),
    equipment:         ReferenceColumn({ label: 'Equipment',      referenceTable: x_664529_aibrew_equipment.name }),
    recipe:            ReferenceColumn({ label: 'Recipe',         referenceTable: x_664529_aibrew_recipe.name }),
    dose_weight_g:     DecimalColumn({ label: 'Dose (g)' }),
    water_weight_g:    DecimalColumn({ label: 'Water (g)' }),
    grind_size:        IntegerColumn({ label: 'Grind Size' }),          // MUST be IntegerColumn — never StringColumn
    brew_time_seconds: IntegerColumn({ label: 'Brew Time (s)' }),
    rating:            IntegerColumn({ label: 'Rating', min: 1, max: 10 }),
    taste_notes:       StringColumn({ label: 'Taste Notes', maxLength: 500 }),
  },
})
