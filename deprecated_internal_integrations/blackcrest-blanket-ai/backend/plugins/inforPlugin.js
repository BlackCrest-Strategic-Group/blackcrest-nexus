const BaseErpPlugin = require('./basePlugin');

class InforPlugin extends BaseErpPlugin {
  constructor() {
    super('Infor CSI / SyteLine');
  }

  mapBlanketRecommendations(data) {
    return {
      erp: this.name,
      // TODO: map to CSI blanket PO payload schema.
      recommendations: data
    };
  }
}

module.exports = InforPlugin;
