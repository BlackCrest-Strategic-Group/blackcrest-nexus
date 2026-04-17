const BaseErpPlugin = require('./basePlugin');

class DynamicsPlugin extends BaseErpPlugin {
  constructor() {
    super('Dynamics');
  }

  mapBlanketRecommendations(data) {
    return {
      erp: this.name,
      // TODO: map to Dynamics purchasing payload.
      recommendations: data
    };
  }
}

module.exports = DynamicsPlugin;
