var browserstack = require('browserstack'),
    async = require('async');

function BrowserStack(options) {
  var self = this,
      workers = null;
  
  self.start = function(callback) {
    if (workers) {
      callback([new Error('already started')]);
    } else {
      var client = browserstack.createClient({
        username: options.username,
        password: options.password,
        version: 2
      });
      var errors = [];
      workers = [];
      async.forEach(options.browsers, function(browser, callback) {
        browser.url = browser.url || options.url;
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
        } else {
          callback(null, workers);
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