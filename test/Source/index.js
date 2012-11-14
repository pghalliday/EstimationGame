var expect = require('chai').expect,
    spawn = require('child_process').spawn,
    http = require('http');

describe('index', function() {
  var child;

  function start(args, env, callback) {
    child = spawn('node', [
      'Source/index.js'
    ].concat(args), {
      detached: false,
      stdio: 'pipe',
      env: env
    });
    child.stdout.setEncoding();
    child.stdout.once('data', function(data) {
      if (data === 'Started\n') {
        callback();
      } else {
        callback(new Error('unexpected data'));
      }
    });
  }

  function stop(callback) {
    child.once('exit', function(code, signal) {
      callback();
    });
    child.kill();
  }

  function getHomePage(port, callback) {
    http.get('http://localhost:' + port, function(response) {
      var completeResponse = '';
      expect(response.statusCode === 200);
      response.setEncoding();
      response.on('data', function(data) {
        completeResponse += data;
      });
      response.on('end', function() {
        expect(completeResponse).to.contain('<!-- EstimationGame Home Page -->');
        callback();
      });
    });
  }

  it('should start an EstimationGame server on port 8080 by default', function(done) {
    start([], {}, function(error) {
      if (error) {
        done(error);
      } else {
        getHomePage(8080, function() {
          stop(done);
        });
      }
    });
  });

  it('should start an EstimationGame server on port process.env.PORT if set', function(done) {
    start([], {PORT: 8000}, function(error) {
      if (error) {
        done(error);
      } else {
        getHomePage(8000, function() {
          stop(done);
        });
      }
    });
  });

  it('should start an EstimationGame server on the port passed in at the command line', function(done) {
    start([5000], {PORT: 8000}, function(error) {
      if (error) {
        done(error);
      } else {
        getHomePage(5000, function() {
          stop(done);
        });
      }
    });
  });
});