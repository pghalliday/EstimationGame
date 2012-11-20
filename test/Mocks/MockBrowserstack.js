var expect = require('expect.js'),
    MockBrowserstack = require('../../Mocks/MockBrowserstack');

var QUEUE_TIME = 500;
var TERMINATION_TIME = 1000;

describe('MockBrowserstack', function() {
  var testBrowsers = [{
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
  }];
  var mockBrowserstack = new MockBrowserstack(testBrowsers, QUEUE_TIME);

  describe('#createClient', function() {
    var client = mockBrowserstack.createClient({
      username: 'hello',
      password: 'goodbye',
      version: 'apple',
      server: 'banana'
    });

    it('should expose settings', function() {
      expect(client.username).to.equal('hello');
      expect(client.password).to.equal('goodbye');
      expect(client.version).to.equal('apple');
      expect(client.server).to.equal('banana');
    });

    describe('#getBrowsers', function() {
      it('should return the browsers', function(done) {
        client.getBrowsers(function(error, browsers) {
          expect(browsers).to.equal(testBrowsers);
          done();
        });
      });
    });

    describe('#createWorker', function() {
      it('should error if the browser is invalid', function(done) {
        client.createWorker({
          os: 'hello',
          browser: 'boo',
          version: 'huh'
        }, function(error, worker) {
          expect(error.message).to.equal('invalid browser settings');
          expect(worker).to.not.be.ok();
          done();
        });
      });

      it('should create workers with correct settings, unique IDs and intitial status of "queue"', function(done) {
        client.createWorker({
          os: 'hello',
          browser: 'goodbye',
          version: 'huh',
          url: 'my url'
        }, function(error, worker1) {
          expect(error).to.not.be.ok();
          expect(worker1.os).to.equal('hello');
          expect(worker1.browser).to.equal('goodbye');
          expect(worker1.version).to.equal('huh');
          expect(worker1.id).to.be.ok();
          expect(worker1.status).to.equal('queue');
          expect(worker1.url).to.equal('my url');
          client.createWorker({
            os: 'foo',
            device: 'bar',
            version: 'foobar',
            url: 'another url'
          }, function(error, worker2) {
            expect(error).to.not.be.ok();
            expect(worker2.os).to.equal('foo');
            expect(worker2.device).to.equal('bar');
            expect(worker2.version).to.equal('foobar');
            expect(worker2.id).to.be.ok();
            expect(worker2.id).to.not.eql(worker1.id);
            expect(worker2.status).to.equal('queue');
            expect(worker2.url).to.equal('another url');
            done();
          });
        });
      });

      describe('#getWorker', function() {
        it('should error if there is no matching worker', function(done) {
          client.getWorker('nonsense', function(error, worker) {
            expect(error.message).to.equal('no such worker');
            expect(worker).to.not.be.ok();
            done();
          });
        });

        it('should initially return a copy of the worker returned by create worker', function(done) {
          client.createWorker({
            os: 'hello',
            browser: 'goodbye',
            version: 'huh'
          }, function(error, worker1) {
            if (error) {
              expect().fail('could not create worker');
            } else {
              client.getWorker(worker1.id, function(error, worker2) {
                if (error) {
                  expect().fail('could not get worker');
                } else {
                  expect(worker2).to.not.equal(worker1);
                  expect(worker2.os).to.equal(worker1.os);
                  expect(worker2.browser).to.equal(worker1.browser);
                  expect(worker2.version).to.equal(worker1.version);
                  expect(worker2.id).to.equal(worker1.id);
                  expect(worker2.status).to.equal(worker1.status);
                  done();
                }
              });
            }
          });
        });

        it('should return a running worker after the queue time set in the MockBrowserstack instance', function(done) {
          this.timeout(3000);
          client.createWorker({
            os: 'hello',
            browser: 'goodbye',
            version: 'huh'
          }, function(error, worker1) {
            if (error) {
              expect().fail('could not create worker');
            } else {
              setTimeout(function() {
                client.getWorker(worker1.id, function(error, worker2) {
                  if (error) {
                    expect().fail('could not get worker');
                  } else {
                    expect(worker1.status).to.equal('queue');
                    expect(worker2.status).to.equal('running');
                    done();
                  }
                });
              }, QUEUE_TIME);
            }
          });
        });

        it('should not be able to find a worker after the termination timeout set on creation', function(done) {
          this.timeout(4000);
          client.createWorker({
            os: 'hello',
            browser: 'goodbye',
            version: 'huh',
            timeout: TERMINATION_TIME
          }, function(error, worker1) {
            if (error) {
              expect().fail('could not create worker');
            } else {
              setTimeout(function() {
                client.getWorker(worker1.id, function(error, worker2) {
                  expect(error.message).to.equal('no such worker');
                  expect(worker2).to.not.be.ok();
                  done();
                });
              }, TERMINATION_TIME);
            }
          });
        });
      });

      describe('#getWorkers', function() {
        it('should return a snapshot array of all the workers currently active', function(done) {
          // start a new MockBrowserstack and client instance for this test
          mockBrowserstack = new MockBrowserstack(testBrowsers, QUEUE_TIME);
          client = mockBrowserstack.createClient({
            username: 'hello',
            password: 'goodbye',
            version: 'apple',
            server: 'banana'
          });

          // now we know that we have no active workers initially
          // TODO
          done();
        });
      });
    });
  });
});
