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

    this.device.events.on('command', function (nodeId, property, value) {
      node.send({ nodeId: nodeId, property: property, payload: value });
    });
  }

  RED.nodes.registerType('Homie shim', Shim);
};
