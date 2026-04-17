const BaseErpPlugin = require('./basePlugin');

class SapPlugin extends BaseErpPlugin {
  constructor() {
    super('SAP');
  }

  mapBlanketRecommendations(data) {
    return {
      erp: this.name,
      // TODO: map to SAP purchasing document structure.
      recommendations: data
    };
  }
}

module.exports = SapPlugin;
