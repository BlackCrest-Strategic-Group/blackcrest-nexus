const BaseErpPlugin = require('./basePlugin');

class OraclePlugin extends BaseErpPlugin {
  constructor() {
    super('Oracle');
  }

  mapBlanketRecommendations(data) {
    return {
      erp: this.name,
      // TODO: map to Oracle procurement import format.
      recommendations: data
    };
  }
}

module.exports = OraclePlugin;
