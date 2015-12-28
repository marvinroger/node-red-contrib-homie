module.exports = function (RED) {
  function Shim (config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.handleDeviceState = function (state) {
      switch (state) {
        case 'connected':
          node.status({ fill: 'green', shape: 'dot', text: 'connected' });
          break;
        case 'disconnected':
          node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
          break;
      }
    };

    this.device = RED.nodes.getNode(config.device);

    this.handleDeviceState(this.device.state);

    this.device.events.on('state', function (state) {
      node.handleDeviceState(state);
    });
  }

  RED.nodes.registerType('Homie shim', Shim);
};
