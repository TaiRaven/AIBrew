import { GlideAggregate, GlideRecord, gs } from '@servicenow/glide'

export function process(request: any, response: any) {
  const beanSysId = request.pathParams.bean_sys_id
  if (!beanSysId || !/^[0-9a-f]{32}$/i.test(beanSysId)) {
    response.setStatus(400)
    response.setBody({ error: 'Invalid bean_sys_id' })
    return
  }
  try {
    const purchaseAgg = new GlideAggregate('x_664529_aibrew_bean_purchase')
    purchaseAgg.addAggregate('SUM', 'grams')
    purchaseAgg.addEncodedQuery('bean=' + beanSysId)
    purchaseAgg.query()
    let totalPurchased = 0
    if (purchaseAgg.next()) {
      totalPurchased = parseInt(purchaseAgg.getAggregate('SUM', 'grams') || '0', 10)
    }

    // GlideAggregate SUM does not reliably aggregate DecimalColumn values
    // (returns 0 in this scope even when records exist with non-null doses).
    // Diagnostic confirmed: probe via GlideRecord finds correct sum; aggregate returns 0.
    // Workaround: scan via GlideRecord and sum in JS — at home-brew volumes (hundreds
    // of records max) the cost is negligible.
    const brewScan = new GlideRecord('x_664529_aibrew_brew_log')
    brewScan.addQuery('bean', beanSysId)
    brewScan.query()
    let totalUsed = 0
    while (brewScan.next()) {
      const dose = brewScan.getValue('dose_weight_g')
      if (dose) totalUsed += parseFloat(dose)
    }

    response.setBody({
      remaining_g: totalPurchased - totalUsed,
      total_purchased_g: totalPurchased,
    })
  } catch (e) {
    gs.error('BeanStockHelper error: ' + e)
    response.setStatus(500)
    response.setBody({ error: 'Stock computation failed' })
  }
}
