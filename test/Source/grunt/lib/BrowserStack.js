var expect = require('expect.js'),
    MockBrowserstack = require('../../../../Mocks/MockBrowserstack'),
    proxyquire =  require('proxyquire');

var mockBrowserstack = new MockBrowserstack([{
  os: 'apple',
  browser: 'banana',
  version: 'pear'
}, {
  os: 'hello',
  browser: 'goodbye',
  version: 'huh'
},{
  os: 'foo',
  device: 'bar',
  version: 'foobar'
}]);
var BrowserStack = proxyquire('../../../../Source/grunt/lib/BrowserStack', __dirname, { 'browserstack': mockBrowserstack });

describe('BrowserStack', function() {
  it('should have a start method', function(done) {
    var browserStack = new BrowserStack();
    browserStack.start(done);
  });

  it('should start an instance of every browser by default', function(done) {
    var browserStack = new BrowserStack();
    browserStack.start(done);
  });
});