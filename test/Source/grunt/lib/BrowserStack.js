var expect = require('expect.js'),
    MockBrowserstack = require('../../../../Mocks/MockBrowserstack'),
    proxyquire =  require('proxyquire'),
    Checklist = require('checklist');

var VALID_BROWSER_1 = {
  os: 'apple',
  browser: 'banana',
  version: 'pear'
};
var VALID_BROWSER_2 = {
  os: 'hello',
  browser: 'goodbye',
  version: 'huh',
  url: 'another url'
};
var VALID_BROWSER_3 = {
  os: 'foo',
  device: 'bar',
  version: 'foobar'
};
var INVALID_BROWSER = {
  os: 'invalid',
  browser: 'invalid',
  version: 'invalid'
};

var BROWSERS = [
  VALID_BROWSER_1,
  VALID_BROWSER_2,
  VALID_BROWSER_3
];

var WORKERS = [
  VALID_BROWSER_2,
  VALID_BROWSER_3
];

var QUEUE_TIME = 200;
var USERNAME = 'username';
var PASSWORD = 'password';
var BAD_USERNAME = 'badusername';
var BAD_PASSWORD = 'badpassword';
var URL = 'url';
var TIMEOUT = 2000;
var QUEUE_TIMEOUT = 100;

var START_PARAMS = {
  browsers: WORKERS,
  url: URL,
  timeout: TIMEOUT
};
var INVALID_START_PARAMS = {
  browsers: WORKERS.concat([INVALID_BROWSER]),
  url: URL,
  timeout: TIMEOUT
};
var QUEUE_TIMEOUT_START_PARAMS = {
  browsers: WORKERS,
  url: URL,
  timeout: TIMEOUT,
  queueTimeout: QUEUE_TIMEOUT
};

var MOCK_BROWSERSTACK = new MockBrowserstack({
  browsers: BROWSERS,
  queueTime: QUEUE_TIME,
  username: USERNAME,
  password: PASSWORD
});

var BrowserStack = proxyquire(
  '../../../../Source/grunt/lib/BrowserStack',
  __dirname, {
    'browserstack': MOCK_BROWSERSTACK
});

describe('BrowserStack', function() {
  var client;
  var authorizedBrowserStack;
  var unauthorizedBrowserStack;
  var invalidBrowserStack;
  var timeoutBrowserStack;

  beforeEach(function() {
    MOCK_BROWSERSTACK.reset();
    client = MOCK_BROWSERSTACK.createClient({
      username: USERNAME,
      password: PASSWORD,
      version: 2
    });
    authorizedBrowserStack = new BrowserStack({
      username: USERNAME,
      password: PASSWORD
    });
    unauthorizedBrowserStack = new BrowserStack({
      username: BAD_USERNAME,
      password: BAD_PASSWORD
    });
  });

  describe('#start', function() {
    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        expect(errors.length).to.equal(2);
        expect(errors[0].message).to.equal('not authorized');
        expect(errors[1].message).to.equal('not authorized');
        expect(workers).to.not.be.ok();
        client.getWorkers(function(error, workers) {
          expect(error).to.not.be.ok();
          expect(workers.length).to.equal(0);
          done();
        });
      });
    });

    it('should fail if a worker cannot be started and terminate any workers that were started', function(done) {
      authorizedBrowserStack.start(INVALID_START_PARAMS, function(errors, workers) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('invalid browser settings');
        expect(workers).to.not.be.ok();
        client.getWorkers(function(error, workers) {
          expect(error).to.not.be.ok();
          expect(workers.length).to.equal(0);
          done();
        });
      });
    });

    it('should return a list of running workers pointing at the correct URL', function(done) {
      authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        expect(errors).to.not.be.ok();
        expect(workers.length).to.equal(2);
        var checklist = new Checklist(WORKERS, done);
        workers.forEach(function(worker) {
          WORKERS.forEach(function(browser) {
            if (
              browser.os === worker.os && (
                (browser.device && browser.device === worker.device) || 
                (browser.browser && browser.browser === worker.browser)
              ) &&
              browser.version === worker.version
            ) {
              if (
                (browser.url || URL) === worker.url &&
                'running' === worker.status &&
                TIMEOUT === worker.timeout
              ) {
                checklist.check(browser);
              } else {
                checklist.check(browser, new Error('worker not correct'));
              }
            }
          });
        });
      });
    });

    it('should fail if an error is encountered while waiting for workers to start', function(done) {
      authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        expect(workers).to.not.be.ok();
        expect(errors.length).to.equal(3);
        expect(errors[0].message).to.equal('no such worker');
        expect(errors[1].message).to.equal('no such worker');
        expect(errors[2].message).to.equal('no such worker');
        client.getWorkers(function(error, workers) {
          expect(error).to.not.be.ok();
          expect(workers.length).to.equal(0);
          done();
        });
      });
      client.getWorkers(function(error, workers) {
        workers.forEach(function(worker) {
          client.terminateWorker(worker.id, function() {
            // do nothing
          });
        });
      });
    });

    it('should fail if workers are not running within specified timeout value', function(done) {
      authorizedBrowserStack.start(QUEUE_TIMEOUT_START_PARAMS, function(errors, workers) {
        expect(workers).to.not.be.ok();
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('timed out');
        client.getWorkers(function(error, workers) {
          expect(error).to.not.be.ok();
          expect(workers.length).to.equal(0);
          done();
        });
      });
    });
         
    it('should fail if already started', function(done) {
      authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        expect(errors).to.not.be.ok();
        authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
          expect(errors.length).to.equal(1);
          expect(errors[0].message).to.equal('already started');
          done();
        });
      });
    });
  });

  describe('#stop', function() {
    it('should fail if not started', function(done) {
      authorizedBrowserStack.stop(function(errors) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('not started');
        done();
      });
    });
    
    describe('when started', function() {
      var testWorkers;
      
      beforeEach(function(done) {
        authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
          testWorkers = workers;
          done();
        });
      });

      it('should fail if a worker cannot be terminated', function(done) {
        client.terminateWorker(testWorkers[1].id, function(error) {
          authorizedBrowserStack.stop(function(errors) {
            expect(errors.length).to.equal(1);
            expect(errors[0].message).to.equal('no such worker');
            done();
          });
        });
      });

      it('should terminate all (and only) the workers previously started by this instance', function(done) {
        client.createWorker(VALID_BROWSER_1, function(error, extraWorker) {
          authorizedBrowserStack.stop(function(errors) {
            expect(errors).to.not.be.ok();
            var checklist = new Checklist(testWorkers.concat(extraWorker), done);
            testWorkers.forEach(function(testWorker) {
              client.getWorker(testWorker.id, function(error, worker) {
                if (worker) {
                  checklist.check(testWorker, new Error('worker was not stopped'));
                } else {
                  checklist.check(testWorker);
                }
              });
            });
            client.getWorker(extraWorker.id, function(error, worker) {
              if (worker) {
                checklist.check(extraWorker);
              } else {
                checklist.check(extraWorker, new Error('extra worker was stopped'));
              }
            });
          });
        });
      });
    });
  });
  
  describe('#stopThese', function() {
    var startedWorkers;
    
    beforeEach(function(done) {
      startedWorkers = [];
      client.createWorker(VALID_BROWSER_1, function(error, worker) {
        startedWorkers.push(worker);
        client.createWorker(VALID_BROWSER_2, function(error, worker) {
          startedWorkers.push(worker);
          client.createWorker(VALID_BROWSER_3, function(error, worker) {
            startedWorkers.push(worker);
            done();
          });
        });
      });
    });
    
    it('should fail if started', function(done) {
      authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        authorizedBrowserStack.stopThese([startedWorkers[0], startedWorkers[2]], function(errors) {
          expect(errors.length).to.equal(1);
          expect(errors[0].message).to.equal('has been started use stop() instead');
          done();
        });
      });
    });

    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.stopThese([startedWorkers[0], startedWorkers[2]], function(errors) {
        expect(errors.length).to.equal(2);
        expect(errors[0].message).to.equal('not authorized');
        expect(errors[1].message).to.equal('not authorized');
        done();
      });
    });

    it('should report errors for workers that could not be terminated', function(done) {
      client.terminateWorker(startedWorkers[0].id, function(error) {
        authorizedBrowserStack.stopThese([startedWorkers[0], startedWorkers[2]], function(errors) {
          expect(errors.length).to.equal(1);
          expect(errors[0].message).to.equal('no such worker');
          done();
        });
      });
    });
    
    it('should terminate only the workers specified', function(done) {
      authorizedBrowserStack.stopThese([startedWorkers[0], startedWorkers[2]], function(errors) {
        expect(errors).to.not.be.ok();
        client.getWorkers(function(error, workers) {
          expect(error).to.not.be.ok();
          expect(workers.length).to.equal(1);
          expect(workers[0].id).to.equal(startedWorkers[1].id);
          done();
        });
      });
    });
  });

  describe('#clean', function() {
    it('should fail if started', function(done) {
      authorizedBrowserStack.start(START_PARAMS, function(errors, workers) {
        authorizedBrowserStack.clean(function(errors) {
          expect(errors.length).to.equal(1);
          expect(errors[0].message).to.equal('has been started use stop() instead');
          done();
        });
      });
    });

    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.clean(function(errors) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('not authorized');
        done();
      });
    });

    it('should terminate all the workers', function(done) {
      client.createWorker(VALID_BROWSER_1, function(error, extraWorker) {
        client.createWorker(VALID_BROWSER_2, function(error, extraWorker) {
          client.createWorker(VALID_BROWSER_3, function(error, extraWorker) {
            authorizedBrowserStack.clean(function(errors) {
              expect(errors).to.not.be.ok();
              client.getWorkers(function(error, workers) {
                expect(error).to.not.be.ok();
                expect(workers.length).to.equal(0);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#list', function() {
    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.list(function(error, browsers) {
        expect(error.message).to.equal('not authorized');
        expect(browsers).to.not.be.ok();
        done();
      });
    });

    it('should list all available browsers', function(done) {
      client.createWorker(VALID_BROWSER_1, function(error, extraWorker) {
        client.createWorker(VALID_BROWSER_2, function(error, extraWorker) {
          client.createWorker(VALID_BROWSER_3, function(error, extraWorker) {
            authorizedBrowserStack.list(function(error, browsers) {
              expect(error).to.not.be.ok();
              expect(browsers.length).to.equal(3);
              expect(browsers).to.equal(BROWSERS);
              done();
            });
          });
        });
      });
    });
  });
});