class BaseErpPlugin {
  constructor(name) {
    this.name = name;
  }

  // Future adapters should override this to transform recommendations.
  mapBlanketRecommendations(_data) {
    throw new Error(`mapBlanketRecommendations not implemented for ${this.name}`);
  }
}

module.exports = BaseErpPlugin;
