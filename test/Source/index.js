var expect = require('chai').expect,
    spawn = require('child_process').spawn,
    http = require('http');

describe('index', function() {
  var child;

  before(function(done) {
    child = spawn('node', [
      'Source/index.js'
    ], {
      detached: false,
      stdio: 'pipe'
    });
    child.stdout.setEncoding();
    child.stdout.once('data', function(data) {
      if (data === 'Started\n') {
        done();
      } else {
        done(new Error('unexpected data'));
      }
    });
  });

  it('should start an HTTP server on port 8080', function(done) {
    http.get('http://localhost:8080', function(response) {
      var completeResponse = '';
      expect(response.statusCode === 200);
      response.setEncoding();
      response.on('data', function(data) {
        completeResponse += data;
      });
      response.on('end', function() {
        expect(completeResponse).to.contain('<!-- EstimationGame Home Page -->');
        done();
      });
    });
  });

  after(function(done) {
    child.once('exit', function(code, signal) {
      done();
    });
    child.kill();
  });
});