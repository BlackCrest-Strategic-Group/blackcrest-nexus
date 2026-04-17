const InforPlugin = require('./inforPlugin');
const SapPlugin = require('./sapPlugin');
const OraclePlugin = require('./oraclePlugin');
const DynamicsPlugin = require('./dynamicsPlugin');

const pluginRegistry = {
  infor: new InforPlugin(),
  sap: new SapPlugin(),
  oracle: new OraclePlugin(),
  dynamics: new DynamicsPlugin()
};

module.exports = {
  pluginRegistry
};
