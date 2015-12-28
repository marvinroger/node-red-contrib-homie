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
    this.property = config.property;
    this.value = config.value;

    this.handleDeviceState(this.device.state);

    this.device.events.on('state', function (state) {
      node.handleDeviceState(state);
    });

    this.on('input', function (msg) {
      var nodeId = node.nodeId || msg.nodeId;
      var property = node.property || msg.property;
      var value = node.value || msg.payload;
      node.device.sendProperty(nodeId, property, value);
    });
  }

  RED.nodes.registerType('Homie send from shim', SendShim);
};
