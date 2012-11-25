var browserstack = require('browserstack'),
    async = require('async');

var DEFAULT_QUEUE_TIME = 10000;

function BrowserStack(options) {
  var self = this,
      workers = null,
      startCallback,
      queueStartTime;
  
  function cleanUp(client, errors, callback) {
    async.forEach(workers, function(worker, callback) {
      client.terminateWorker(worker.id, function(error) {
        // add any errors to the errors array
        if (error) {
          errors.push(error);
        }
        callback();
      });
    }, function(error) {
      // error should be nothing as we never callback with one!
      workers = null;
      callback(errors);
    });
  }
  
  function checkRunning() {
    var client = browserstack.createClient({
      username: options.username,
      password: options.password,
      version: 2
    });
    var now = new Date().getTime();
    if ((now - queueStartTime) > (options.queueTimeout || DEFAULT_QUEUE_TIME)) {
      // there was an error getting the worker and there shouldn't be, cleanup and callback
      cleanUp(client, [new Error('timed out')], startCallback);
    } else {
      var notRunningCount = 0;
      var runningWorkers = [];
      async.forEach(workers, function(worker, callback) {
        client.getWorker(worker.id, function(error, worker) {
          if (error) {
            callback(error);
          } else {
            if (worker.status !== 'running') {
              notRunningCount++;
            } else {
              runningWorkers.push(worker);
            }
            callback();
          }
        });
      }, function(error) {
        if (error) {
          // there was an error getting the worker and there shouldn't be, cleanup and callback
          cleanUp(client, [error], startCallback);
        } else {
          if (notRunningCount === 0) {
            // all workers are running, callback
            workers = runningWorkers;
            startCallback(null, workers);
          } else {
            // let's check again as soon as we can
            process.nextTick(checkRunning);
          }
        }
      });
    }
  }
  
  self.start = function(callback) {
    if (workers) {
      callback([new Error('already started')]);
    } else {
      queueStartTime = new Date().getTime();
      var client = browserstack.createClient({
        username: options.username,
        password: options.password,
        version: 2
      });
      var errors = [];
      workers = [];
      async.forEach(options.browsers, function(browser, callback) {
        browser.url = browser.url || options.url;
        browser.timeout = browser.timeout || options.timeout;
        client.createWorker(browser, function(error, worker) {
          if (error) {
            errors.push(error);
          } else {
            workers.push(worker);
          }
          callback();
        });
      }, function(error) {
        // error should be nothing as we never callback with one!
        if (errors.length) {
          cleanUp(client, errors, callback);
        } else {
          // lets wait for all workers to start running
          startCallback = callback;
          process.nextTick(checkRunning);
        }
      });
    }
  };

  function stopWorkers(client, workers, callback) {
    var errors = [];
    async.forEach(workers, function(worker, callback) {
      client.terminateWorker(worker.id, function(error) {
        if (error) {
          errors.push(error);
        }
        callback();
      });
    }, function(error) {
      // error should be nothing as we never callback with one!
      if (errors.length) {
        callback(errors);
      } else {
        callback();
      }
    });
  }

  self.stop = function(callback) {
    if (workers) {
      var client = browserstack.createClient({
        username: options.username,
        password: options.password,
        version: 2
      });
      stopWorkers(client, workers, function(errors) {
        workers = null;
        callback(errors);
      });
    } else {
      callback([new Error('not started')]);
    }
  };

  self.stopThese = function(workersToStop, callback) {
    if (workers) {
      callback([new Error('has been started use stop() instead')]);
    } else {
      var client = browserstack.createClient({
        username: options.username,
        password: options.password,
        version: 2
      });
      stopWorkers(client, workersToStop, callback);
    }
  };

  self.stopAll = function(callback) {
    if (workers) {
      callback([new Error('has been started use stop() instead')]);
    } else {
      var client = browserstack.createClient({
        username: options.username,
        password: options.password,
        version: 2
      });
      client.getWorkers(function(error, allWorkers) {
        if (error) {
          callback([error]);
        } else {
          stopWorkers(client, allWorkers, callback);
        }
      });
    }
  };
}

module.exports = BrowserStack;