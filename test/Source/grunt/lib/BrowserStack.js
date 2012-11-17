var expect = require('expect.js'),
    BrowserStack = require('../../../../Source/grunt/lib/BrowserStack');

describe('BrowserStack', function() {
  it('should have a start method', function(done) {
    var browserStack = new BrowserStack();
    browserStack.start(done);
  });
});