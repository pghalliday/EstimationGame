var expect = require('expect.js'),
    uuid = require('node-uuid');

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

  };
}

function MockBrowserstack(browsers, queueTime) {
  var self = this;

  self.workers = [];
  self.queueTime = queueTime;

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
        self.workers[worker.id] = worker;

        setTimeout(function() {
          worker.status = 'running';
        }, queueTime);

        setTimeout(function() {
          delete self.workers[worker.id];
        }, settings.timeout || DEFAULT_TERMINATION_TIME);

        callback(null, new MockBrowserstackWorker(worker));
      } else {
        callback(new Error('invalid browser settings'));
      }
    });
  };

  self.getWorker = function(id, callback) {
    var worker = self.workers[id];
    if (worker) {
      callback(null, new MockBrowserstackWorker(worker));
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