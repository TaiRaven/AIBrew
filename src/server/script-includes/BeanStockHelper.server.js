// ES5 only — no const, let, class, or arrow functions
// Glide APIs (GlideAggregate, GlideRecord, gs) are auto-available — do NOT import them
var BeanStockHelper = Class.create()
BeanStockHelper.prototype = {
  initialize: function() {},

  getStock: function(beanSysId) {
    var purchaseAgg = new GlideAggregate('x_664529_aibrew_bean_purchase')
    purchaseAgg.addAggregate('SUM', 'grams')
    purchaseAgg.addEncodedQuery('bean=' + beanSysId)
    purchaseAgg.query()
    var totalPurchased = 0
    if (purchaseAgg.next()) {
      totalPurchased = parseInt(purchaseAgg.getAggregate('SUM', 'grams') || '0', 10)
    }

    // Phase 4+: subtract brew depletions
    // var brewAgg = new GlideAggregate('x_664529_aibrew_brew_log')
    // brewAgg.addAggregate('SUM', 'dose_weight_g')
    // brewAgg.addEncodedQuery('bean=' + beanSysId)
    // brewAgg.query()
    // var totalUsed = brewAgg.next() ? parseInt(brewAgg.getAggregate('SUM', 'dose_weight_g') || '0', 10) : 0
    var totalUsed = 0

    return { remaining_g: totalPurchased - totalUsed, total_purchased_g: totalPurchased }
  },

  type: 'BeanStockHelper',
}
