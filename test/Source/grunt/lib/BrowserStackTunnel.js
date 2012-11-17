var expect = require('expect.js'),
    BrowserStackTunnel = require('../../../../Source/grunt/lib/BrowserStackTunnel'),
    http = require('http'),
    fork = require('child_process').fork;

var JAR_FILE = './bin/BrowserStackTunnel.jar',
    INVALID_JAR_FILE = './bin/unknown.jar',
    HOST_NAME = 'localhost',
    PORT = 8080,
    INVALID_PORT = 8081,
    SSL_FLAG = 0,
    CONFIG = require('../../../../BrowserStackConfig');

var TEST_RESPONSE = "This is a test";

describe('BrowserStackTunnel', function() {
  var server;
  
  before(function(done) {
    server = http.createServer(function(request, response) {
      response.end(TEST_RESPONSE);
    });
    server.listen(PORT, done);
  });
  
  it('should error if there is a problem starting the tunnel', function(done) {
    var browserStackTunnel = new BrowserStackTunnel(INVALID_JAR_FILE, CONFIG.key, [{
      name: HOST_NAME,
      port: PORT,
      sslFlag: SSL_FLAG
    }]);
    browserStackTunnel.start(function(error) {
      expect(error.message).to.contain('tunnel failed to start');
      done();
    });
  });

  it('should error if stopped before started', function(done) {
    var browserStackTunnel = new BrowserStackTunnel(JAR_FILE, CONFIG.key, [{
      name: HOST_NAME,
      port: PORT,
      sslFlag: SSL_FLAG
    }]);
    browserStackTunnel.stop(function(error) {
      expect(error.message).to.be('tunnel not active');
      done();
    });    
  });

  it('should error if no server listening on the specified host and port', function(done) {
    var browserStackTunnel = new BrowserStackTunnel(JAR_FILE, CONFIG.key, [{
      name: HOST_NAME,
      port: INVALID_PORT,
      sslFlag: SSL_FLAG
    }]);
    browserStackTunnel.start(function(error) {
      expect(error.message).to.contain('tunnel failed to start');
      expect(error.message).to.contain('No one listening on ' + HOST_NAME + ':' + INVALID_PORT);
      done();
    });
  });

  it('should start the tunnel', function(done) {
    this.timeout(5000);
    var browserStackTunnel = new BrowserStackTunnel(JAR_FILE, CONFIG.key, [{
      name: HOST_NAME,
      port: PORT,
      sslFlag: SSL_FLAG
    }]);
    browserStackTunnel.start(function(error) {
      if (error) {
        expect().fail('Error encountered starting the tunnel:\n' + error);
      }
      // TODO: check if tunnel is really running
      browserStackTunnel.stop(function(error) {
        if (error) {
          expect().fail('Error encountered stopping the tunnel:\n' + error);
        }
        done();
      });
    });
  });

  it('should error if started when already running', function(done) {
    this.timeout(5000);
    var browserStackTunnel = new BrowserStackTunnel(JAR_FILE, CONFIG.key, [{
      name: HOST_NAME,
      port: PORT,
      sslFlag: SSL_FLAG
    }]);
    browserStackTunnel.start(function(error) {
      if (error) {
        expect().fail('Error encountered starting the tunnel:\n' + error);
      }
      browserStackTunnel.start(function(error) {
        expect(error.message).to.be('tunnel already started');
        browserStackTunnel.stop(function(error) {
          if (error) {
            expect().fail('Error encountered stopping the tunnel:\n' + error);
          }
          done();
        });
      });
    });
  });

  it('should stop the tunnel when the process exits', function(done) {
    this.timeout(10000);
    var child = fork('./test/support/childProcess.js', [JAR_FILE, CONFIG.key, HOST_NAME, PORT, SSL_FLAG]);
    child.on('message', function(message) {
      if (message.error) {
        expect().fail('Error encountered starting the tunnel:\n' + message.error);
        child.on('exit', function(code, signal) {
          done();
        });
      } else {
        // TODO: check if tunnel is really running
        child.on('exit', function(code, signal) {
          // should be able to start the tunnel again
          var browserStackTunnel = new BrowserStackTunnel(JAR_FILE, CONFIG.key, [{
            name: HOST_NAME,
            port: PORT,
            sslFlag: SSL_FLAG
          }]);
          browserStackTunnel.start(function(error) {
            if (error) {
              expect().fail('Error encountered starting the tunnel:\n' + error);
            }
            // TODO: check if tunnel is really running
            browserStackTunnel.stop(function(error) {
              expect(error).to.be.an('undefined');
              done();
            });
          });
        });
      }
      child.kill('SIGINT');
    });
  });
  
  after(function(done) {
    server.close(done);
  });
});