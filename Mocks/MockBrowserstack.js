var expect = require('expect.js'),
    uuid = require('node-uuid');

var DEFAULT_QUEUE_TIME = 1000;
var DEFAULT_TERMINATION_TIME = 1800 * 1000;

function MockBrowserstackWorker(settings) {
  var self = this;
  self.os = settings.os;
  self.browser = settings.browser;
  self.device = settings.device;
  self.url = settings.url;
  self.version = settings.version;
  self.id = settings.id || uuid.v1();
  self.status = settings.status || 'queue';
}

function MockBrowserstackClient(mockBrowserstack, settings) {
  var self = this;

  self.username = settings.username;
  self.password = settings.password;
  self.version = settings.version;
  self.server = settings.server;

  self.getBrowsers = function(callback) {
    mockBrowserstack.getBrowsers(callback);
  };

  self.createWorker = function(settings, callback) {
    mockBrowserstack.createWorker(settings, callback);
  };

  self.getWorker = function(id, callback) {
    mockBrowserstack.getWorker(id, callback);
  };

  self.getWorkers = function(callback) {
    mockBrowserstack.getWorkers(callback);
  };

  self.terminateWorker = function(id, callback) {
    mockBrowserstack.terminateWorker(id, callback);
  };
}

function MockBrowserstack(browsers, queueTime) {
  var self = this,
      workers = [];

  var checkBrowser = function(settings, callback) {
    var isValid = false;
    browsers.forEach(function(browser) {
      if (
        browser.os === settings.os && (
          (browser.device && browser.device === settings.device) || 
          (browser.browser && browser.browser === settings.browser)
        ) &&
        browser.version === settings.version
      ) {
        isValid = true;
      }
    });
    callback(isValid);
  };

  self.createWorker = function(settings, callback) {
    checkBrowser(settings, function(isValid) {
      if (isValid) {
        var worker = new MockBrowserstackWorker(settings);
        workers[worker.id] = worker;

        setTimeout(function() {
          worker.status = 'running';
          worker.started = new Date().getTime();
          setTimeout(function() {
            delete workers[worker.id];
          }, settings.timeout || DEFAULT_TERMINATION_TIME);
        }, queueTime || DEFAULT_QUEUE_TIME);

        callback(null, new MockBrowserstackWorker(worker));
      } else {
        callback(new Error('invalid browser settings'));
      }
    });
  };

  self.getWorker = function(id, callback) {
    var worker = workers[id];
    if (worker) {
      callback(null, new MockBrowserstackWorker(worker));
    } else {
      callback(new Error('no such worker'));
    }
  };

  self.getWorkers = function(callback) {
    var workersSnapshot = [];
    Object.keys(workers).forEach(function(key) {
      workersSnapshot.push(new MockBrowserstackWorker(workers[key]));
    });
    callback(null, workersSnapshot);
  };

  self.terminateWorker = function(id, callback) {
    var now = new Date().getTime();
    var worker = workers[id];
    if (worker) {
      var time = 0;
      if (worker.started) {
        time = now - worker.started;
      }
      delete workers[id];
      callback(null, {time: time});
    } else {
      callback(new Error('no such worker'));      
    }
  };

  self.getBrowsers = function(callback) {
    callback(null, browsers);
  };

  self.createClient = function(settings) {
    return new MockBrowserstackClient(self, settings);
  };
}

module.exports = MockBrowserstack;