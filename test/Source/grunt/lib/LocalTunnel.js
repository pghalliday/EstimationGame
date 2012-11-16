var expect = require('expect.js'),
    LocalTunnel = require('../../../../Source/grunt/lib/LocalTunnel'),
    http = require('http');

var PORT = 8080;
var TEST_RESPONSE = "This is a test";

describe('LocalTunnel', function() {
  it('should start a localtunnel to the given port', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.start(function(error, hostname) {
      expect(error).to.not.be.ok();
      expect(hostname).to.contain('localtunnel.com');
      
      var server = http.createServer(function(request, response) {
        response.end(TEST_RESPONSE);
      });
      server.listen(PORT, function() {
        http.get({
          hostname: hostname
        }, function(response) {
          expect(response.statusCode).to.equal(200);
          
          response.setEncoding();
          var responseData = '';
          response.on('data', function(data) {
            responseData += data;
          });
          response.on('end', function() {
            expect(responseData).to.equal(TEST_RESPONSE);
            
            server.close(function() {
              localTunnel.stop(done);
            });
          });
        }).on('error', function(error) {
          server.close(function() {
            localTunnel.stop(function() {
              done(error);
            });
          });
        });
      });
    });
  });
});