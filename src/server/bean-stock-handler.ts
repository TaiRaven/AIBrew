import { GlideAggregate, gs } from '@servicenow/glide'

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

    // Phase 4+: subtract brew depletions
    // const brewAgg = new GlideAggregate('x_664529_aibrew_brew_log')
    // brewAgg.addAggregate('SUM', 'dose_weight_g')
    // brewAgg.addEncodedQuery('bean=' + beanSysId)
    // brewAgg.query()
    // const totalUsed = brewAgg.next()
    //   ? parseInt(brewAgg.getAggregate('SUM', 'dose_weight_g') || '0', 10)
    //   : 0
    const totalUsed = 0

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
