var spawn = require('child_process').spawn,
    pty = require('pty.js');

function LocalTunnel(port) {
  var self = this;
  var child;

  process.on("exit", function(code, signal) {
    if (child) {
      child.on('exit', function(code, signal) {
        child = null;
      });
      child.kill(signal);
    }
  });
  
  self.start = function(callback) {
    var stdoutData = '';
    child = pty.spawn('localtunnel', [port], {
      name: 'localtunnel',
      cols: 80,
      rows: 30
    });
    child.setEncoding();
    child.on('data', function(data) {
      stdoutData += data.toString();
      var match = stdoutData.match(/[a-z0-9]{4}\.localtunnel\.com/g);
      if (match) {
        callback(null, match[0]);
      }
    });
  };
  
  self.stop = function(callback) {
    child.on('exit', function(code, signal) {
      child = null;
      callback();
    });
    child.kill();
  };
}

module.exports = LocalTunnel;