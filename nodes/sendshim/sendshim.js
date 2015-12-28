module.exports = function (RED) {
  function SendShim (config) {
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
    this.nodeId = config['node-id'];
    this.property = { name: config.property };

    this.handleDeviceState(this.device.state);

    this.device.events.on('state', function (state) {
      node.handleDeviceState(state);
    });

    this.on('input', function (msg) {
      node.device.sendProperty(node.nodeId, node.property.name, msg.payload);
    });
  }

  RED.nodes.registerType('Homie send from shim', SendShim);
};
