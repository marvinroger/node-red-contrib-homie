var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;

module.exports = function (RED) {
  function Device (config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.events = new EventEmitter();
    this.state = 'disconnected';
    this.setState = function (state) {
      node.state = state;
      node.events.emit('state', state);
    };

    this.server = config.server;
    this.deviceId = config['device-id'];
    this.nodes = config.nodes;
    this.firmwareVersion = config['firmware-version'];
    this.topicNamespace = 'devices/' + this.deviceId;

    this.client = mqtt.connect({ host: this.server, port: 35589, clientId: this.deviceId, will: {
      topic: this.topicNamespace + '/$online', payload: 'false', qos: 2, retain: true
    }});
    this.sendProperty = function (nodeId, name, value) {
      node.client.publish(node.topicNamespace + '/' + nodeId + '/' + name, value, { qos: 2, retain: true });
    };

    this.client.on('connect', function () {
      node.setState('connected');

      node.client.publish(node.topicNamespace + '/$online', 'true', { qos: 2, retain: true });
      node.client.publish(node.topicNamespace + '/$nodes', node.nodes, { qos: 2, retain: true });
      node.client.publish(node.topicNamespace + '/$localip', 'node-red', { qos: 2, retain: true });
      node.client.publish(node.topicNamespace + '/$version', node.firmwareVersion, { qos: 2, retain: true });

      node.client.subscribe(node.topicNamespace + '/+/+/set', { qos: 2 });
    });

    this.client.on('message', function (topic, message) {
      var splitted = topic.split('/');
      var nodeId = splitted[2];
      var property = splitted[3];
      var value = message.toString();

      node.events.emit('command', nodeId, property, value);
    });

    this.client.on('close', function () {
      node.setState('disconnected');
    });

    this.client.on('offline', function () {
      node.setState('disconnected');
    });

    this.client.on('error', function () {
      node.setState('disconnected');
    });

    this.on('close', function (done) {
      if (node.state === 'connected') {
        node.client.end(true, function () { // need to be force closed, else done never called..
          done();
        });
      } else {
        done();
      }
    });
  }

  RED.nodes.registerType('Homie device', Device);
};
