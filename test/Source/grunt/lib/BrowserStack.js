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
  version: 'huh'
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

  beforeEach(function() {
    MOCK_BROWSERSTACK.reset();
    client = MOCK_BROWSERSTACK.createClient({
      username: USERNAME,
      password: PASSWORD,
      version: 2
    });
    authorizedBrowserStack = new BrowserStack({
      username: USERNAME,
      password: PASSWORD,
      browsers: WORKERS
    });
    unauthorizedBrowserStack = new BrowserStack({
      username: BAD_USERNAME,
      password: BAD_PASSWORD,
      browsers: WORKERS
    });
    invalidBrowserStack = new BrowserStack({
      username: USERNAME,
      password: PASSWORD,
      browsers: WORKERS.concat([INVALID_BROWSER])
    });
  });

  describe('#start', function() {
    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.start(function(errors, workers) {
        expect(errors.length).to.equal(2);
        expect(errors[0].message).to.equal('not authorized');
        expect(errors[1].message).to.equal('not authorized');
        expect(workers).to.not.be.ok();
        done();
      });
    });

    it('should fail if a worker cannot be started and terminate any workers that were started', function(done) {
      invalidBrowserStack.start(function(errors, workers) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('invalid browser settings');
        expect(workers).to.not.be.ok();
        client.getWorkers(function(error, workers) {
          if (error) {
            expect().fail('error encountered querying workers: ' + error);
          } else {
            expect(workers.length).to.equal(0);
            done();
          }
        });
      });
    });

    it('should return a list of started workers', function(done) {
      authorizedBrowserStack.start(function(errors, workers) {
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
              checklist.check(browser);
            }
          });
        });
      });
    });
  });

  describe('#stop', function() {
    var testWorkers;

    beforeEach(function(done) {
      authorizedBrowserStack.start(function(errors, workers) {
        testWorkers = workers;
        done();
      });
    });

    it('should fail if not authorized', function(done) {
      unauthorizedBrowserStack.stop(testWorkers, function(errors) {
        expect(errors.length).to.equal(2);
        expect(errors[0].message).to.equal('not authorized');
        expect(errors[1].message).to.equal('not authorized');
        done();
      });
    });

    it('should fail if not authorized and no workers specified', function(done) {
      unauthorizedBrowserStack.stop(function(errors) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('not authorized');
        done();
      });
    });

    it('should fail if a worker cannot be terminated', function(done) {
      authorizedBrowserStack.stop(testWorkers.concat([{id: 'invalid'}]), function(errors) {
        expect(errors.length).to.equal(1);
        expect(errors[0].message).to.equal('no such worker');
        done();
      });
    });

    it('should terminate only the workers specified', function(done) {
      client.createWorker(VALID_BROWSER_1, function(error, extraWorker) {
        authorizedBrowserStack.stop(testWorkers, function(errors) {
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

    it('should terminate all the workers if none specified', function(done) {
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
              checklist.check(extraWorker, new Error('extra worker was not stopped'));
            } else {
              checklist.check(extraWorker);
            }
          });
        });
      });
    });
  });
});